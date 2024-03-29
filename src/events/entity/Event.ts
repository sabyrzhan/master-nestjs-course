import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Attendee } from './Attendee';

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

  public attendeeCount?: number;

  public attendeeRejected?: number;
  public attendeeMaybe?: number;
  public attendeeAccepted?: number;
}
