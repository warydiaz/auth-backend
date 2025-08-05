/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { UserRepository } from '../../domain/user/user.repository';
import { TokenStorePort } from '../login/ports/token-store.port';
import { ResetPasswordCommand } from './reset-password.command';
import { NewCredentialsInvalidError } from './reset-password-new-credentials.error';
import * as bcrypt from 'bcrypt';
import { ResetPasswordCommandHandler } from './reset-password.command.handler';

describe('ResetPasswordCommandHandler', () => {
  let handler: ResetPasswordCommandHandler;
  let userRepository: jest.Mocked<UserRepository>;
  let tokenStore: jest.Mocked<TokenStorePort>;

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      updatePassword: jest.fn(),
    } as any;

    tokenStore = {
      getUserIdFromToken: jest.fn(),
      invalidate: jest.fn(),
    } as any;

    handler = new ResetPasswordCommandHandler(userRepository, tokenStore);

    jest
      .spyOn(bcrypt, 'hash')
      .mockImplementation(async () => 'hashed-password');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should throw InvalidToken error if token is invalid', async () => {
    tokenStore.getUserIdFromToken.mockResolvedValue(null);

    await expect(
      handler.handle(new ResetPasswordCommand('invalid-token', 'newPass123')),
    ).rejects.toThrow(NewCredentialsInvalidError.InvalidToken());
  });

  it('should throw InvalidEmail error if user not found', async () => {
    tokenStore.getUserIdFromToken.mockResolvedValue('user-id-123');
    userRepository.findById.mockResolvedValue(null);

    await expect(
      handler.handle(new ResetPasswordCommand('valid-token', 'newPass123')),
    ).rejects.toThrow(NewCredentialsInvalidError.InvalidEmail());
  });

  it('should hash password, update password and invalidate token when data is valid', async () => {
    tokenStore.getUserIdFromToken.mockResolvedValue('user-id-123');
    userRepository.findById.mockResolvedValue({ id: 'user-id-123' } as any);
    userRepository.updatePassword.mockResolvedValue(undefined);
    tokenStore.invalidate.mockResolvedValue(undefined);

    await handler.handle(new ResetPasswordCommand('valid-token', 'newPass123'));

    expect(bcrypt.hash).toHaveBeenCalledWith('newPass123', handler.saltRounds);
    expect(userRepository.updatePassword).toHaveBeenCalledWith(
      'user-id-123',
      'hashed-password',
    );
    expect(tokenStore.invalidate).toHaveBeenCalledWith('valid-token');
  });
});
