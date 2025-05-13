import { BaseError } from '../../../error';

export class InvalidEmailError extends BaseError {
  private constructor(message: string) {
    super('invalid-email email', message);
  }

  static withInvalidEmail(name: string): InvalidEmailError {
    return new InvalidEmailError(`Invalid email value: ${name}`);
  }
}
