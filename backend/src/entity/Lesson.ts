import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from "typeorm";
import { Course } from "./Course";
import { Video } from "./Video";
import { Quiz } from "./Quiz";

@Entity()
export class Lesson {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column("text")
  description!: string;

  @Column()
  order!: number;

  @Column({ default: true })
  isPublished!: boolean;

  @ManyToOne(() => Course, course => course.lessons)
  course!: Course;

  @OneToMany(() => Video, video => video.lesson)
  videos!: Video[];

  @OneToMany(() => Quiz, quiz => quiz.lesson)
  quizzes!: Quiz[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 