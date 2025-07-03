import { Id } from '../id';

export class CustomerId extends Id {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): CustomerId {
    this.guardValidId(value);
    return new CustomerId(value);
  }

  static new(): CustomerId {
    return new CustomerId(Id.generate());
  }
}
