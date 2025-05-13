/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Response } from 'express';
import { BaseError } from '../../../error';
import { InvalidEmailError } from 'src/core/domain/user/invalid-email.error';
import { UnauthorizedException } from '@nestjs/common';

export class ErrorResponse {
  code: string;
  message: string;

  static fromBaseError(error: BaseError): ErrorResponse {
    return {
      code: error.code,
      message: error.message,
    };
  }

  static internalServerError(error: Error): ErrorResponse {
    return {
      code: 'internal-server-error',
      message: error.message,
    };
  }
}

export const catchError = (error: Error, response: Response) => {
  if (!(error instanceof BaseError)) {
    response.status(500).json(ErrorResponse.internalServerError(error));
  }

  if (error instanceof UnauthorizedException) {
    const baseError = {
      name: 'UnauthorizedException',
      code: 'UNAUTHORIZED',
      message: error.message,
    };
    response.status(401).json(ErrorResponse.fromBaseError(baseError));
  }

  if (error instanceof InvalidEmailError) {
    response.status(400).json(ErrorResponse.fromBaseError(error));
  }
};
