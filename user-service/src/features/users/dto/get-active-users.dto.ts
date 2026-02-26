import { IsInt, Max, Min } from 'class-validator';

export class GetActiveUsersDto {
  @IsInt()
  @Min(0)
  @Max(130)
  min_age!: number;
  @IsInt()
  @Min(0)
  @Max(130)
  max_age!: number;
}
