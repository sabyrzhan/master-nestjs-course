import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  age: number;
  @OneToOne(() => User)
  user: User;
}
