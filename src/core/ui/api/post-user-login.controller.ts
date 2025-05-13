import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { catchError } from './error.handler';
import { LoginUserCommandHandler } from 'src/core/application/login/login-user.command-handler';
import { LoginUserCommand } from 'src/core/application/login/login-user.command';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { RedisService } from 'src/core/infrastructure/redis/redis.service';
void ConfigModule.forRoot();

export class UserDto {
  email: string;
  password: string;
}

@Controller()
export class PostUserLoginController {
  constructor(
    private readonly commandHandlerLogin: LoginUserCommandHandler,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  @Post('login')
  async handle(@Body() request: UserDto, @Res() response: Response) {
    try {
      const userData = await this.commandHandlerLogin.handle(
        new LoginUserCommand(request.email, request.password),
      );
      const token = this.jwtService.sign(
        { sub: userData.id, email: request.email },
        { secret: process.env.JWT_SECRET, expiresIn: '1h' },
      );

      await this.redisService.set(
        `auth_token:${userData.id}`,
        token,
        'EX',
        3600,
      );

      response
        .status(200)
        .set('Location', `/login/${userData.id}`)
        .json({ token });
    } catch (error) {
      catchError(error, response);
    }
  }
}
