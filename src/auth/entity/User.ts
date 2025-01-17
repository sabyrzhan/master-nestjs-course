import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Profile } from './Profile';
import { Event } from '../../events/entity/Event';
import { Expose } from 'class-transformer';
import { Attendee } from '../../events/entity/Attendee';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;
  @Expose()
  @Column({ unique: true })
  @Expose()
  username: string;
  @Column()
  password: string;
  @Column({ unique: true })
  @Expose()
  email: string;
  @Column()
  @Expose()
  firstName: string;
  @Column()
  @Expose()
  lastName: string;
  @OneToOne(() => Profile, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Expose()
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  @OneToMany(() => Event, (event) => event.organizer)
  organized: Event[];

  @OneToMany(() => Attendee, (a: Attendee) => a.user)
  attended: Attendee[];
}
