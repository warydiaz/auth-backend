import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtGeneratorPort } from 'src/core/application/login/ports/jwt-generator.port';

@Injectable()
export class JwtGeneratorService implements JwtGeneratorPort {
  constructor(private readonly jwtService: JwtService) {}

  generate(userId: string, email: string): string {
    return this.jwtService.sign(
      { sub: userId, email },
      { secret: process.env.JWT_SECRET, expiresIn: '1h' },
    );
  }
}
