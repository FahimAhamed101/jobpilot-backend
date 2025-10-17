import colors from 'colors';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import app from './app';
import dotenv from "dotenv";
import config from './config';
import { errorLogger, logger } from './shared/logger';
import { socketHelper } from './app/socket/socket';
dotenv.config();

let server: any;

async function main() {
  try {
    await mongoose.connect(config.mongoose.url as string);
    logger.info(colors.green('🚀 Database connected successfully'));
    
    const port = process.env.PORT || config.port || 3000;
    const backendIp = process.env.VERCEL ? '0.0.0.0' : config.backendIp;
    
    server = app.listen(port, backendIp as string, () => {
      logger.info(
        colors.yellow(
          `♻️  Application listening on port ${port}`
        )
      );
    });

    // Socket.io - only if not in Vercel production
    if (!process.env.VERCEL) {
      const io = new Server(server, {
        pingTimeout: 60000,
        cors: {
          origin: '*',
        },
      });
      socketHelper.socket(io);
      // @ts-ignore
      global.io = io;
    }

  } catch (error) {
    errorLogger.error(colors.red('🤢 Failed to connect Database'));
  }
}

app.get("/", (req, res) => {
  res.send("Lebaba E-commerce Server is running....");
});

// Export for Vercel
export default app;

// Only run main() if not in Vercel environment
if (!process.env.VERCEL) {
  main();
}

// SIGTERM
process.on('SIGTERM', () => {
  logger.info('SIGTERM IS RECEIVE');
  if (server) {
    server.close();
  }
});