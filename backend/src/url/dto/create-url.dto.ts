import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  IsDateString,
  Matches,
} from 'class-validator';

export class CreateUrlDto {
  @IsUrl()
  @IsNotEmpty()
  originalUrl: string;

  @IsOptional()
  @IsDateString()
  @Transform(
    ({ value }) => (value === '' ? undefined : value) as Date | undefined
  )
  expiresAt?: Date;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Alias can only contain letters, numbers, "-" and "_"',
  })
  alias?: string;
}
