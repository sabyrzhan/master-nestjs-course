import { CreateEventDTO } from './CreateEventDTO';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateEventDTO extends PartialType(CreateEventDTO) {}
