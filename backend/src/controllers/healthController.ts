import { Request, Response } from 'express';
import { sequelize } from '../models';

export class HealthController {
  /**
   * GET /api/health
   * Verifies service health status, including live connection to MySQL.
   */
  public static async checkHealth(_req: Request, res: Response) {
    try {
      // Direct SQL ping check to ensure MySQL database connection is live
      await sequelize.authenticate();
      
      return res.status(200).json({
        success: true,
        service: 'WithMe24 API',
        database: 'MySQL',
        status: 'healthy',
      });
    } catch (error: any) {
      console.error('[HealthCheck] Unhealthy connection:', error);
      return res.status(500).json({
        success: false,
        service: 'WithMe24 API',
        database: 'MySQL',
        status: 'unhealthy',
        error: {
          code: 'DATABASE_DISCONNECTED',
          message: error.message || 'Could not establish connection to database instance',
        },
      });
    }
  }
}
