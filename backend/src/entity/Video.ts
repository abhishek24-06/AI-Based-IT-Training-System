import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { Lesson } from "./Lesson";

@Entity()
export class Video {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column("text")
  description!: string;

  @Column()
  url!: string;

  @Column()
  duration!: number; // in seconds

  @Column({ default: true })
  isPublished!: boolean;

  @ManyToOne(() => Lesson, lesson => lesson.videos)
  lesson!: Lesson;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 