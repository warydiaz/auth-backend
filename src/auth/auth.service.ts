/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.isBlocked) {
      throw new ForbiddenException('The account is blocked');
    }
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return { id: user.id, email: user.email };
  }
}
