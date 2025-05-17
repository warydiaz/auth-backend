import { UserEntity } from '../../domain/user/user.entity';
import { Email } from './email';

export interface UserRepository {
  validate(tester: UserEntity): Promise<UserEntity>;
  findByEmail(email: Email): Promise<UserEntity | null>;
  updatePassword(id: string, hashedPassword: string): Promise<void>;
  findById(id: string): Promise<UserEntity | null>;
}

export const USER_REPOSITORY = Symbol('UserRepository');
