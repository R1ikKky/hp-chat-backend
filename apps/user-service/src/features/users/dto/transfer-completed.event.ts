export class TransferCompletedEvent {
  constructor(
    public readonly senderId: string,
    public readonly receiverId: string,
    public readonly amount: number,
  ) {}

  toString() {
    return JSON.stringify({
      senderId: this.senderId,
      receiverId: this.receiverId,
      amount: this.amount,
    });
  }
}
