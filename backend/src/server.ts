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
    console.log('[Server] Connecting to database...');

    let connected = false;

    // Try primary connection
    try {
      await sequelize.authenticate();
      console.log('[Server] Database connection established successfully.');
      connected = true;
    } catch (dbErr: any) {
      console.warn('[Server] Primary local DB connection notice:', dbErr.message);
    }

    // Failover to Remote MySQL database if local DB failed and remote credentials exist
    if (!connected && process.env.REMOTE_DB_HOST) {
      try {
        console.log(`[Server] Connecting to remote MySQL database (${process.env.REMOTE_DB_HOST})...`);
        const remoteHost = process.env.REMOTE_DB_HOST;
        const remotePort = parseInt(process.env.REMOTE_DB_PORT || '3306', 10);
        const remoteUser = process.env.REMOTE_DB_USER || '';
        const remotePass = process.env.REMOTE_DB_PASSWORD || '';
        const remoteDb = process.env.REMOTE_DB_NAME || '';

        (sequelize.config as any).host = remoteHost;
        (sequelize.config as any).port = remotePort;
        (sequelize.config as any).database = remoteDb;
        (sequelize.config as any).username = remoteUser;
        (sequelize.config as any).password = remotePass;

        (sequelize as any).connectionManager.config.host = remoteHost;
        (sequelize as any).connectionManager.config.port = remotePort;
        (sequelize as any).connectionManager.config.database = remoteDb;
        (sequelize as any).connectionManager.config.username = remoteUser;
        (sequelize as any).connectionManager.config.password = remotePass;

        // Close old pool if open
        if ((sequelize as any).connectionManager.pool) {
          try {
            await (sequelize as any).connectionManager.pool.destroyAllNow();
          } catch (e) {}
        }

        await sequelize.authenticate();
        console.log('[Server] Remote database connection established successfully!');
        connected = true;
      } catch (remoteErr: any) {
        console.error('[Server] Remote database connection failed:', remoteErr.message);
      }
    }

    if (!connected) {
      console.warn('[Server] WARNING: Database connection unavailable. API requests requiring DB may fail until MySQL is active.');
    }

    app.listen(PORT, () => {
      console.log(`[Server] WithMe24 service is running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
    });
  } catch (error) {
    console.error('[Server] Error starting service:', error);
  }
}

startServer();
