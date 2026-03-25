import { MigrationInterface, QueryRunner } from "typeorm";

export class RefactorFileEntity1773663236601 implements MigrationInterface {
    name = 'RefactorFileEntity1773663236601'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_134735cc45672b90b366c20dc3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_93c04123b9642879843a20d971"`);
        await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "path"`);
        await queryRunner.query(`ALTER TABLE "files" ADD "size" bigint NOT NULL`);
        await queryRunner.query(`ALTER TABLE "files" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_files_filename" ON "files" ("filename") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_files_filename"`);
        await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "size"`);
        await queryRunner.query(`ALTER TABLE "files" ADD "path" character varying NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_93c04123b9642879843a20d971" ON "files" ("path") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_134735cc45672b90b366c20dc3" ON "files" ("filename") `);
    }

}
