import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingColumns1760625000000 implements MigrationInterface {
  name = 'AddMissingColumns1760625000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add isFavoriteForUserA and isFavoriteForUserB to chat table
    await queryRunner.query(
      `ALTER TABLE "cars"."chat" ADD COLUMN "isFavoriteForUserA" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "cars"."chat" ADD COLUMN "isFavoriteForUserB" boolean NOT NULL DEFAULT false`,
    );

    // Add voiceUrl and type to message table
    await queryRunner.query(
      `ALTER TABLE "cars"."message" ADD COLUMN "voiceUrl" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "cars"."message" ADD COLUMN "type" character varying NOT NULL DEFAULT 'text'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cars"."message" DROP COLUMN "type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cars"."message" DROP COLUMN "voiceUrl"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cars"."chat" DROP COLUMN "isFavoriteForUserB"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cars"."chat" DROP COLUMN "isFavoriteForUserA"`,
    );
  }
}
