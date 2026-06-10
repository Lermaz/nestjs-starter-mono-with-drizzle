import type { AuthTokenPayload } from '../../modules/auth/public';

export {};

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      user?: AuthTokenPayload;
    }
  }
}
