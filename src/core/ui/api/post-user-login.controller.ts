import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { catchError } from './error.handler';
import { ConfigModule } from '@nestjs/config';
import { LoginService } from 'src/core/application/login/login.service';

void ConfigModule.forRoot();

export class UserDto {
  email: string;
  password: string;
}

@Controller()
export class PostUserLoginController {
  constructor(private readonly loginService: LoginService) {}

  @Post('login')
  async handle(@Body() dto: UserDto, @Res() res: Response) {
    try {
      const token = await this.loginService.execute(dto.email, dto.password);
      res.status(200).json({ token });
    } catch (error) {
      catchError(error, res);
    }
  }
}
