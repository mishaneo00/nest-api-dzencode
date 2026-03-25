import { MigrationInterface, QueryRunner } from "typeorm";

export class InitDatabase1773397244939 implements MigrationInterface {
    name = 'InitDatabase1773397244939'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "files" ("id" SERIAL NOT NULL, "filename" character varying NOT NULL, "originalName" character varying NOT NULL, "path" character varying NOT NULL, "mimetype" character varying, "createdAt" TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_6c16b9093a142e0e7613b04a3d9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_134735cc45672b90b366c20dc3" ON "files" ("filename") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_93c04123b9642879843a20d971" ON "files" ("path") `);
        await queryRunner.query(`CREATE TABLE "comments" ("id" SERIAL NOT NULL, "text" text NOT NULL, "path" character varying NOT NULL DEFAULT '', "authorId" integer NOT NULL, "fileId" integer, "parentId" integer, "createdAt" TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "REL_4070cf222bb06697cd70d6d8df" UNIQUE ("fileId"), CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8b0b49a336167f9f33e5fec5f4" ON "comments" ("path") `);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "username" character varying(50) NOT NULL, "email" character varying(150) NOT NULL, "homepage" character varying(255), "createdAt" TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_USERS_USERNAME" ON "users" ("username") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_USERS_EMAIL" ON "users" ("email") `);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_4548cc4a409b8651ec75f70e280" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_4070cf222bb06697cd70d6d8df6" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_8770bd9030a3d13c5f79a7d2e81" FOREIGN KEY ("parentId") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_8770bd9030a3d13c5f79a7d2e81"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_4070cf222bb06697cd70d6d8df6"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_4548cc4a409b8651ec75f70e280"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_USERS_EMAIL"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_USERS_USERNAME"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8b0b49a336167f9f33e5fec5f4"`);
        await queryRunner.query(`DROP TABLE "comments"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_93c04123b9642879843a20d971"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_134735cc45672b90b366c20dc3"`);
        await queryRunner.query(`DROP TABLE "files"`);
    }

}
