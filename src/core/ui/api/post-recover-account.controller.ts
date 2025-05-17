import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { catchError } from './error.handler';
import { ConfigModule } from '@nestjs/config';
import { RecoverAccountCommandHandler } from 'src/core/application/recover-account/recover-account.command-handler';
import { RecoverAccountCommand } from 'src/core/application/recover-account/recover-account.command';

void ConfigModule.forRoot();

export class UserDto {
  email: string;
}

@Controller()
export class PostRecoverAccountController {
  constructor(private readonly recoverAccount: RecoverAccountCommandHandler) {}

  @Post('recover-account')
  async handle(@Body() dto: UserDto, @Res() res: Response) {
    try {
      await this.recoverAccount.handle(new RecoverAccountCommand(dto.email));
      res.status(200).json({
        message: 'Recovery email sent successfully',
      });
    } catch (error) {
      catchError(error, res);
    }
  }
}
