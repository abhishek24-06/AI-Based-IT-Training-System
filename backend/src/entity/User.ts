import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Role } from "../types/enums";
import { Course } from "./Course";
import { Assessment } from "./Assessment";
import { Certificate } from "./Certificate";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  fullName!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({
    type: "enum",
    enum: Role,
    default: Role.STUDENT
  })
  role!: Role;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ nullable: true })
  lastLogin!: Date;

  @OneToMany(() => Course, course => course.instructor)
  courses!: Course[];

  @OneToMany(() => Assessment, assessment => assessment.createdBy)
  assessments!: Assessment[];

  @OneToMany(() => Certificate, certificate => certificate.user)
  certificates!: Certificate[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 