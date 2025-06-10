import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Url } from './entities/url.entity'
import { Click } from './entities/click.entity'
import { CreateUrlDto } from './dto/create-url.dto'
import { nanoid } from 'nanoid'

@Injectable()
export class UrlService {
  constructor(
    @InjectRepository(Url) private urlRepo: Repository<Url>,
    @InjectRepository(Click) private clickRepo: Repository<Click>
  ) {}

  async createShortUrl(dto: CreateUrlDto) {
    const shortUrl = dto.alias || nanoid(8)
    const exists = await this.urlRepo.findOneBy({ shortUrl })
    if (exists) throw new ConflictException('Alias already taken')

    const url = this.urlRepo.create({
      originalUrl: dto.originalUrl,
      shortUrl,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    })
    await this.urlRepo.save(url)
    return { shortUrl }
  }

  async getAllUrls() {
    return this.urlRepo.find({
      relations: ['clicks'],
      order: { createdAt: 'DESC' },
    })
  }

  async getOriginalUrl(shortUrl: string, ip: string) {
    const url = await this.urlRepo.findOne({ where: { shortUrl } })
    if (!url) throw new NotFoundException()
    if (url.expiresAt && new Date() > url.expiresAt)
      throw new NotFoundException()

    await this.clickRepo.save(this.clickRepo.create({ url, ip }))
    return url.originalUrl
  }

  async getUrlInfo(shortUrl: string) {
    const url = await this.urlRepo.findOne({
      where: { shortUrl },
      relations: ['clicks'],
    })
    if (!url) throw new NotFoundException()
    return {
      originalUrl: url.originalUrl,
      createdAt: url.createdAt,
      clickCount: url.clicks.length,
    }
  }

  async getAnalytics(shortUrl: string) {
    const url = await this.urlRepo.findOne({ where: { shortUrl } })
    if (!url) throw new NotFoundException()

    const clicks = await this.clickRepo.find({
      where: { url: { id: url.id } },
      order: { clickedAt: 'DESC' },
      take: 5,
    })

    const total = await this.clickRepo.count({
      where: { url: { id: url.id } },
    })

    const dailyClicks = await this.clickRepo
      .createQueryBuilder('click')
      .select("DATE_TRUNC('day', click.clickedAt)", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('click.urlId = :urlId', { urlId: url.id })
      .groupBy('date')
      .orderBy('date', 'DESC')
      .getRawMany()

    return {
      totalClicks: total,
      recentIps: clicks.map((c) => c.ip),
      dailyClicks,
    }
  }

  async deleteUrl(shortUrl: string) {
    const url = await this.urlRepo.findOne({ where: { shortUrl } })
    if (!url) throw new NotFoundException()
    await this.urlRepo.remove(url)
  }
}
