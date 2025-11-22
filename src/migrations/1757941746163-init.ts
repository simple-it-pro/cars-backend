import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1757941746163 implements MigrationInterface {
  name = 'Init1757941746163';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "cars"."sms_verifications" ("id" SERIAL NOT NULL, "phone" character varying(20) NOT NULL, "codeHash" character varying NOT NULL, "attempts" integer NOT NULL DEFAULT '0', "isBlocked" boolean NOT NULL DEFAULT false, "blockedUntil" TIMESTAMP WITH TIME ZONE, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_b791c2dc91b2f3d3608b3acb29f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7a5dc5df206914d08faa64c31e" ON "cars"."sms_verifications" ("phone") `,
    );
    await queryRunner.query(
      `CREATE TABLE "cars"."refresh_tokens" ("id" SERIAL NOT NULL, "tokenHash" character varying NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userAgent" character varying, "ipAddress" character varying, "userId" integer NOT NULL, CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "cars"."users_role_enum" AS ENUM('COMMON', 'ADVANCED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "cars"."users" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "role" "cars"."users_role_enum" NOT NULL DEFAULT 'COMMON', "login" character varying, "password" character varying, "nickname" character varying, "name" character varying, "birthdate" TIMESTAMP, "email" character varying(255), "phone" character varying(20) NOT NULL, "city" character varying, "about" character varying, CONSTRAINT "UQ_2d443082eccd5198f95f2a36e2c" UNIQUE ("login"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_a000cca60bcf04454e727699490" UNIQUE ("phone"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "cars"."refresh_tokens" ADD CONSTRAINT "FK_610102b60fea1455310ccd299de" FOREIGN KEY ("userId") REFERENCES "cars"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cars"."refresh_tokens" DROP CONSTRAINT "FK_610102b60fea1455310ccd299de"`,
    );
    await queryRunner.query(`DROP TABLE "cars"."users"`);
    await queryRunner.query(`DROP TYPE "cars"."users_role_enum"`);
    await queryRunner.query(`DROP TABLE "cars"."refresh_tokens"`);
    await queryRunner.query(
      `DROP INDEX "cars"."IDX_7a5dc5df206914d08faa64c31e"`,
    );
    await queryRunner.query(`DROP TABLE "cars"."sms_verifications"`);
  }
}
