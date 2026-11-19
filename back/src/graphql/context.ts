import type { AuthPayload } from '../auth/jwt';
export type Context = { usuario: AuthPayload | null };
