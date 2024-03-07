import { IsDateString, Length } from 'class-validator';

export class CreateEventDTO {
  @Length(5, 255, { message: 'Name length is invalid' })
  public name: string;
  @Length(5, 255, { message: 'Description length is invalid' })
  public description: string;
  @IsDateString()
  public when: string;
  @Length(5, 255, { message: 'Address length is invalid' })
  public address: string;
}
