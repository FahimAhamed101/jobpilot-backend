// global.d.ts
import { JwtPayload } from 'jsonwebtoken';
import { Server } from 'socket.io';

declare global {
  // Extending Express.Request to include the user property
  namespace Express {
    interface Request {
      user: JwtPayload;
    }
  }
  namespace NodeJS {
    interface Global {
      io: Server;
    }
  }
}

declare namespace NodeJS {
  interface Global {
    io: SocketIO.Server;
  }
}

declare const global: NodeJS.Global;