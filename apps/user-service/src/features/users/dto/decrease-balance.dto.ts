import { IsInt, IsPositive } from 'class-validator';

export class DecreaseBalanceDto {
  @IsInt()
  @IsPositive()
  readonly amount!: number;
}
