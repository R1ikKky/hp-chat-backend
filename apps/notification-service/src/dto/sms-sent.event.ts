export class SmsSentEvent {
  constructor(
    public readonly phone: string,
    public readonly message: string,
  ) {}
}
