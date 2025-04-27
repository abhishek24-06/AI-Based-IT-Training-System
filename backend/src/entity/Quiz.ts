import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from "typeorm";
import { Lesson } from "./Lesson";
import { Question } from "./Question";

@Entity()
export class Quiz {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column("text")
  description!: string;

  @Column()
  passingScore!: number;

  @Column({ default: true })
  isPublished!: boolean;

  @ManyToOne(() => Lesson, lesson => lesson.quizzes)
  lesson!: Lesson;

  @OneToMany(() => Question, question => question.quiz)
  questions!: Question[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 