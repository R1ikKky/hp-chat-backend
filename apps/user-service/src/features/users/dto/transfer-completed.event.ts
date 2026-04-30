export class TransferCompletedEvent {
  constructor(
    public readonly senderLogin: string,
    public readonly receiverLogin: string,
    public readonly amount: number,
  ) {}

  toString() {
    return JSON.stringify({
      senderLogin: this.senderLogin,
      receiverLogin: this.receiverLogin,
      amount: this.amount,
    });
  }
}
