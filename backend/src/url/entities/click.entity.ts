import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Url } from './url.entity';

@Entity()
export class Click {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  clickedAt: Date;

  @Column()
  ip: string;

  @ManyToOne(() => Url, (url) => url.clicks, { onDelete: 'CASCADE' })
  url: Url;
}
