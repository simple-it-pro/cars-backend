import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1757948633088 implements MigrationInterface {
    name = 'Init1757948633088';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "cars"."refresh_tokens" ADD "tokenId" character varying NOT NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE "cars"."refresh_tokens" ADD CONSTRAINT "UQ_48064cd66bef5bbbcc3eb196229" UNIQUE ("tokenId")`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "cars"."refresh_tokens" DROP CONSTRAINT "UQ_48064cd66bef5bbbcc3eb196229"`,
        );
        await queryRunner.query(
            `ALTER TABLE "cars"."refresh_tokens" DROP COLUMN "tokenId"`,
        );
    }
}
