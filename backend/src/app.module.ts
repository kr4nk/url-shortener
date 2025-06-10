import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UrlModule } from './url/url.module';

@Module({
  imports: [DatabaseModule, UrlModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
