/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { RecoverAccountCommand } from './recover-account.command';
import { Inject, Injectable } from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepository,
} from '../../domain/user/user.repository';
import { Email } from 'src/core/domain/user/email';
import { TOKEN_STORE, TokenStorePort } from '../login/ports/token-store.port';
import { MailerService } from 'src/core/infrastructure/email/nodemailer.service';
import * as crypto from 'crypto';

@Injectable()
export class RecoverAccountCommandHandler {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(TOKEN_STORE) private readonly tokenStore: TokenStorePort,
    private readonly mailer: MailerService,
  ) {}

  async handle(command: RecoverAccountCommand): Promise<void> {
    const email = Email.create(command.email);

    const user = await this.userRepository.findByEmail(email);
    if (!user) return;

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);
    const expiresInSeconds = Math.floor(
      (expiresAt.getTime() - Date.now()) / 1000,
    );

    await this.tokenStore.save(user.id!, token, expiresInSeconds);

    const resetLink = `localhost:3001/reset-password/${token}`;
    await this.mailer.sendMail({
      to: user.email.value,
      subject: 'Recuperación de cuenta',
      html: `<p>Haz clic <a href="${resetLink}">aquí</a> para recuperar tu cuenta.</p>`,
    });
  }
}
