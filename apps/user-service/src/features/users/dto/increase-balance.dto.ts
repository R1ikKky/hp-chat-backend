import { IsInt, IsPositive } from 'class-validator';

export class IncreaseBalanceDto {
  @IsInt()
  @IsPositive()
  readonly amount!: number;
}
