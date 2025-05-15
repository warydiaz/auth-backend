export interface TokenStorePort {
  save(userId: string, token: string, timeStore?: number): Promise<void>;
}

export const TOKEN_STORE = Symbol('TOKEN_STORE');
