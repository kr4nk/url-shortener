import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  IsDateString,
} from 'class-validator';

export class CreateUrlDto {
  @IsUrl()
  @IsNotEmpty()
  originalUrl: string;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  expiresAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  alias?: string;
}
