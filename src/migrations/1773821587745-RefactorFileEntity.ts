import { MigrationInterface, QueryRunner } from "typeorm";

export class RefactorFileEntity1773821587745 implements MigrationInterface {
    name = 'RefactorFileEntity1773821587745'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "files" ALTER COLUMN "filename" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "files" ALTER COLUMN "filename" DROP NOT NULL`);
    }

}
