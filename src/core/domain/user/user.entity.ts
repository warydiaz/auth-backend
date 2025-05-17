import { Email } from './email';

export class UserEntity {
  private constructor(
    readonly id: string | undefined,
    readonly email: Email,
    readonly password: string | undefined,
  ) {}

  static create(anEmail: string, aPassword?: string, id?: string): UserEntity {
    const email = Email.create(anEmail);
    return new UserEntity(id, email, aPassword);
  }
}
