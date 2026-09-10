import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import router from './routes';
import { LocalStorageService } from './services/storage';

const app = express();

// Trust reverse proxies (Render, Hostinger, Cloudflare) for IP and Protocol resolution
app.set('trust proxy', 1);

// Enable CORS
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

// Secure Express apps by setting various HTTP headers
app.use(helmet());

// HTTP Request Logger
app.use(morgan('dev'));

// Body Parsers
app.use(express.json());
app.use(express.text({ type: ['text/plain', 'text/json', 'application/json', '*/*'] }));
app.use(express.urlencoded({ extended: true }));

// Automatic JSON parse fallback for Postman requests sent with Text format
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (typeof req.body === 'string') {
    try {
      req.body = JSON.parse(req.body);
    } catch (e) {}
  }
  next();
});

// Create uploads directory if it doesn't exist
const uploadDir = path.resolve(__dirname, '../uploads');
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (e) {
  // Ignore filesystem creation errors on serverless read-only platforms (Vercel)
}

// Serve uploaded files securely using signed URL validation middleware
app.use('/uploads', (req: Request, res: Response, next: NextFunction) => {
  const localService = new LocalStorageService();
  const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  
  const isValid = localService.verifySignedUrl(fullUrl);
  
  if (!isValid && process.env.NODE_ENV === 'production') {
    res.status(403).json({
      success: false,
      message: 'Access Denied: Invalid or expired signed URL reference',
      error: { code: 'FORBIDDEN_FILE_ACCESS' }
    });
    return;
  }
  
  next();
}, express.static(uploadDir));

// Helper to locate compiled React frontend/dist folder across various server entry locations
const getFrontendDistPath = (): string | null => {
  const candidates = [
    path.resolve(process.cwd(), 'frontend/dist'),
    path.resolve(process.cwd(), 'dist'),
    path.resolve(__dirname, '../../frontend/dist'),
    path.resolve(__dirname, '../dist'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.existsSync(path.join(candidate, 'index.html'))) {
      return candidate;
    }
  }
  return null;
};

const frontendDistPath = getFrontendDistPath();

if (frontendDistPath) {
  app.use(express.static(frontendDistPath));
}

// Welcome Root Endpoint (Fallback if static frontend index.html is not matched)
app.get('/', (_req: Request, res: Response) => {
  const targetDist = getFrontendDistPath();
  if (targetDist) {
    return res.sendFile(path.join(targetDist, 'index.html'));
  }
  res.status(200).json({
    success: true,
    message: 'WithMe24 Backend REST API service is active and running.',
    version: '1.0.0',
    swaggerDocs: '/api/docs',
    healthCheck: '/api/health',
  });
});

// Wildcard route for SPA client-side routing
app.get('*', (req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  const targetDist = getFrontendDistPath();
  if (targetDist) {
    return res.sendFile(path.join(targetDist, 'index.html'));
  }
  next();
});

// Mount REST router
app.use('/api', router);

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[GlobalErrorHandler]:', err);
  
  const status = err.status || err.statusCode || 500;
  return res.status(status).json({
    success: false,
    message: err.message || 'An unexpected error occurred on the server',
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
  });
});

export default app;
