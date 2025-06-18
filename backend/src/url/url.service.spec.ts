import { Test, TestingModule } from '@nestjs/testing';
import { UrlService } from './url.service';
import { Url } from './entities/url.entity';
import { Click } from './entities/click.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';

jest.mock('nanoid', () => ({ nanoid: () => 'mocked123' }));

describe('UrlService', () => {
  let service: UrlService;
  let urlRepo: any;
  let clickRepo: any;

  beforeEach(async () => {
    urlRepo = {
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };
    clickRepo = {
      save: jest.fn(),
      create: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest
          .fn()
          .mockResolvedValue([{ date: '2024-06-01', count: '5' }]),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlService,
        { provide: getRepositoryToken(Url), useValue: urlRepo },
        { provide: getRepositoryToken(Click), useValue: clickRepo },
      ],
    }).compile();

    service = module.get<UrlService>(UrlService);
  });

  describe('createShortUrl', () => {
    it('should create new short URL', async () => {
      urlRepo.findOneBy.mockResolvedValue(null);
      const mockCreated = { shortUrl: 'mocked123' };
      urlRepo.create.mockReturnValue(mockCreated);
      urlRepo.save.mockResolvedValue(mockCreated);

      const dto = { originalUrl: 'https://google.com' };
      const result = await service.createShortUrl(dto);

      expect(result.shortUrl).toContain('mocked123');
      expect(urlRepo.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if alias exists', async () => {
      urlRepo.findOneBy.mockResolvedValue({ shortUrl: 'taken' });
      await expect(
        service.createShortUrl({ originalUrl: '', alias: 'taken' })
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getAllUrls', () => {
    it('should return all URLs with clicks', async () => {
      const mockUrls = [{ shortUrl: '1' }, { shortUrl: '2' }];
      urlRepo.find.mockResolvedValue(mockUrls);
      const result = await service.getAllUrls();
      expect(result).toBe(mockUrls);
      expect(urlRepo.find).toHaveBeenCalledWith({
        relations: ['clicks'],
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('getOriginalUrl', () => {
    it('should return original URL and save click', async () => {
      const url = {
        shortUrl: 'mock',
        originalUrl: 'https://t.com',
        expiresAt: null,
      };
      urlRepo.findOne.mockResolvedValue(url);
      clickRepo.create.mockReturnValue({ url, ip: '1.2.3.4' });
      clickRepo.save.mockResolvedValue({});

      const result = await service.getOriginalUrl('mock', '1.2.3.4');
      expect(result).toBe(url.originalUrl);
      expect(clickRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if not found', async () => {
      urlRepo.findOne.mockResolvedValue(null);
      await expect(service.getOriginalUrl('notfound', 'ip')).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw NotFoundException if expired', async () => {
      urlRepo.findOne.mockResolvedValue({
        shortUrl: 'x',
        originalUrl: 'y',
        expiresAt: new Date('2000-01-01'),
      });
      await expect(service.getOriginalUrl('x', 'ip')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('getUrlInfo', () => {
    it('should return url info with clicks', async () => {
      const url = {
        originalUrl: 'https://site.com',
        createdAt: new Date(),
        clicks: [{}, {}, {}],
      };
      urlRepo.findOne.mockResolvedValue(url);
      const result = await service.getUrlInfo('mock');

      expect(result.clickCount).toBe(3);
      expect(result.originalUrl).toBe(url.originalUrl);
    });

    it('should throw NotFoundException if not found', async () => {
      urlRepo.findOne.mockResolvedValue(null);
      await expect(service.getUrlInfo('404')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('getAnalytics', () => {
    it('should return totalClicks, recentIps and dailyClicks', async () => {
      const mockUrl = { id: 1 };
      const mockClicks = [{ ip: '1.1.1.1' }, { ip: '2.2.2.2' }];
      urlRepo.findOne.mockResolvedValue(mockUrl);
      clickRepo.find.mockResolvedValue(mockClicks);
      clickRepo.count.mockResolvedValue(42);

      const result = await service.getAnalytics('mock');
      expect(result.totalClicks).toBe(42);
      expect(result.recentIps).toEqual(['1.1.1.1', '2.2.2.2']);
      expect(result.dailyClicks).toEqual([{ date: '2024-06-01', count: '5' }]);
    });

    it('should throw NotFoundException if URL not found', async () => {
      urlRepo.findOne.mockResolvedValue(null);
      await expect(service.getAnalytics('x')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('deleteUrl', () => {
    it('should delete existing URL', async () => {
      const mockUrl = { id: 123 };
      urlRepo.findOne.mockResolvedValue(mockUrl);
      urlRepo.remove.mockResolvedValue({});

      await service.deleteUrl('mock');
      expect(urlRepo.remove).toHaveBeenCalledWith(mockUrl);
    });

    it('should throw NotFoundException if URL not found', async () => {
      urlRepo.findOne.mockResolvedValue(null);
      await expect(service.deleteUrl('notfound')).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
