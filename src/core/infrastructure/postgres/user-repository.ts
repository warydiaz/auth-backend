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

  async validate(user: UserEntity): Promise<UserEntity> {
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

    return this.toDomain(dbUser);
  }

  async findById(id: string): Promise<UserEntity | null> {
    const dbUser = await this.userRepository.findOne({
      where: { id },
    });

    if (!dbUser) {
      return null;
    }

    return this.toDomain(dbUser);
  }

  async findByEmail(email: Email): Promise<UserEntity | null> {
    const dbUser = await this.userRepository.findOne({
      where: { email: email.value },
    });

    if (!dbUser) {
      return null;
    }

    return this.toDomain(dbUser);
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await this.userRepository.update(id, { password: hashedPassword });
  }

  private toDomain(user: UserPersistenceEntity): UserEntity {
    return UserEntity.create(
      user.email,
      user.password ?? undefined,
      user.id ?? undefined,
    );
  }
}
