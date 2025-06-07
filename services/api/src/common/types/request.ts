export interface ReqUser {
  sub: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: ReqUser;
    }
  }
}
