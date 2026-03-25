import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorPathToRootId1773555776426 implements MigrationInterface {
  name = 'RefactorPathToRootId1773555776426';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8b0b49a336167f9f33e5fec5f4"`,
    );

    /**---------------------- */
    await queryRunner.query(
      `ALTER TABLE "comments" RENAME COLUMN "path" TO "rootId"`,
    );

    await queryRunner.query(
      `ALTER TABLE "comments" ALTER COLUMN "rootId" DROP NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "comments" ALTER COLUMN "rootId" DROP DEFAULT`,
    );

    await queryRunner.query(`
    UPDATE "comments" 
    SET "rootId" = NULL 
    WHERE "rootId" = ''
`);

    await queryRunner.query(`
        UPDATE "comments" 
        SET "rootId" = split_part("rootId", '.', 1) 
        WHERE "rootId" IS NOT NULL
    `);

    await queryRunner.query(`
        ALTER TABLE "comments" 
        ALTER COLUMN "rootId" TYPE integer 
        USING "rootId"::integer
    `);

    /**----------------------- */
    await queryRunner.query(`ALTER TABLE "comments" ADD "deletedAt" TIMESTAMP`);
    await queryRunner.query(
      `CREATE INDEX "IDX_comments_root_id_created_at" ON "comments" ("rootId", "createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_comments_parent_id_id" ON "comments" ("parentId", "id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_comments_parent_id_id"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_comments_root_id_created_at"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_comments_root_id"`);
    await queryRunner.query(`ALTER TABLE "comments" DROP COLUMN "deletedAt"`);
    await queryRunner.query(`ALTER TABLE "comments" DROP COLUMN "rootId"`);
    await queryRunner.query(
      `ALTER TABLE "comments" ADD "path" character varying NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8b0b49a336167f9f33e5fec5f4" ON "comments" ("path") `,
    );
  }
}
