import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm";
import { User } from "./User";

@Entity()
export class Log {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  level!: string;

  @Column("text")
  message!: string;

  @Column("text", { nullable: true })
  stack!: string;

  @Column("json", { nullable: true })
  metadata!: any;

  @ManyToOne(() => User, { nullable: true })
  user!: User;

  @Column()
  ipAddress!: string;

  @Column()
  userAgent!: string;

  @CreateDateColumn()
  createdAt!: Date;
} 