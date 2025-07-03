import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { catchError } from './error.handler';
import { ConfigModule } from '@nestjs/config';
import { ResetPasswordCommand } from 'src/core/application/reset-password/reset-password.command';
import { ResetPasswordCommandHandler } from 'src/core/application/reset-password/reset-password.command.handler';

void ConfigModule.forRoot();

export class UserDto {
  token: string;
  newPassword: string;
}

@Controller()
export class PostResetPasswordController {
  constructor(private readonly resetPassword: ResetPasswordCommandHandler) {}

  @Post('reset-password')
  async handle(@Body() dto: UserDto, @Res() res: Response) {
    try {
      await this.resetPassword.handle(
        new ResetPasswordCommand(dto.token, dto.newPassword),
      );
      res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
      catchError(error, res);
    }
  }
}
