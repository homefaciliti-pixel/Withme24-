import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface StorageService {
  uploadFile(file: Express.Multer.File): Promise<string>;
  getSignedUrl(fileUrl: string): Promise<string>;
  verifySignedUrl(fullUrl: string): boolean;
}

export class LocalStorageService implements StorageService {
  private uploadDir = path.resolve(__dirname, '../../uploads');

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const fileExt = path.extname(file.originalname);
    const fileName = `${crypto.randomUUID()}${fileExt}`;
    const filePath = path.join(this.uploadDir, fileName);
    
    fs.writeFileSync(filePath, file.buffer);
    return `/uploads/${fileName}`;
  }

  async getSignedUrl(fileUrl: string): Promise<string> {
    const expires = Date.now() + 15 * 60 * 1000; // 15 minutes
    const signature = crypto
      .createHmac('sha256', process.env.JWT_SECRET || 'secret')
      .update(`${fileUrl}:${expires}`)
      .digest('hex');
    
    // Serve from the backend server URL
    const backendUrl = `http://localhost:${process.env.PORT || 5000}`;
    return `${backendUrl}${fileUrl}?expires=${expires}&signature=${signature}`;
  }

  verifySignedUrl(fullUrl: string): boolean {
    try {
      const url = new URL(fullUrl);
      const fileUrl = url.pathname;
      const expires = parseInt(url.searchParams.get('expires') || '0', 10);
      const signature = url.searchParams.get('signature');

      if (Date.now() > expires) {
        return false;
      }

      const expectedSignature = crypto
        .createHmac('sha256', process.env.JWT_SECRET || 'secret')
        .update(`${fileUrl}:${expires}`)
        .digest('hex');

      return signature === expectedSignature;
    } catch (e) {
      return false;
    }
  }
}

export class S3StorageService implements StorageService {
  async uploadFile(file: Express.Multer.File): Promise<string> {
    // In production: use new S3Client & PutObjectCommand from @aws-sdk/client-s3
    return `https://${process.env.AWS_S3_BUCKET || 'withme24-kyc'}.s3.${
      process.env.AWS_REGION || 'ap-south-1'
    }.amazonaws.com/kyc/${crypto.randomUUID()}-${file.originalname}`;
  }

  async getSignedUrl(fileUrl: string): Promise<string> {
    // In production: use getSignedUrl helper from @aws-sdk/s3-request-presigner
    return `${fileUrl}?Expires=900&Signature=MockS3Signature`;
  }

  verifySignedUrl(_fullUrl: string): boolean {
    // S3 verification is done natively by S3 when the file is requested
    return true;
  }
}

export const getStorageService = (): StorageService => {
  if (process.env.STORAGE_PROVIDER === 'aws' || process.env.STORAGE_PROVIDER === 's3') {
    return new S3StorageService();
  }
  return new LocalStorageService();
};
