import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1758280922554 implements MigrationInterface {
  name = 'Init1758280922554';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "cars"."chat" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "uniqueKey" character varying NOT NULL, "lastMessageContent" character varying, "lastMessageCreatedAt" TIMESTAMP, "unreadCountForUserA" integer NOT NULL DEFAULT '0', "unreadCountForUserB" integer NOT NULL DEFAULT '0', "userAId" integer, "userBId" integer, CONSTRAINT "UQ_8febe36332a28b664a2b2434fad" UNIQUE ("uniqueKey"), CONSTRAINT "PK_9d0b2ba74336710fd31154738a5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8febe36332a28b664a2b2434fa" ON "cars"."chat" ("uniqueKey") `,
    );
    await queryRunner.query(
      `CREATE TABLE "cars"."message" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "content" text NOT NULL, "attachments" jsonb NOT NULL DEFAULT '[]', "isRead" boolean NOT NULL DEFAULT false, "isDeleted" boolean NOT NULL DEFAULT false, "chatId" uuid, "senderId" integer, CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "cars"."chat" ADD CONSTRAINT "FK_928d33ac6fe5d505cbc21b46511" FOREIGN KEY ("userAId") REFERENCES "cars"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cars"."chat" ADD CONSTRAINT "FK_94b99bfa9e0c52a67b5ca71e53d" FOREIGN KEY ("userBId") REFERENCES "cars"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cars"."message" ADD CONSTRAINT "FK_619bc7b78eba833d2044153bacc" FOREIGN KEY ("chatId") REFERENCES "cars"."chat"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cars"."message" ADD CONSTRAINT "FK_bc096b4e18b1f9508197cd98066" FOREIGN KEY ("senderId") REFERENCES "cars"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cars"."message" DROP CONSTRAINT "FK_bc096b4e18b1f9508197cd98066"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cars"."message" DROP CONSTRAINT "FK_619bc7b78eba833d2044153bacc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cars"."chat" DROP CONSTRAINT "FK_94b99bfa9e0c52a67b5ca71e53d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cars"."chat" DROP CONSTRAINT "FK_928d33ac6fe5d505cbc21b46511"`,
    );
    await queryRunner.query(`DROP TABLE "cars"."message"`);
    await queryRunner.query(
      `DROP INDEX "cars"."IDX_8febe36332a28b664a2b2434fa"`,
    );
    await queryRunner.query(`DROP TABLE "cars"."chat"`);
  }
}
