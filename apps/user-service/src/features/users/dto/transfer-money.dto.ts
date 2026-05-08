import { IsInt, IsUUID, Min } from 'class-validator';

export class TransferMoneyDto {
  @IsInt()
  @Min(0)
  readonly amount!: number;

  @IsUUID()
  readonly receiverId!: string;
}
