import { IsInt, IsUUID, Min } from 'class-validator';

export class TransferMoneyDto {
  @IsInt()
  @Min(0)
  amount!: number;

  @IsUUID()
  recieverId!: string;
}
