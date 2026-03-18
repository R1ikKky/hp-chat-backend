import { IsInt, Min } from 'class-validator';

export class IncreaseBalanceDto {
  @IsInt()
  @Min(0)
  readonly amount!: number;
}
