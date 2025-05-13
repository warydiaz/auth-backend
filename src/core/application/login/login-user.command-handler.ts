/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { LoginUserCommand, UserDataCommand } from './login-user.command';
import { Inject, Injectable } from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepository,
} from '../../domain/user/user.repository';
import { UserEntity } from 'src/core/domain/user/user.entity';

@Injectable()
export class LoginUserCommandHandler {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async handle(command: LoginUserCommand): Promise<UserDataCommand> {
    const user = UserEntity.create(command.email, command.password);

    return await this.userRepository.validate(user);
  }
}
