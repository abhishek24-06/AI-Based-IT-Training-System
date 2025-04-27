import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsCompletedToAssessment1744651555385 implements MigrationInterface {
    name = 'AddIsCompletedToAssessment1744651555385'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "assessment" ADD "isCompleted" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "assessment" DROP COLUMN "isCompleted"`);
    }
}
