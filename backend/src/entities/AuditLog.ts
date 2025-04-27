import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  action: string;

  @Column()
  endpoint: string;

  @Column()
  statusCode: number;

  @Column()
  responseTime: number;

  @Column()
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column('jsonb', { nullable: true })
  requestBody: any;

  @Column('jsonb', { nullable: true })
  responseBody: any;

  @Column()
  timestamp: Date;

  @Column({ default: false })
  isError: boolean;

  @Column({ nullable: true })
  errorMessage: string;

  @Column({ nullable: true })
  stackTrace: string;
} 