import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Url } from './entities/url.entity';
import { Click } from './entities/click.entity';
import { UrlService } from './url.service';
import { UrlController } from './url.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Url, Click])],
  providers: [UrlService],
  controllers: [UrlController],
})
export class UrlModule {}
