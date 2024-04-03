import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User';
import { Expose } from 'class-transformer';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;
  @Column()
  @Expose()
  age: number;
  @OneToOne(() => User)
  user: User;
}
