import { MigrationInterface, QueryRunner } from "typeorm";

export class PostsAndHashtags1762859902523 implements MigrationInterface {
    name = 'PostsAndHashtags1762859902523'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "cars"."posts_status_enum" AS ENUM('DRAFT', 'PUBLISHED')`);
        await queryRunner.query(`CREATE TABLE "cars"."posts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text NOT NULL, "status" "cars"."posts_status_enum" NOT NULL DEFAULT 'DRAFT', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cars"."hashtags" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_7fedde18872deb14e4889361d7b" UNIQUE ("name"), CONSTRAINT "PK_994c5bf9151587560db430018c5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cars"."post_files" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order" integer NOT NULL, "postId" uuid NOT NULL, "fileId" uuid NOT NULL, CONSTRAINT "REL_1755b7f4061d5ece60967f00e4" UNIQUE ("fileId"), CONSTRAINT "PK_3a75ee290763a3bfa3597f05f3e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "cars"."files_type_enum" AS ENUM('IMAGE', 'VIDEO', 'FILE', 'VOICE')`);
        await queryRunner.query(`CREATE TYPE "cars"."files_status_enum" AS ENUM('ATTACHED', 'TEMPORARY')`);
        await queryRunner.query(`CREATE TABLE "cars"."files" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "type" "cars"."files_type_enum" NOT NULL, "url" character varying, "size" integer NOT NULL, "ext" character varying NOT NULL, "status" "cars"."files_status_enum" NOT NULL DEFAULT 'TEMPORARY', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_6c16b9093a142e0e7613b04a3d9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cars"."post_hashtags" ("postId" uuid NOT NULL, "hashtagId" uuid NOT NULL, CONSTRAINT "PK_50a352c8d6f5c550e88843e6908" PRIMARY KEY ("postId", "hashtagId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_003e77538237089ff217a1cfe7" ON "cars"."post_hashtags" ("postId") `);
        await queryRunner.query(`CREATE INDEX "IDX_31c935be539e76295a7f1c632a" ON "cars"."post_hashtags" ("hashtagId") `);
        await queryRunner.query(`ALTER TABLE "cars"."posts" ADD CONSTRAINT "FK_ae05faaa55c866130abef6e1fee" FOREIGN KEY ("userId") REFERENCES "cars"."users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cars"."post_files" ADD CONSTRAINT "FK_a12706e0fd90132ab2ffa9b0b1e" FOREIGN KEY ("postId") REFERENCES "cars"."posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cars"."post_files" ADD CONSTRAINT "FK_1755b7f4061d5ece60967f00e4b" FOREIGN KEY ("fileId") REFERENCES "cars"."files"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cars"."post_hashtags" ADD CONSTRAINT "FK_003e77538237089ff217a1cfe74" FOREIGN KEY ("postId") REFERENCES "cars"."posts"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "cars"."post_hashtags" ADD CONSTRAINT "FK_31c935be539e76295a7f1c632aa" FOREIGN KEY ("hashtagId") REFERENCES "cars"."hashtags"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cars"."post_hashtags" DROP CONSTRAINT "FK_31c935be539e76295a7f1c632aa"`);
        await queryRunner.query(`ALTER TABLE "cars"."post_hashtags" DROP CONSTRAINT "FK_003e77538237089ff217a1cfe74"`);
        await queryRunner.query(`ALTER TABLE "cars"."post_files" DROP CONSTRAINT "FK_1755b7f4061d5ece60967f00e4b"`);
        await queryRunner.query(`ALTER TABLE "cars"."post_files" DROP CONSTRAINT "FK_a12706e0fd90132ab2ffa9b0b1e"`);
        await queryRunner.query(`ALTER TABLE "cars"."posts" DROP CONSTRAINT "FK_ae05faaa55c866130abef6e1fee"`);
        await queryRunner.query(`DROP INDEX "cars"."IDX_31c935be539e76295a7f1c632a"`);
        await queryRunner.query(`DROP INDEX "cars"."IDX_003e77538237089ff217a1cfe7"`);
        await queryRunner.query(`DROP TABLE "cars"."post_hashtags"`);
        await queryRunner.query(`DROP TABLE "cars"."files"`);
        await queryRunner.query(`DROP TYPE "cars"."files_status_enum"`);
        await queryRunner.query(`DROP TYPE "cars"."files_type_enum"`);
        await queryRunner.query(`DROP TABLE "cars"."post_files"`);
        await queryRunner.query(`DROP TABLE "cars"."hashtags"`);
        await queryRunner.query(`DROP TABLE "cars"."posts"`);
        await queryRunner.query(`DROP TYPE "cars"."posts_status_enum"`);
    }

}
