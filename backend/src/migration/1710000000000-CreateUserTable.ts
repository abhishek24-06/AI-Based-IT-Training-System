import { MigrationInterface, QueryRunner, Table } from "typeorm";
import { Role } from "../types/enums";

export class CreateUserTable1710000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "user",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "uuid_generate_v4()"
                    },
                    {
                        name: "fullName",
                        type: "varchar"
                    },
                    {
                        name: "email",
                        type: "varchar",
                        isUnique: true
                    },
                    {
                        name: "password",
                        type: "varchar"
                    },
                    {
                        name: "role",
                        type: "enum",
                        enum: [Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN],
                        default: `'${Role.STUDENT}'`
                    },
                    {
                        name: "isActive",
                        type: "boolean",
                        default: true
                    },
                    {
                        name: "lastLogin",
                        type: "timestamp",
                        isNullable: true
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "now()"
                    },
                    {
                        name: "updatedAt",
                        type: "timestamp",
                        default: "now()"
                    }
                ]
            }),
            true
        );

        // Create uuid-ossp extension if it doesn't exist
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("user");
    }
} 