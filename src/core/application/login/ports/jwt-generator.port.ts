export interface JwtGeneratorPort {
  generate(userId: string, email: string): string;
}

export const JWT_GENERATOR = Symbol('JwtGeneratorPort');
