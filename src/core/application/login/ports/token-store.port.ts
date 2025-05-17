export interface TokenStorePort {
  save(userId: string, token: string, timeStore?: number): Promise<void>;
  getUserIdFromToken(token: string): Promise<string | null>;
  invalidate(token: string): Promise<void>;
}

export const TOKEN_STORE = Symbol('TOKEN_STORE');
