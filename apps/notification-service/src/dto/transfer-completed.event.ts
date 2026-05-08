export class TransferCompletedEvent {
  constructor(
    public readonly senderLogin: string,
    public readonly receiverLogin: string,
    public readonly amount: number,
  ) {}
}
