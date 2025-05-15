/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Email } from 'src/core/domain/user/email';
import { UserPersistenceEntity } from './entities/user.persistence.entity';
import { UserRepository } from 'src/core/domain/user/user.repository';
import { UserEntity } from 'src/core/domain/user/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserTypeOrmRepository implements UserRepository {
  constructor(
    @InjectRepository(UserPersistenceEntity)
    private readonly userRepository: Repository<UserPersistenceEntity>,
  ) {}

  async validate(user: UserEntity): Promise<{ id: string; email: string }> {
    const email: Email = user.email;
    const dbUser = await this.userRepository.findOne({
      where: { email: email.value },
    });

    if (!dbUser) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(user.password, dbUser.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return { id: dbUser.id, email: dbUser.email };
  }

  async findByEmail(
    email: Email,
  ): Promise<{ id: string; email: string } | null> {
    const dbUser = await this.userRepository.findOne({
      where: { email: email.value },
    });

    if (!dbUser) {
      return null;
    }

    return { id: dbUser.id, email: dbUser.email };
  }
}
