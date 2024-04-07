import { IsDateString, Length } from 'class-validator';

export class CreateEventDTO {
  @Length(5, 255, { message: 'Name length is invalid' })
  public name: string;
  @Length(5, 255, { message: 'Description length is invalid' })
  public description: string;
  @IsDateString(
    { strict: false, strictSeparator: false },
    { message: 'Date format is invalid' },
  )
  public when: string;
  @Length(5, 255, { message: 'Address length is invalid' })
  public address: string;
}
