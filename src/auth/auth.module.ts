import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module'; // 👈 importar el módulo

@Module({
  imports: [UserModule], // 👈 acá es clave importar el módulo
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
