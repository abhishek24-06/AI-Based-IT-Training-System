import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { User } from "./User";
import { Course } from "./Course";

@Entity()
export class Certificate {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column("text")
  description!: string;

  @Column()
  status!: string;

  @Column()
  issueDate!: Date;

  @Column()
  expiryDate!: Date;

  @Column()
  certificateUrl!: string;

  @ManyToOne(() => User, user => user.certificates)
  user!: User;

  @ManyToOne(() => Course, course => course.certificates)
  course!: Course;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 