import { Controller, Get } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

void ConfigModule.forRoot();

@Controller()
export class HealthCheckController {
  constructor() {}

@Get('/')
  getHealth(): string {
    return 'OK';
  }
}
