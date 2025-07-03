import { BaseError } from '../../../error';

export class NewCredentialsInvalidError extends BaseError {
  private constructor(message: string) {
    super('invalid-credentials', message);
  }

  static InvalidToken() {
    return new NewCredentialsInvalidError(`Invalid or expired token`);
  }
  static InvalidEmail() {
    return new NewCredentialsInvalidError(`User not found`);
  }
}
