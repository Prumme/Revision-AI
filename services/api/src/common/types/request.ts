import { Request } from 'express';

interface ReqUser {
  sub: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: ReqUser;
    }
  }
}
