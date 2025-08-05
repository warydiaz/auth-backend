/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { UserRepository } from '../../domain/user/user.repository';
import { RecoverAccountCommandHandler } from './recover-account.command-handler';
import { TokenStorePort } from '../login/ports/token-store.port';
import { RecoverAccountCommand } from './recover-account.command';
import { UserEntity } from '../../domain/user/user.entity';
import { MailerService } from '../../infrastructure/email/nodemailer.service';

describe('RecoverAccountCommandHandler', () => {
  let handler: RecoverAccountCommandHandler;
  let userRepository: jest.Mocked<UserRepository>;
  let tokenStore: jest.Mocked<TokenStorePort>;
  let mailer: Partial<jest.Mocked<MailerService>>;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
    } as any;

    tokenStore = {
      save: jest.fn(),
    } as any;

    mailer = {
      sendMail: jest.fn(),
    } as any;

    handler = new RecoverAccountCommandHandler(
      userRepository,
      tokenStore,
      mailer as unknown as MailerService,
    );
  });

  it('should generate a token, save it, and send email when user exists', async () => {
    const command = new RecoverAccountCommand('test@example.com');

    const fakeUser = UserEntity.create('test@example.com', 'longsecret', '1');
    userRepository.findByEmail.mockResolvedValue(fakeUser);

    await handler.handle(command);

    expect(userRepository.findByEmail).toHaveBeenCalledTimes(1);

    expect(tokenStore.save).toHaveBeenCalledTimes(1);
    const [userId, token, ttl] = tokenStore.save.mock.calls[0];
    expect(userId).toBe('1');
    expect(typeof token).toBe('string');
    expect(ttl).toBeGreaterThan(0);

    expect(mailer.sendMail).toHaveBeenCalledTimes(1);
    const emailData = (mailer.sendMail as jest.Mock).mock.calls[0][0];
    expect(emailData.to).toBe('test@example.com');
    expect(emailData.subject).toContain('Recuperación de cuenta');
    expect(emailData.html).toContain('/reset-password/');
  });

  it('should do nothing when user does not exist', async () => {
    const command = new RecoverAccountCommand('nonexistent@example.com');
    userRepository.findByEmail.mockResolvedValue(null);

    await handler.handle(command);

    expect(tokenStore.save).not.toHaveBeenCalled();
    expect(mailer.sendMail).not.toHaveBeenCalled();
  });
});
