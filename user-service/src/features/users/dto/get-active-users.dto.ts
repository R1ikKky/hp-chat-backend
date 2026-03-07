import { IsInt, Max, Min } from 'class-validator';

export class GetActiveUsersDto {
  @IsInt()
  @Min(0)
  @Max(130)
  readonly min_age!: number;

  @IsInt()
  @Min(0)
  @Max(130)
  readonly max_age!: number;
}
