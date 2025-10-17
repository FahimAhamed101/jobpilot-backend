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
    mongoose.connect(config.mongoose.url as string);
    logger.info(colors.green('🚀 Database connected successfully'));
    const port =
      typeof config.port === 'number' ? config.port : Number(config.port);
    server = app.listen(port, config.backendIp as string, () => {
      logger.info(
        colors.yellow(
          `♻️  Application listening on port http://${config.backendIp}:${port}/test`
        )
      );
    

    });
 

 
  } catch (error) {
    errorLogger.error(colors.red('🤢 Failed to connect Database'));
  }

 
}
app.get("/", (req, res) => {
      res.send("Lebaba E-commerce Server is running....");
    });


main()
  .then(() => logger.info('✅ Application started successfully'))
  .catch((error) => {
    errorLogger.error('❌ Failed to start application', error);
    process.exit(1);
  });

//SIGTERM
process.on('SIGTERM', () => {
  logger.info('SIGTERM IS RECEIVE');
  if (server) {
    server.close();
  }
});
