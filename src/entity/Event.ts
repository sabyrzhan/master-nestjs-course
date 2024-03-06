export class Event {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public when: Date,
    public address: string,
  ) {}
}
