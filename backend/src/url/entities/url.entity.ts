import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Click } from './click.entity';

@Entity()
export class Url {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  shortUrl: string;

  @Column()
  originalUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  expiresAt?: Date;

  @OneToMany(() => Click, (click) => click.url)
  clicks: Click[];
}
