import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import router from './routes';
import { LocalStorageService } from './services/storage';

const app = express();

// Enable CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Secure Express apps by setting various HTTP headers
app.use(helmet());

// HTTP Request Logger
app.use(morgan('dev'));

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
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

// Welcome Root Endpoint
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'WithMe24 Backend REST API service is active and running.',
    version: '1.0.0',
    frontendUrl: 'http://localhost:5173',
    swaggerDocs: 'http://localhost:5000/api/docs',
    healthCheck: 'http://localhost:5000/api/health',
  });
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
