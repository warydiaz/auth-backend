/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import { InvalidIdError } from './invalid-id.error';

export abstract class Id {
  protected constructor(readonly value: string) {}
  static generate(): string {
    return uuidv4();
  }

  protected static guardValidId(value: string): void {
    if (!uuidValidate(value)) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw InvalidIdError.withInvalidValue(value);
    }
  }

  equals(id: Id): boolean {
    return id.value === this.value;
  }
}
