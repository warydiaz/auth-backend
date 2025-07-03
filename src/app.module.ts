/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from './core/infrastructure/redis/redis.module';
import { RedisTokenStore } from './core/infrastructure/redis/redis-token-store.service';
import { JwtGeneratorService } from './core/infrastructure/jwt/jwt-generator.service';
import { typeOrmConfig } from './core/config/typeorm.config';
import { UserPersistenceEntity } from './core/infrastructure/postgres/entities/user.persistence.entity';
import { UserTypeOrmRepository } from './core/infrastructure/postgres/user-repository';
import { LoginUserCommandHandler } from './core/application/login/login-user.command-handler';
import { LoginService } from './core/application/login/login.service';
import { PostUserLoginController } from './core/ui/api/post-user-login.controller';
import { USER_REPOSITORY } from './core/domain/user/user.repository';
import { TOKEN_STORE } from './core/application/login/ports/token-store.port';
import { JWT_GENERATOR } from './core/application/login/ports/jwt-generator.port';
import { RecoverAccountCommandHandler } from './core/application/recover-account/recover-account.command-handler';
import { MailerService } from './core/infrastructure/email/nodemailer.service';
import { ResetPasswordCommandHandler } from './core/application/reset-password/reset-password.command.handler';
import { PostRecoverAccountController } from './core/ui/api/post-recover-account.controller';
import { PostResetPasswordController } from './core/ui/api/post-reset-password.controller';

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
  controllers: [
    PostUserLoginController,
    PostRecoverAccountController,
    PostResetPasswordController,
  ],
  providers: [
    LoginUserCommandHandler,
    LoginService,
    RecoverAccountCommandHandler,
    MailerService,
    ResetPasswordCommandHandler,
    { provide: USER_REPOSITORY, useClass: UserTypeOrmRepository },
    { provide: TOKEN_STORE, useClass: RedisTokenStore },
    { provide: JWT_GENERATOR, useClass: JwtGeneratorService },
  ],
})
export class AppModule {}
