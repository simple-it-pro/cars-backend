import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFavoriteFlagsToChat1759754115974 implements MigrationInterface {
    name = 'AddFavoriteFlagsToChat1759754115974'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cars"."chat" ADD "isFavoriteForUserA" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "cars"."chat" ADD "isFavoriteForUserB" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "cars"."message" ADD "voiceUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "cars"."message" ADD "type" character varying NOT NULL DEFAULT 'text'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cars"."message" DROP COLUMN "type"`);
        await queryRunner.query(`ALTER TABLE "cars"."message" DROP COLUMN "voiceUrl"`);
        await queryRunner.query(`ALTER TABLE "cars"."chat" DROP COLUMN "isFavoriteForUserB"`);
        await queryRunner.query(`ALTER TABLE "cars"."chat" DROP COLUMN "isFavoriteForUserA"`);
    }

}
