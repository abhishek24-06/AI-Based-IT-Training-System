import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from "typeorm";
import { User } from "./User";
import { Question } from "./Question";

@Entity()
export class Assessment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column("text")
  description!: string;

  @Column()
  category!: string;

  @Column()
  difficulty!: string;

  @Column({ type: "int" })
  timeLimit!: number;

  @Column({ type: "int" })
  passingScore!: number;

  @Column({ default: true })
  isPublished!: boolean;

  @Column({ default: false })
  isCompleted!: boolean;

  @OneToMany(() => Question, question => question.assessment)
  questions!: Question[];

  @ManyToOne(() => User, user => user.assessments)
  createdBy!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 