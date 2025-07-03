import { InvalidEmailError } from './invalid-email.error';
import validator from 'validator';

export class Email {
  private constructor(readonly value: string) {}

  static create(email: string): Email {
    if (!validator.isEmail(email)) {
      throw InvalidEmailError.withInvalidEmail(email);
    }

    return new Email(email);
  }
}
