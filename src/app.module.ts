import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './core/infrastructure/redis/redis.module';
import { JwtModule } from '@nestjs/jwt';
import { typeOrmConfig } from './core/config/typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPersistenceEntity } from './core/infrastructure/postgres/entities/user.persistence.entity';
import { LoginUserCommandHandler } from './core/application/login/login-user.command-handler';
import { PostUserLoginController } from './core/ui/api/post-user-login.controller';
import { USER_REPOSITORY } from './core/domain/user/user.repository';
import { UserTypeOrmRepository } from './core/infrastructure/postgres/user-repository';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forFeature([UserPersistenceEntity]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    RedisModule,
  ],
  controllers: [PostUserLoginController],
  providers: [
    LoginUserCommandHandler,
    { provide: USER_REPOSITORY, useClass: UserTypeOrmRepository },
  ],
})
export class AppModule {}
