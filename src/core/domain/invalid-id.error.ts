import { BaseError } from '../../error';

export class InvalidIdError extends BaseError {
  private constructor(message: string) {
    super('invalid-id', message);
  }

  static withInvalidValue(id: string): InvalidIdError {
    return new InvalidIdError(`Invalid id: ${id}`);
  }
}
