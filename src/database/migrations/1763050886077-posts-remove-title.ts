import { MigrationInterface, QueryRunner } from 'typeorm';

export class PostsRemoveTitle1763050886077 implements MigrationInterface {
    name = 'PostsRemoveTitle1763050886077';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "cars"."posts" DROP COLUMN "title"`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "cars"."posts" ADD "title" character varying NOT NULL`,
        );
    }
}
