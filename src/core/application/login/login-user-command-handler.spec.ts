/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { UserEntity } from '../../domain/user/user.entity';
import { LoginUserCommand, UserDataCommand } from './login-user.command';
import { LoginUserCommandHandler } from './login-user.command-handler';
import { UserRepository } from '../../domain/user/user.repository';

describe('LoginUserCommandHandler', () => {
  let handler: LoginUserCommandHandler;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    userRepository = {
      validate: jest.fn(),
    } as any;

    handler = new LoginUserCommandHandler(userRepository);
  });

  it('should validate the user and return user data', async () => {
    const command = new LoginUserCommand('test@example.com', 'longsecret');
    const fakeUser = UserEntity.create('test@example.com', 'longsecret', '1');

    userRepository.validate.mockResolvedValue(fakeUser);

    const result = await handler.handle(command);

    expect(userRepository.validate).toHaveBeenCalledTimes(1);

    expect(userRepository.validate).toHaveBeenCalledWith(
      expect.any(UserEntity),
    );

    expect(result).toBeInstanceOf(UserDataCommand);
    expect(result.id).toBe('1');
    expect(result.email).toBe('test@example.com');
  });

  it('should throw if the repository throws', async () => {
    const command = new LoginUserCommand('test@example.com', 'longsecret');
    userRepository.validate.mockRejectedValue(new Error('Invalid credentials'));

    await expect(handler.handle(command)).rejects.toThrow(
      'Invalid credentials',
    );
  });
});
