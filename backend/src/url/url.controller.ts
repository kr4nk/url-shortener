import {
  Controller,
  Post,
  Get,
  Param,
  Delete,
  Body,
  Redirect,
  Ip,
} from '@nestjs/common'
import { UrlService } from './url.service'
import { CreateUrlDto } from './dto/create-url.dto'

@Controller()
export class UrlController {
  constructor(private readonly service: UrlService) {}

  @Get('all')
  getAll() {
    return this.service.getAllUrls()
  }

  @Post('shorten')
  create(@Body() dto: CreateUrlDto) {
    return this.service.createShortUrl(dto)
  }

  @Get(':shortUrl')
  @Redirect()
  async redirect(@Param('shortUrl') shortUrl: string, @Ip() ip: string) {
    const url = await this.service.getOriginalUrl(shortUrl, ip)
    return { url }
  }

  @Get('info/:shortUrl')
  info(@Param('shortUrl') shortUrl: string) {
    return this.service.getUrlInfo(shortUrl)
  }

  @Get('analytics/:shortUrl')
  analytics(@Param('shortUrl') shortUrl: string) {
    return this.service.getAnalytics(shortUrl)
  }

  @Delete('delete/:shortUrl')
  delete(@Param('shortUrl') shortUrl: string) {
    return this.service.deleteUrl(shortUrl)
  }
}
