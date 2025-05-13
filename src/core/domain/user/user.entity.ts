import { Email } from './email';

export class UserEntity {
  private constructor(
    readonly email: Email,
    readonly password: string,
  ) {}

  static create(anEmail: string, aPassword: string): UserEntity {
    const email = Email.create(anEmail);

    return new UserEntity(email, aPassword);
  }
}
