import { IsInt, Min } from 'class-validator';

export class DecreaseBalanceDto {
  @IsInt()
  @Min(0)
  readonly amount!: number;
}
