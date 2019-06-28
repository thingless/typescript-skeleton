declare module '*';

declare namespace Express {
  export interface Request {
    uid: string;
    user: import("./dal/model").User;
  }
}
