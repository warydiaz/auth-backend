import { Inject, Injectable } from '@nestjs/common';
import { LoginUserCommandHandler } from './login-user.command-handler';
import { JwtGeneratorPort } from './ports/jwt-generator.port';
import { TokenStorePort } from './ports/token-store.port';
import { LoginUserCommand } from './login-user.command';

@Injectable()
export class LoginService {
  constructor(
    private readonly loginHandler: LoginUserCommandHandler,
    @Inject('TokenStorePort') private readonly tokenStore: TokenStorePort,
    @Inject('JwtGeneratorPort') private readonly jwtGenerator: JwtGeneratorPort,
  ) {}

  async execute(email: string, password: string): Promise<string> {
    const user = await this.loginHandler.handle(
      new LoginUserCommand(email, password),
    );
    const token = this.jwtGenerator.generate(user.id, email);
    await this.tokenStore.save(user.id, token);
    return token;
  }
}
