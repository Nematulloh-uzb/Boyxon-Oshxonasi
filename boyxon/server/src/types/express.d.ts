declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface User {
      _id?: string;
      id?: string;
      role?: string;
    }
  }
}

export interface AuthUser {
  id: string;
  role: 'user' | 'admin';
  /** Access token ichidagi tokenVersion — tezkor DB filtrlar uchun. */
  ver: number;
}

export interface AuthRequest extends Express.Request {
  user?: AuthUser;
}

export {};
