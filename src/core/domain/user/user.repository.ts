import { UserEntity } from '../../domain/user/user.entity';

export interface UserRepository {
  validate(tester: UserEntity): Promise<{ id: string; email: string }>;
}

export const USER_REPOSITORY = Symbol('UserRepository');
