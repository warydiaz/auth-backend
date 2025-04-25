/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

export type User = {
  id: number;
  email: string;
  password: string; // hashed
  isBlocked: boolean;
};

@Injectable()
export class UserService {
  private users: User[] = [
    {
      id: 1,
      email: 'test@example.com',
      password: bcrypt.hashSync('123456', 10),
      isBlocked: false,
    },
  ];

  async findByEmail(email: string): Promise<User | undefined> {
    return Promise.resolve(this.users.find((user) => user.email === email));
  }
}
