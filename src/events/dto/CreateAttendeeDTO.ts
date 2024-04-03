import { AttendeeAnswerEnum } from '../entity/Attendee';
import { IsEnum } from 'class-validator';

export class CreateAttendeeDTO {
  @IsEnum(AttendeeAnswerEnum)
  answer: AttendeeAnswerEnum;
}
