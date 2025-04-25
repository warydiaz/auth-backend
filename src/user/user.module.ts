import { Module } from '@nestjs/common';
import { UserService } from './user.service';

@Module({
  providers: [UserService],
  exports: [UserService], // 👈 necesario para que otros módulos puedan usarlo
})
export class UserModule {}
