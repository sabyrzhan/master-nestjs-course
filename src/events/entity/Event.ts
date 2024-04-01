import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Attendee } from './Attendee';
import { User } from '../../auth/entity/User';

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  public id: number;
  @Column()
  public name: string;
  @Column()
  public description: string;
  @Column()
  public when: Date;
  @Column()
  public address: string;
  @OneToMany(() => Attendee, (attendee: Attendee) => attendee.event)
  public attendees: Attendee[];
  @ManyToOne(() => User, (user) => user.organized)
  @JoinColumn({ name: 'organizer_id' })
  public organizer: User;

  public attendeeCount?: number;

  public attendeeRejected?: number;
  public attendeeMaybe?: number;
  public attendeeAccepted?: number;
}
