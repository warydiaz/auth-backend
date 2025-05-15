import { UserEntity } from '../../domain/user/user.entity';
import { Email } from './email';

export interface UserRepository {
  validate(tester: UserEntity): Promise<{ id: string; email: string }>;
  findByEmail(email: Email): Promise<{ id: string; email: string } | null>;
}

export const USER_REPOSITORY = Symbol('UserRepository');
