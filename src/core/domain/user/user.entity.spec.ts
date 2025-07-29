// user.entity.spec.ts

import { UserEntity } from './user.entity';

describe('UserEntity', () => {
  it('should create a user with valid email and password', () => {
    const user = UserEntity.create('test@example.com', 'secret', '123');

    expect(user.id).toBe('123');
    expect(user.email.value).toBe('test@example.com');
    expect(user.password).toBe('secret');
  });

  it('should throw an error if email is invalid', () => {
    expect(() => {
      UserEntity.create('invalid-email', 'secret');
    }).toThrow();
  });
});
