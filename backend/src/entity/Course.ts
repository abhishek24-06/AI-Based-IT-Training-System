import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from "typeorm";
import { User } from "./User";
import { Certificate } from "./Certificate";
import { Lesson } from "./Lesson";

@Entity()
export class Course {
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

  @Column("simple-array")
  tags!: string[];

  @Column({ default: true })
  isPublished!: boolean;

  @Column({ default: 0 })
  enrollmentCount!: number;

  @Column({ type: "float", default: 0 })
  averageRating!: number;

  @Column()
  status!: string;

  @ManyToOne(() => User, user => user.courses)
  instructor!: User;

  @OneToMany(() => Certificate, certificate => certificate.course)
  certificates!: Certificate[];

  @OneToMany(() => Lesson, lesson => lesson.course)
  lessons!: Lesson[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 