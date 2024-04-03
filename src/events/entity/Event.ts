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
import { Expose } from 'class-transformer';
import { PaginationResult } from '../pagination/paginator';

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  @Expose()
  public id: number;
  @Column()
  @Expose()
  public name: string;
  @Column()
  @Expose()
  public description: string;
  @Column()
  @Expose()
  public when: Date;
  @Column()
  @Expose()
  public address: string;
  @OneToMany(() => Attendee, (attendee: Attendee) => attendee.event)
  @Expose()
  public attendees: Attendee[];
  @ManyToOne(() => User, (user) => user.organized)
  @JoinColumn({ name: 'organizer_id' })
  @Expose()
  public organizer: User;

  @Column({ name: 'organizer_id' })
  public organizerId: number;

  public attendeeCount?: number;

  public attendeeRejected?: number;
  public attendeeMaybe?: number;
  public attendeeAccepted?: number;
}

export type PaginatedEvents = PaginationResult<Event>;
