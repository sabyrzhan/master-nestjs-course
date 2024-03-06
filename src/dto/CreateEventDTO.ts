export class CreateEventDTO {
  constructor(
    public name: string,
    public description: string,
    public when: string,
    public address: string,
  ) {}
}
