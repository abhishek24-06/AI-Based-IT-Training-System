import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateCourseAndAssessmentTables1710000000001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create Course table
        await queryRunner.createTable(
            new Table({
                name: "course",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "uuid_generate_v4()"
                    },
                    {
                        name: "title",
                        type: "varchar"
                    },
                    {
                        name: "description",
                        type: "text"
                    },
                    {
                        name: "category",
                        type: "varchar"
                    },
                    {
                        name: "difficulty",
                        type: "varchar"
                    },
                    {
                        name: "tags",
                        type: "text",
                        isArray: true
                    },
                    {
                        name: "isPublished",
                        type: "boolean",
                        default: true
                    },
                    {
                        name: "enrollmentCount",
                        type: "int",
                        default: 0
                    },
                    {
                        name: "averageRating",
                        type: "float",
                        default: 0
                    },
                    {
                        name: "instructorId",
                        type: "uuid"
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
            })
        );

        // Create Assessment table
        await queryRunner.createTable(
            new Table({
                name: "assessment",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "uuid_generate_v4()"
                    },
                    {
                        name: "title",
                        type: "varchar"
                    },
                    {
                        name: "description",
                        type: "text"
                    },
                    {
                        name: "category",
                        type: "varchar"
                    },
                    {
                        name: "difficulty",
                        type: "varchar"
                    },
                    {
                        name: "timeLimit",
                        type: "int"
                    },
                    {
                        name: "passingScore",
                        type: "int"
                    },
                    {
                        name: "isPublished",
                        type: "boolean",
                        default: true
                    },
                    {
                        name: "createdById",
                        type: "uuid"
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
            })
        );

        // Create Question table
        await queryRunner.createTable(
            new Table({
                name: "question",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "uuid_generate_v4()"
                    },
                    {
                        name: "text",
                        type: "text"
                    },
                    {
                        name: "type",
                        type: "varchar"
                    },
                    {
                        name: "options",
                        type: "text",
                        isArray: true
                    },
                    {
                        name: "correctAnswer",
                        type: "varchar"
                    },
                    {
                        name: "explanation",
                        type: "text",
                        isNullable: true
                    },
                    {
                        name: "points",
                        type: "int"
                    },
                    {
                        name: "assessmentId",
                        type: "uuid"
                    }
                ]
            })
        );

        // Add foreign keys
        await queryRunner.createForeignKey(
            "course",
            new TableForeignKey({
                columnNames: ["instructorId"],
                referencedColumnNames: ["id"],
                referencedTableName: "user",
                onDelete: "CASCADE"
            })
        );

        await queryRunner.createForeignKey(
            "assessment",
            new TableForeignKey({
                columnNames: ["createdById"],
                referencedColumnNames: ["id"],
                referencedTableName: "user",
                onDelete: "CASCADE"
            })
        );

        await queryRunner.createForeignKey(
            "question",
            new TableForeignKey({
                columnNames: ["assessmentId"],
                referencedColumnNames: ["id"],
                referencedTableName: "assessment",
                onDelete: "CASCADE"
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("question");
        await queryRunner.dropTable("assessment");
        await queryRunner.dropTable("course");
    }
} 