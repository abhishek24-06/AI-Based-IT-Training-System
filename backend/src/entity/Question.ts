import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { Quiz } from "./Quiz";
import { Assessment } from "./Assessment";

@Entity()
export class Question {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("text")
  text!: string;

  @Column("simple-array")
  options!: string[];

  @Column()
  correctAnswer!: number; // index of the correct answer in options array

  @Column()
  points!: number;

  @ManyToOne(() => Quiz, quiz => quiz.questions, { nullable: true })
  quiz?: Quiz;

  @ManyToOne(() => Assessment, assessment => assessment.questions, { nullable: true })
  assessment?: Assessment;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 