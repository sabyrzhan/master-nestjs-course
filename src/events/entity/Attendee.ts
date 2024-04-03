import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Event } from './Event';
import { User } from '../../auth/entity/User';
import { Expose } from 'class-transformer';

export enum AttendeeAnswerEnum {
  Accepted = 1,
  Maybe,
  Rejected,
}

@Entity()
export class Attendee {
  @PrimaryGeneratedColumn()
  @Expose()
  public id: number;
  @ManyToOne(() => Event, (event: Event) => event.attendees, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  public event: Event;

  @Column({ name: 'event_id' })
  eventId: number;

  @Column({
    name: 'answer',
    type: 'enum',
    enum: AttendeeAnswerEnum,
    default: AttendeeAnswerEnum.Accepted,
  })
  @Expose()
  answer: AttendeeAnswerEnum;

  @ManyToOne(() => User, (u: User) => u.attended)
  @JoinColumn({ name: 'user_id' })
  @Expose()
  user: User;

  @Column({ name: 'user_id' })
  userId: number;
}
