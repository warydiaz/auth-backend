import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('user')
export class UserPersistenceEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  email: string;

  @Column()
  password: string;
}
