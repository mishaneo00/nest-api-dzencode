import { MigrationInterface, QueryRunner } from "typeorm";

export class RefactorFileEntity1773818121246 implements MigrationInterface {
    name = 'RefactorFileEntity1773818121246'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "files" ADD "isLoaded" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "isLoaded"`);
    }

}
