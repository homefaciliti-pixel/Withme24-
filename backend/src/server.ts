import dotenv from 'dotenv';
// Load environments before loading app modules
dotenv.config();

import app from './app';
import { sequelize } from './models';

const PORT = process.env.PORT || 5000;

/**
 * Initializes database connectivity and boots the Express REST server.
 */
async function startServer() {
  try {
    console.log('[Server] Connecting to MySQL database...');
    
    try {
      await sequelize.authenticate();
      console.log('[Server] MySQL database connection established successfully.');
    } catch (dbErr: any) {
      console.warn('[Server] Primary database connection notice:', dbErr.message);
      if (dbErr.code === 'ETIMEDOUT' || dbErr.original?.code === 'ETIMEDOUT' || String(dbErr).includes('ETIMEDOUT')) {
        console.log('[Server] Remote port 3306 unreachable locally. Connecting to local MySQL server (127.0.0.1)...');
        (sequelize.config as any).host = '127.0.0.1';
        (sequelize.config as any).database = 'withme24';
        (sequelize.config as any).username = 'root';
        (sequelize.config as any).password = null;
        (sequelize as any).connectionManager.config.host = '127.0.0.1';
        (sequelize as any).connectionManager.config.database = 'withme24';
        (sequelize as any).connectionManager.config.username = 'root';
        (sequelize as any).connectionManager.config.password = null;
        
        await sequelize.authenticate();
        console.log('[Server] MySQL database connection established successfully via local instance.');
      } else {
        throw dbErr;
      }
    }

    app.listen(PORT, () => {
      console.log(`[Server] WithMe24 service is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
    });
  } catch (error) {
    console.error('[Server] Critical error starting WithMe24 service:', error);
    process.exit(1);
  }
}

startServer();
