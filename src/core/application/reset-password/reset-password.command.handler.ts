/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Inject, Injectable } from '@nestjs/common';
import { ResetPasswordCommand } from './reset-password.command';
import {
  USER_REPOSITORY,
  UserRepository,
} from '../../domain/user/user.repository';
import { TOKEN_STORE, TokenStorePort } from '../login/ports/token-store.port';
import { NewCredentialsInvalidError } from './reset-password-new-credentials.error';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ResetPasswordCommandHandler {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(TOKEN_STORE) private readonly tokenStore: TokenStorePort,
  ) {}

  saltRounds: number = parseInt(process.env.SALT_ROUNDS ?? '10');

  async handle(command: ResetPasswordCommand): Promise<void> {
    const userId = await this.tokenStore.getUserIdFromToken(command.token);
    if (!userId) {
      throw NewCredentialsInvalidError.InvalidToken();
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw NewCredentialsInvalidError.InvalidEmail();
    }

    const hashedPassword = await bcrypt.hash(
      command.newPassword,
      this.saltRounds,
    );

    await this.userRepository.updatePassword(user.id!, hashedPassword);
    await this.tokenStore.invalidate(command.token);
  }
}
