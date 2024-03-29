import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Event } from './Event';

export enum AttendeeAnswerEnum {
  Accepted = 1,
  Maybe,
  Rejected,
}

@Entity()
export class Attendee {
  @PrimaryGeneratedColumn()
  public id: number;
  @Column()
  public name: string;
  @ManyToOne(() => Event, (event: Event) => event.attendees, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  public event: Event;

  @Column({
    name: 'answer',
    type: 'enum',
    enum: AttendeeAnswerEnum,
    default: AttendeeAnswerEnum.Accepted,
  })
  answer: AttendeeAnswerEnum;
}
