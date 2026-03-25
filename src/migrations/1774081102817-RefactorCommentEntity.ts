import { MigrationInterface, QueryRunner } from "typeorm";

export class RefactorCommentEntity1774081102817 implements MigrationInterface {
    name = 'RefactorCommentEntity1774081102817'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comments" ADD "fingerprint" character varying NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_comments_fingerprint" ON "comments" ("fingerprint") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_comments_fingerprint"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP COLUMN "fingerprint"`);
    }

}
