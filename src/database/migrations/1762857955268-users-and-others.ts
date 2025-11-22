import { MigrationInterface, QueryRunner } from 'typeorm';

export class UsersAndOthers1762857955268 implements MigrationInterface {
    name = 'UsersAndOthers1762857955268';

    // Helper functions for checking existence
    private async tableExists(
        queryRunner: QueryRunner,
        tableName: string,
        schema: string = 'cars',
    ): Promise<boolean> {
        const result = await queryRunner.query(
            `SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = '${schema}' AND table_name = '${tableName}'
            ) as exists`,
        );
        return result[0]?.exists === true;
    }

    private async columnExists(
        queryRunner: QueryRunner,
        tableName: string,
        columnName: string,
        schema: string = 'cars',
    ): Promise<boolean> {
        const result = await queryRunner.query(
            `SELECT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_schema = '${schema}' AND table_name = '${tableName}' AND column_name = '${columnName}'
            ) as exists`,
        );
        return result[0]?.exists === true;
    }

    private async constraintExists(
        queryRunner: QueryRunner,
        constraintName: string,
        schema: string = 'cars',
    ): Promise<boolean> {
        const result = await queryRunner.query(
            `SELECT EXISTS (
                SELECT FROM information_schema.table_constraints 
                WHERE table_schema = '${schema}' AND constraint_name = '${constraintName}'
            ) as exists`,
        );
        return result[0]?.exists === true;
    }

    private async getColumnType(
        queryRunner: QueryRunner,
        tableName: string,
        columnName: string,
        schema: string = 'cars',
    ): Promise<string | null> {
        const result = await queryRunner.query(
            `SELECT data_type, udt_name, character_maximum_length
            FROM information_schema.columns 
            WHERE table_schema = '${schema}' AND table_name = '${tableName}' AND column_name = '${columnName}'`,
        );
        if (result.length === 0) return null;
        const col = result[0];
        if (col.udt_name === 'varchar' && col.character_maximum_length) {
            return `character varying(${col.character_maximum_length})`;
        }
        if (col.udt_name === 'uuid') {
            return 'uuid';
        }
        if (col.udt_name === 'int4') {
            return 'integer';
        }
        return col.data_type;
    }

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop old tables if they exist (before modifying users)
        const oldChatExists = await this.tableExists(queryRunner, 'chat');
        const oldMessageExists = await this.tableExists(queryRunner, 'message');

        if (oldMessageExists) {
            if (
                await this.constraintExists(
                    queryRunner,
                    'FK_bc096b4e18b1f9508197cd98066',
                )
            ) {
                await queryRunner.query(
                    `ALTER TABLE "cars"."message" DROP CONSTRAINT IF EXISTS "FK_bc096b4e18b1f9508197cd98066"`,
                );
            }
            if (
                await this.constraintExists(
                    queryRunner,
                    'FK_619bc7b78eba833d2044153bacc',
                )
            ) {
                await queryRunner.query(
                    `ALTER TABLE "cars"."message" DROP CONSTRAINT IF EXISTS "FK_619bc7b78eba833d2044153bacc"`,
                );
            }
        }

        if (oldChatExists) {
            if (
                await this.constraintExists(
                    queryRunner,
                    'FK_94b99bfa9e0c52a67b5ca71e53d',
                )
            ) {
                await queryRunner.query(
                    `ALTER TABLE "cars"."chat" DROP CONSTRAINT IF EXISTS "FK_94b99bfa9e0c52a67b5ca71e53d"`,
                );
            }
            if (
                await this.constraintExists(
                    queryRunner,
                    'FK_928d33ac6fe5d505cbc21b46511',
                )
            ) {
                await queryRunner.query(
                    `ALTER TABLE "cars"."chat" DROP CONSTRAINT IF EXISTS "FK_928d33ac6fe5d505cbc21b46511"`,
                );
            }
            await queryRunner.query(
                `DROP INDEX IF EXISTS "cars"."IDX_8febe36332a28b664a2b2434fa"`,
            );
            await queryRunner.query(`DROP TABLE IF EXISTS "cars"."message"`);
            await queryRunner.query(`DROP TABLE IF EXISTS "cars"."chat"`);
        }

        // Modify users table - change id from SERIAL to UUID
        const usersIdColumnType = await this.getColumnType(
            queryRunner,
            'users',
            'id',
        );
        if (usersIdColumnType && !usersIdColumnType.includes('uuid')) {
            // First drop refresh_tokens FK that references users.id
            if (
                await this.constraintExists(
                    queryRunner,
                    'FK_610102b60fea1455310ccd299de',
                )
            ) {
                await queryRunner.query(
                    `ALTER TABLE "cars"."refresh_tokens" DROP CONSTRAINT IF EXISTS "FK_610102b60fea1455310ccd299de"`,
                );
            }
            // Drop primary key constraint if exists
            if (
                await this.constraintExists(
                    queryRunner,
                    'PK_a3ffb1c0c8416b9fc6f907b7433',
                )
            ) {
                await queryRunner.query(
                    `ALTER TABLE "cars"."users" DROP CONSTRAINT IF EXISTS "PK_a3ffb1c0c8416b9fc6f907b7433"`,
                );
            }
            // Drop column and recreate as UUID
            await queryRunner.query(
                `ALTER TABLE "cars"."users" DROP COLUMN IF EXISTS "id"`,
            );
            await queryRunner.query(
                `ALTER TABLE "cars"."users" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
            );
            await queryRunner.query(
                `ALTER TABLE "cars"."users" ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")`,
            );
        } else if (!usersIdColumnType) {
            // Column doesn't exist, create it
            await queryRunner.query(
                `ALTER TABLE "cars"."users" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
            );
            await queryRunner.query(
                `ALTER TABLE "cars"."users" ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")`,
            );
        } else {
            // Column exists and is UUID, ensure PRIMARY KEY constraint exists
            if (
                !(await this.constraintExists(
                    queryRunner,
                    'PK_a3ffb1c0c8416b9fc6f907b7433',
                ))
            ) {
                await queryRunner.query(
                    `ALTER TABLE "cars"."users" ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")`,
                );
            }
        }

        // Modify nickname column if needed
        const nicknameExists = await this.columnExists(
            queryRunner,
            'users',
            'nickname',
        );
        if (nicknameExists) {
            const nicknameType = await this.getColumnType(
                queryRunner,
                'users',
                'nickname',
            );
            // Check if type needs to be changed (not varchar(30))
            const needsChange =
                !nicknameType ||
                (!nicknameType.includes('varying(30)') &&
                    nicknameType !== 'character varying(30)');
            if (needsChange) {
                if (
                    await this.constraintExists(
                        queryRunner,
                        'UQ_ad02a1be8707004cb805a4b5023',
                    )
                ) {
                    await queryRunner.query(
                        `ALTER TABLE "cars"."users" DROP CONSTRAINT IF EXISTS "UQ_ad02a1be8707004cb805a4b5023"`,
                    );
                }
                await queryRunner.query(
                    `ALTER TABLE "cars"."users" DROP COLUMN IF EXISTS "nickname"`,
                );
                await queryRunner.query(
                    `ALTER TABLE "cars"."users" ADD "nickname" character varying(30)`,
                );
                if (
                    !(await this.constraintExists(
                        queryRunner,
                        'UQ_ad02a1be8707004cb805a4b5023',
                    ))
                ) {
                    await queryRunner.query(
                        `ALTER TABLE "cars"."users" ADD CONSTRAINT "UQ_ad02a1be8707004cb805a4b5023" UNIQUE ("nickname")`,
                    );
                }
            } else if (
                !(await this.constraintExists(
                    queryRunner,
                    'UQ_ad02a1be8707004cb805a4b5023',
                ))
            ) {
                // Column type is correct, but constraint might be missing
                await queryRunner.query(
                    `ALTER TABLE "cars"."users" ADD CONSTRAINT "UQ_ad02a1be8707004cb805a4b5023" UNIQUE ("nickname")`,
                );
            }
        } else {
            await queryRunner.query(
                `ALTER TABLE "cars"."users" ADD "nickname" character varying(30)`,
            );
            if (
                !(await this.constraintExists(
                    queryRunner,
                    'UQ_ad02a1be8707004cb805a4b5023',
                ))
            ) {
                await queryRunner.query(
                    `ALTER TABLE "cars"."users" ADD CONSTRAINT "UQ_ad02a1be8707004cb805a4b5023" UNIQUE ("nickname")`,
                );
            }
        }

        // Add new columns to users if they don't exist
        if (!(await this.columnExists(queryRunner, 'users', 'deletedAt'))) {
            await queryRunner.query(
                `ALTER TABLE "cars"."users" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`,
            );
        }
        if (!(await this.columnExists(queryRunner, 'users', 'rating'))) {
            await queryRunner.query(
                `ALTER TABLE "cars"."users" ADD "rating" double precision`,
            );
        }
        if (!(await this.columnExists(queryRunner, 'users', 'isDeactivated'))) {
            await queryRunner.query(
                `ALTER TABLE "cars"."users" ADD "isDeactivated" boolean NOT NULL DEFAULT false`,
            );
        }

        // Modify refresh_tokens table
        const refreshTokensTableExists = await this.tableExists(
            queryRunner,
            'refresh_tokens',
        );
        if (refreshTokensTableExists) {
            const refreshTokensIdType = await this.getColumnType(
                queryRunner,
                'refresh_tokens',
                'id',
            );
            if (refreshTokensIdType && !refreshTokensIdType.includes('uuid')) {
                if (
                    await this.constraintExists(
                        queryRunner,
                        'FK_610102b60fea1455310ccd299de',
                    )
                ) {
                    await queryRunner.query(
                        `ALTER TABLE "cars"."refresh_tokens" DROP CONSTRAINT IF EXISTS "FK_610102b60fea1455310ccd299de"`,
                    );
                }
                if (
                    await this.constraintExists(
                        queryRunner,
                        'PK_7d8bee0204106019488c4c50ffa',
                    )
                ) {
                    await queryRunner.query(
                        `ALTER TABLE "cars"."refresh_tokens" DROP CONSTRAINT IF EXISTS "PK_7d8bee0204106019488c4c50ffa"`,
                    );
                }
                await queryRunner.query(
                    `ALTER TABLE "cars"."refresh_tokens" DROP COLUMN IF EXISTS "id"`,
                );
                await queryRunner.query(
                    `ALTER TABLE "cars"."refresh_tokens" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
                );
                await queryRunner.query(
                    `ALTER TABLE "cars"."refresh_tokens" ADD CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id")`,
                );
            } else if (!refreshTokensIdType) {
                await queryRunner.query(
                    `ALTER TABLE "cars"."refresh_tokens" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
                );
                await queryRunner.query(
                    `ALTER TABLE "cars"."refresh_tokens" ADD CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id")`,
                );
            } else {
                // Column exists and is UUID, ensure PRIMARY KEY constraint exists
                if (
                    !(await this.constraintExists(
                        queryRunner,
                        'PK_7d8bee0204106019488c4c50ffa',
                    ))
                ) {
                    await queryRunner.query(
                        `ALTER TABLE "cars"."refresh_tokens" ADD CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id")`,
                    );
                }
            }

            const refreshTokensUserIdType = await this.getColumnType(
                queryRunner,
                'refresh_tokens',
                'userId',
            );
            if (
                refreshTokensUserIdType &&
                refreshTokensUserIdType.includes('integer')
            ) {
                if (
                    await this.constraintExists(
                        queryRunner,
                        'FK_610102b60fea1455310ccd299de',
                    )
                ) {
                    await queryRunner.query(
                        `ALTER TABLE "cars"."refresh_tokens" DROP CONSTRAINT IF EXISTS "FK_610102b60fea1455310ccd299de"`,
                    );
                }
                await queryRunner.query(
                    `ALTER TABLE "cars"."refresh_tokens" DROP COLUMN IF EXISTS "userId"`,
                );
                await queryRunner.query(
                    `ALTER TABLE "cars"."refresh_tokens" ADD "userId" uuid NOT NULL`,
                );
            } else if (!refreshTokensUserIdType) {
                await queryRunner.query(
                    `ALTER TABLE "cars"."refresh_tokens" ADD "userId" uuid NOT NULL`,
                );
            }
            // Note: Foreign key constraint will be added later in the migration
        }

        // Modify sms_verifications table
        const smsVerificationsTableExists = await this.tableExists(
            queryRunner,
            'sms_verifications',
        );
        if (smsVerificationsTableExists) {
            const smsVerificationsIdType = await this.getColumnType(
                queryRunner,
                'sms_verifications',
                'id',
            );
            if (
                smsVerificationsIdType &&
                !smsVerificationsIdType.includes('uuid')
            ) {
                if (
                    await this.constraintExists(
                        queryRunner,
                        'PK_b791c2dc91b2f3d3608b3acb29f',
                    )
                ) {
                    await queryRunner.query(
                        `ALTER TABLE "cars"."sms_verifications" DROP CONSTRAINT IF EXISTS "PK_b791c2dc91b2f3d3608b3acb29f"`,
                    );
                }
                await queryRunner.query(
                    `ALTER TABLE "cars"."sms_verifications" DROP COLUMN IF EXISTS "id"`,
                );
                await queryRunner.query(
                    `ALTER TABLE "cars"."sms_verifications" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
                );
                await queryRunner.query(
                    `ALTER TABLE "cars"."sms_verifications" ADD CONSTRAINT "PK_b791c2dc91b2f3d3608b3acb29f" PRIMARY KEY ("id")`,
                );
            } else if (!smsVerificationsIdType) {
                await queryRunner.query(
                    `ALTER TABLE "cars"."sms_verifications" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
                );
                await queryRunner.query(
                    `ALTER TABLE "cars"."sms_verifications" ADD CONSTRAINT "PK_b791c2dc91b2f3d3608b3acb29f" PRIMARY KEY ("id")`,
                );
            } else {
                // Column exists and is UUID, ensure PRIMARY KEY constraint exists
                if (
                    !(await this.constraintExists(
                        queryRunner,
                        'PK_b791c2dc91b2f3d3608b3acb29f',
                    ))
                ) {
                    await queryRunner.query(
                        `ALTER TABLE "cars"."sms_verifications" ADD CONSTRAINT "PK_b791c2dc91b2f3d3608b3acb29f" PRIMARY KEY ("id")`,
                    );
                }
            }
        }

        // Create new tables if they don't exist
        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS "cars"."message_contents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "content" text NOT NULL, "attachments" jsonb NOT NULL DEFAULT '[]', "version" integer NOT NULL DEFAULT '1', "messageId" uuid, CONSTRAINT "PK_03279c256f7af6160464f6a1515" PRIMARY KEY ("id"))`,
        );

        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS "cars"."messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "content" text NOT NULL, "attachments" jsonb NOT NULL DEFAULT '[]', "voiceUrl" character varying, "type" character varying NOT NULL DEFAULT 'text', "isRead" boolean NOT NULL DEFAULT false, "isDeleted" boolean NOT NULL DEFAULT false, "quotedText" text, "chatId" uuid, "senderId" uuid, "current_content_id" uuid, "replied_message_id" uuid, "forwarded_from_id" uuid, CONSTRAINT "REL_08f16c5d53571d16195e43a9a0" UNIQUE ("current_content_id"), CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY ("id"))`,
        );

        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS "cars"."unread_chats" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "unreadCount" integer NOT NULL DEFAULT '0', "userId" uuid, "chatId" uuid, CONSTRAINT "PK_2d0badc60fed194efdb9af98a7c" PRIMARY KEY ("id"))`,
        );

        await queryRunner.query(
            `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_762873d081b5d6c6c146710fcf" ON "cars"."unread_chats" ("userId", "chatId") `,
        );

        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS "cars"."chats" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "type" character varying NOT NULL DEFAULT 'private', "name" character varying, "description" character varying, "uniqueKey" character varying NOT NULL, "lastMessageId" uuid, "createdById" uuid, CONSTRAINT "UQ_85dfa7b940bde947a406940de34" UNIQUE ("uniqueKey"), CONSTRAINT "PK_0117647b3c4a4e5ff198aeb6206" PRIMARY KEY ("id"))`,
        );

        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "idx_chat_created_at" ON "cars"."chats" ("createdAt") `,
        );
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "idx_chat_updated_at" ON "cars"."chats" ("updatedAt") `,
        );
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "idx_chat_unique_key" ON "cars"."chats" ("uniqueKey") `,
        );

        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS "cars"."reviews" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "content" character varying(200) NOT NULL, "answer" character varying(200), "answeredAt" TIMESTAMP WITH TIME ZONE, "rank" integer NOT NULL, "images" jsonb NOT NULL DEFAULT '[]', "isVerified" boolean NOT NULL DEFAULT false, "authorId" uuid, "userId" uuid, CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY ("id"))`,
        );

        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS "cars"."subscriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid, "subscribed_user_id" uuid, CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id"))`,
        );

        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS "cars"."followers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "follower_id" uuid, "subscribed_user_id" uuid, CONSTRAINT "PK_c90cfc5b18edd29bd15ba95c1a4" PRIMARY KEY ("id"))`,
        );

        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS "cars"."notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "type" character varying NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL, "isRead" boolean NOT NULL DEFAULT false, "userId" uuid, CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`,
        );

        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS "cars"."user_block" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid, "blockedUserId" uuid, CONSTRAINT "PK_4ccc8015091b2f9054ce0e40db5" PRIMARY KEY ("id"))`,
        );

        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "idx_user_block_created_at" ON "cars"."user_block" ("createdAt") `,
        );
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "idx_user_block_updated_at" ON "cars"."user_block" ("updatedAt") `,
        );

        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS "cars"."chat_users" ("chat_id" uuid NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_31efa25a44c55b3ceed47f98ba4" PRIMARY KEY ("chat_id", "user_id"))`,
        );

        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_f60265ed6da63600bad2c5ee8c" ON "cars"."chat_users" ("chat_id") `,
        );
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_9a5f2493e2c02490ceb527649e" ON "cars"."chat_users" ("user_id") `,
        );

        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS "cars"."favorite_chats" ("user_id" uuid NOT NULL, "chat_id" uuid NOT NULL, CONSTRAINT "PK_77a1a21755755ca0f3277cf8813" PRIMARY KEY ("user_id", "chat_id"))`,
        );

        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_01fb6b75feeed8947ff7af6373" ON "cars"."favorite_chats" ("user_id") `,
        );
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_691ea633dcc15524c68040881d" ON "cars"."favorite_chats" ("chat_id") `,
        );

        // Add foreign key constraints if they don't exist
        if (
            !(await this.constraintExists(
                queryRunner,
                'FK_9d82e8565547b2bb2c975e4f8b3',
            ))
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."message_contents" ADD CONSTRAINT "FK_9d82e8565547b2bb2c975e4f8b3" FOREIGN KEY ("messageId") REFERENCES "cars"."messages"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
            );
        }
        if (
            !(await this.constraintExists(
                queryRunner,
                'FK_36bc604c820bb9adc4c75cd4115',
            ))
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."messages" ADD CONSTRAINT "FK_36bc604c820bb9adc4c75cd4115" FOREIGN KEY ("chatId") REFERENCES "cars"."chats"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
            );
        }
        if (
            !(await this.constraintExists(
                queryRunner,
                'FK_2db9cf2b3ca111742793f6c37ce',
            ))
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."messages" ADD CONSTRAINT "FK_2db9cf2b3ca111742793f6c37ce" FOREIGN KEY ("senderId") REFERENCES "cars"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
            );
        }
        if (
            !(await this.constraintExists(
                queryRunner,
                'FK_08f16c5d53571d16195e43a9a04',
            ))
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."messages" ADD CONSTRAINT "FK_08f16c5d53571d16195e43a9a04" FOREIGN KEY ("current_content_id") REFERENCES "cars"."message_contents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
            );
        }
        if (
            !(await this.constraintExists(
                queryRunner,
                'FK_fa6db99f5f890b9c9e8260e35d9',
            ))
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."messages" ADD CONSTRAINT "FK_fa6db99f5f890b9c9e8260e35d9" FOREIGN KEY ("replied_message_id") REFERENCES "cars"."messages"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
            );
        }
        if (
            !(await this.constraintExists(
                queryRunner,
                'FK_ac6b12ef0b3f9ac9d522bd0d6e2',
            ))
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."messages" ADD CONSTRAINT "FK_ac6b12ef0b3f9ac9d522bd0d6e2" FOREIGN KEY ("forwarded_from_id") REFERENCES "cars"."messages"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
            );
        }
        if (
            !(await this.constraintExists(
                queryRunner,
                'FK_e00abd209eae688e408b210ac99',
            ))
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."unread_chats" ADD CONSTRAINT "FK_e00abd209eae688e408b210ac99" FOREIGN KEY ("userId") REFERENCES "cars"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
            );
        }
        if (
            !(await this.constraintExists(
                queryRunner,
                'FK_1f2aac16dfcc98bc852fb2d4076',
            ))
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."unread_chats" ADD CONSTRAINT "FK_1f2aac16dfcc98bc852fb2d4076" FOREIGN KEY ("chatId") REFERENCES "cars"."chats"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
            );
        }
        if (
            !(await this.constraintExists(
                queryRunner,
                'FK_5768a56bdd855c5b78ce66c9a37',
            ))
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."chats" ADD CONSTRAINT "FK_5768a56bdd855c5b78ce66c9a37" FOREIGN KEY ("lastMessageId") REFERENCES "cars"."messages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
            );
        }
        if (
            !(await this.constraintExists(
                queryRunner,
                'FK_fa7cbf53930e01a370b3841a1bc',
            ))
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."chats" ADD CONSTRAINT "FK_fa7cbf53930e01a370b3841a1bc" FOREIGN KEY ("createdById") REFERENCES "cars"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
            );
        }
        if (
            !(await this.constraintExists(
                queryRunner,
                'FK_48770372f891b9998360e4434f3',
            ))
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."reviews" ADD CONSTRAINT "FK_48770372f891b9998360e4434f3" FOREIGN KEY ("authorId") REFERENCES "cars"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
            );
        }
        if (
            !(await this.constraintExists(
                queryRunner,
                'FK_7ed5659e7139fc8bc039198cc1f',
            ))
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."reviews" ADD CONSTRAINT "FK_7ed5659e7139fc8bc039198cc1f" FOREIGN KEY ("userId") REFERENCES "cars"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
            );
        }
        if (
            !(await this.constraintExists(
                queryRunner,
                'FK_610102b60fea1455310ccd299de',
            ))
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."refresh_tokens" ADD CONSTRAINT "FK_610102b60fea1455310ccd299de" FOREIGN KEY ("userId") REFERENCES "cars"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
            );
        }
        if (
            !(await this.constraintExists(
                queryRunner,
                'FK_d0a95ef8a28188364c546eb65c1',
            ))
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."subscriptions" ADD CONSTRAINT "FK_d0a95ef8a28188364c546eb65c1" FOREIGN KEY ("user_id") REFERENCES "cars"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
            );
        }
        if (
            !(await this.constraintExists(
                queryRunner,
                'FK_8d3d7c9ab9bc6db519fd2d147e8',
            ))
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."subscriptions" ADD CONSTRAINT "FK_8d3d7c9ab9bc6db519fd2d147e8" FOREIGN KEY ("subscribed_user_id") REFERENCES "cars"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
            );
        }
        if (
            !(await this.constraintExists(
                queryRunner,
                'FK_e11d02e2a1197cfb61759da5a87',
            ))
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."followers" ADD CONSTRAINT "FK_e11d02e2a1197cfb61759da5a87" FOREIGN KEY ("follower_id") REFERENCES "cars"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
            );
        }
        if (
            !(await this.constraintExists(
                queryRunner,
                'FK_dae4b5a8d33611fc43bb3a9674d',
            ))
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."followers" ADD CONSTRAINT "FK_dae4b5a8d33611fc43bb3a9674d" FOREIGN KEY ("subscribed_user_id") REFERENCES "cars"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
            );
        }
        if (
            !(await this.constraintExists(
                queryRunner,
                'FK_692a909ee0fa9383e7859f9b406',
            ))
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."notifications" ADD CONSTRAINT "FK_692a909ee0fa9383e7859f9b406" FOREIGN KEY ("userId") REFERENCES "cars"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
            );
        }
        if (
            !(await this.constraintExists(
                queryRunner,
                'FK_d1a5c2390a4f7c1193bc1dde183',
            ))
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."user_block" ADD CONSTRAINT "FK_d1a5c2390a4f7c1193bc1dde183" FOREIGN KEY ("userId") REFERENCES "cars"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
            );
        }
        if (
            !(await this.constraintExists(
                queryRunner,
                'FK_f8d3ed19d5a271bb6025aedb8e7',
            ))
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."user_block" ADD CONSTRAINT "FK_f8d3ed19d5a271bb6025aedb8e7" FOREIGN KEY ("blockedUserId") REFERENCES "cars"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
            );
        }
        if (
            !(await this.constraintExists(
                queryRunner,
                'FK_f60265ed6da63600bad2c5ee8c4',
            ))
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."chat_users" ADD CONSTRAINT "FK_f60265ed6da63600bad2c5ee8c4" FOREIGN KEY ("chat_id") REFERENCES "cars"."chats"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
            );
        }
        if (
            !(await this.constraintExists(
                queryRunner,
                'FK_9a5f2493e2c02490ceb527649e4',
            ))
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."chat_users" ADD CONSTRAINT "FK_9a5f2493e2c02490ceb527649e4" FOREIGN KEY ("user_id") REFERENCES "cars"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
            );
        }
        if (
            !(await this.constraintExists(
                queryRunner,
                'FK_01fb6b75feeed8947ff7af63734',
            ))
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."favorite_chats" ADD CONSTRAINT "FK_01fb6b75feeed8947ff7af63734" FOREIGN KEY ("user_id") REFERENCES "cars"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
            );
        }
        if (
            !(await this.constraintExists(
                queryRunner,
                'FK_691ea633dcc15524c68040881d0',
            ))
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."favorite_chats" ADD CONSTRAINT "FK_691ea633dcc15524c68040881d0" FOREIGN KEY ("chat_id") REFERENCES "cars"."chats"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints if they exist
        if (
            await this.constraintExists(
                queryRunner,
                'FK_691ea633dcc15524c68040881d0',
            )
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."favorite_chats" DROP CONSTRAINT IF EXISTS "FK_691ea633dcc15524c68040881d0"`,
            );
        }
        if (
            await this.constraintExists(
                queryRunner,
                'FK_01fb6b75feeed8947ff7af63734',
            )
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."favorite_chats" DROP CONSTRAINT IF EXISTS "FK_01fb6b75feeed8947ff7af63734"`,
            );
        }
        if (
            await this.constraintExists(
                queryRunner,
                'FK_9a5f2493e2c02490ceb527649e4',
            )
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."chat_users" DROP CONSTRAINT IF EXISTS "FK_9a5f2493e2c02490ceb527649e4"`,
            );
        }
        if (
            await this.constraintExists(
                queryRunner,
                'FK_f60265ed6da63600bad2c5ee8c4',
            )
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."chat_users" DROP CONSTRAINT IF EXISTS "FK_f60265ed6da63600bad2c5ee8c4"`,
            );
        }
        if (
            await this.constraintExists(
                queryRunner,
                'FK_f8d3ed19d5a271bb6025aedb8e7',
            )
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."user_block" DROP CONSTRAINT IF EXISTS "FK_f8d3ed19d5a271bb6025aedb8e7"`,
            );
        }
        if (
            await this.constraintExists(
                queryRunner,
                'FK_d1a5c2390a4f7c1193bc1dde183',
            )
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."user_block" DROP CONSTRAINT IF EXISTS "FK_d1a5c2390a4f7c1193bc1dde183"`,
            );
        }
        if (
            await this.constraintExists(
                queryRunner,
                'FK_692a909ee0fa9383e7859f9b406',
            )
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."notifications" DROP CONSTRAINT IF EXISTS "FK_692a909ee0fa9383e7859f9b406"`,
            );
        }
        if (
            await this.constraintExists(
                queryRunner,
                'FK_dae4b5a8d33611fc43bb3a9674d',
            )
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."followers" DROP CONSTRAINT IF EXISTS "FK_dae4b5a8d33611fc43bb3a9674d"`,
            );
        }
        if (
            await this.constraintExists(
                queryRunner,
                'FK_e11d02e2a1197cfb61759da5a87',
            )
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."followers" DROP CONSTRAINT IF EXISTS "FK_e11d02e2a1197cfb61759da5a87"`,
            );
        }
        if (
            await this.constraintExists(
                queryRunner,
                'FK_8d3d7c9ab9bc6db519fd2d147e8',
            )
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."subscriptions" DROP CONSTRAINT IF EXISTS "FK_8d3d7c9ab9bc6db519fd2d147e8"`,
            );
        }
        if (
            await this.constraintExists(
                queryRunner,
                'FK_d0a95ef8a28188364c546eb65c1',
            )
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."subscriptions" DROP CONSTRAINT IF EXISTS "FK_d0a95ef8a28188364c546eb65c1"`,
            );
        }
        if (
            await this.constraintExists(
                queryRunner,
                'FK_610102b60fea1455310ccd299de',
            )
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."refresh_tokens" DROP CONSTRAINT IF EXISTS "FK_610102b60fea1455310ccd299de"`,
            );
        }
        if (
            await this.constraintExists(
                queryRunner,
                'FK_7ed5659e7139fc8bc039198cc1f',
            )
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."reviews" DROP CONSTRAINT IF EXISTS "FK_7ed5659e7139fc8bc039198cc1f"`,
            );
        }
        if (
            await this.constraintExists(
                queryRunner,
                'FK_48770372f891b9998360e4434f3',
            )
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."reviews" DROP CONSTRAINT IF EXISTS "FK_48770372f891b9998360e4434f3"`,
            );
        }
        if (
            await this.constraintExists(
                queryRunner,
                'FK_fa7cbf53930e01a370b3841a1bc',
            )
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."chats" DROP CONSTRAINT IF EXISTS "FK_fa7cbf53930e01a370b3841a1bc"`,
            );
        }
        if (
            await this.constraintExists(
                queryRunner,
                'FK_5768a56bdd855c5b78ce66c9a37',
            )
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."chats" DROP CONSTRAINT IF EXISTS "FK_5768a56bdd855c5b78ce66c9a37"`,
            );
        }
        if (
            await this.constraintExists(
                queryRunner,
                'FK_1f2aac16dfcc98bc852fb2d4076',
            )
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."unread_chats" DROP CONSTRAINT IF EXISTS "FK_1f2aac16dfcc98bc852fb2d4076"`,
            );
        }
        if (
            await this.constraintExists(
                queryRunner,
                'FK_e00abd209eae688e408b210ac99',
            )
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."unread_chats" DROP CONSTRAINT IF EXISTS "FK_e00abd209eae688e408b210ac99"`,
            );
        }
        if (
            await this.constraintExists(
                queryRunner,
                'FK_ac6b12ef0b3f9ac9d522bd0d6e2',
            )
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."messages" DROP CONSTRAINT IF EXISTS "FK_ac6b12ef0b3f9ac9d522bd0d6e2"`,
            );
        }
        if (
            await this.constraintExists(
                queryRunner,
                'FK_fa6db99f5f890b9c9e8260e35d9',
            )
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."messages" DROP CONSTRAINT IF EXISTS "FK_fa6db99f5f890b9c9e8260e35d9"`,
            );
        }
        if (
            await this.constraintExists(
                queryRunner,
                'FK_08f16c5d53571d16195e43a9a04',
            )
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."messages" DROP CONSTRAINT IF EXISTS "FK_08f16c5d53571d16195e43a9a04"`,
            );
        }
        if (
            await this.constraintExists(
                queryRunner,
                'FK_2db9cf2b3ca111742793f6c37ce',
            )
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."messages" DROP CONSTRAINT IF EXISTS "FK_2db9cf2b3ca111742793f6c37ce"`,
            );
        }
        if (
            await this.constraintExists(
                queryRunner,
                'FK_36bc604c820bb9adc4c75cd4115',
            )
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."messages" DROP CONSTRAINT IF EXISTS "FK_36bc604c820bb9adc4c75cd4115"`,
            );
        }
        if (
            await this.constraintExists(
                queryRunner,
                'FK_9d82e8565547b2bb2c975e4f8b3',
            )
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."message_contents" DROP CONSTRAINT IF EXISTS "FK_9d82e8565547b2bb2c975e4f8b3"`,
            );
        }

        // Revert users table changes
        if (await this.columnExists(queryRunner, 'users', 'nickname')) {
            const nicknameType = await this.getColumnType(
                queryRunner,
                'users',
                'nickname',
            );
            if (nicknameType?.includes('varying(30)')) {
                if (
                    await this.constraintExists(
                        queryRunner,
                        'UQ_ad02a1be8707004cb805a4b5023',
                    )
                ) {
                    await queryRunner.query(
                        `ALTER TABLE "cars"."users" DROP CONSTRAINT IF EXISTS "UQ_ad02a1be8707004cb805a4b5023"`,
                    );
                }
                await queryRunner.query(
                    `ALTER TABLE "cars"."users" DROP COLUMN IF EXISTS "nickname"`,
                );
                await queryRunner.query(
                    `ALTER TABLE "cars"."users" ADD "nickname" character varying`,
                );
                await queryRunner.query(
                    `ALTER TABLE "cars"."users" ADD CONSTRAINT "UQ_ad02a1be8707004cb805a4b5023" UNIQUE ("nickname")`,
                );
            }
        }

        // Revert users id column
        const usersIdColumnType = await this.getColumnType(
            queryRunner,
            'users',
            'id',
        );
        if (usersIdColumnType?.includes('uuid')) {
            if (
                await this.constraintExists(
                    queryRunner,
                    'PK_a3ffb1c0c8416b9fc6f907b7433',
                )
            ) {
                await queryRunner.query(
                    `ALTER TABLE "cars"."users" DROP CONSTRAINT IF EXISTS "PK_a3ffb1c0c8416b9fc6f907b7433"`,
                );
            }
            await queryRunner.query(
                `ALTER TABLE "cars"."users" DROP COLUMN IF EXISTS "id"`,
            );
            await queryRunner.query(
                `ALTER TABLE "cars"."users" ADD "id" SERIAL NOT NULL`,
            );
            await queryRunner.query(
                `ALTER TABLE "cars"."users" ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")`,
            );
        }

        // Revert refresh_tokens changes
        if (await this.columnExists(queryRunner, 'refresh_tokens', 'userId')) {
            const refreshTokensUserIdType = await this.getColumnType(
                queryRunner,
                'refresh_tokens',
                'userId',
            );
            if (refreshTokensUserIdType?.includes('uuid')) {
                if (
                    await this.constraintExists(
                        queryRunner,
                        'FK_610102b60fea1455310ccd299de',
                    )
                ) {
                    await queryRunner.query(
                        `ALTER TABLE "cars"."refresh_tokens" DROP CONSTRAINT IF EXISTS "FK_610102b60fea1455310ccd299de"`,
                    );
                }
                await queryRunner.query(
                    `ALTER TABLE "cars"."refresh_tokens" DROP COLUMN IF EXISTS "userId"`,
                );
                await queryRunner.query(
                    `ALTER TABLE "cars"."refresh_tokens" ADD "userId" integer NOT NULL`,
                );
            }
        }

        const refreshTokensIdType = await this.getColumnType(
            queryRunner,
            'refresh_tokens',
            'id',
        );
        if (refreshTokensIdType?.includes('uuid')) {
            if (
                await this.constraintExists(
                    queryRunner,
                    'PK_7d8bee0204106019488c4c50ffa',
                )
            ) {
                await queryRunner.query(
                    `ALTER TABLE "cars"."refresh_tokens" DROP CONSTRAINT IF EXISTS "PK_7d8bee0204106019488c4c50ffa"`,
                );
            }
            await queryRunner.query(
                `ALTER TABLE "cars"."refresh_tokens" DROP COLUMN IF EXISTS "id"`,
            );
            await queryRunner.query(
                `ALTER TABLE "cars"."refresh_tokens" ADD "id" SERIAL NOT NULL`,
            );
            await queryRunner.query(
                `ALTER TABLE "cars"."refresh_tokens" ADD CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id")`,
            );
            await queryRunner.query(
                `ALTER TABLE "cars"."refresh_tokens" ADD CONSTRAINT "FK_610102b60fea1455310ccd299de" FOREIGN KEY ("userId") REFERENCES "cars"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
            );
        }

        // Revert sms_verifications changes
        const smsVerificationsIdType = await this.getColumnType(
            queryRunner,
            'sms_verifications',
            'id',
        );
        if (smsVerificationsIdType?.includes('uuid')) {
            if (
                await this.constraintExists(
                    queryRunner,
                    'PK_b791c2dc91b2f3d3608b3acb29f',
                )
            ) {
                await queryRunner.query(
                    `ALTER TABLE "cars"."sms_verifications" DROP CONSTRAINT IF EXISTS "PK_b791c2dc91b2f3d3608b3acb29f"`,
                );
            }
            await queryRunner.query(
                `ALTER TABLE "cars"."sms_verifications" DROP COLUMN IF EXISTS "id"`,
            );
            await queryRunner.query(
                `ALTER TABLE "cars"."sms_verifications" ADD "id" SERIAL NOT NULL`,
            );
            await queryRunner.query(
                `ALTER TABLE "cars"."sms_verifications" ADD CONSTRAINT "PK_b791c2dc91b2f3d3608b3acb29f" PRIMARY KEY ("id")`,
            );
        }

        // Remove columns from users
        if (await this.columnExists(queryRunner, 'users', 'isDeactivated')) {
            await queryRunner.query(
                `ALTER TABLE "cars"."users" DROP COLUMN IF EXISTS "isDeactivated"`,
            );
        }
        if (await this.columnExists(queryRunner, 'users', 'rating')) {
            await queryRunner.query(
                `ALTER TABLE "cars"."users" DROP COLUMN IF EXISTS "rating"`,
            );
        }
        if (await this.columnExists(queryRunner, 'users', 'deletedAt')) {
            await queryRunner.query(
                `ALTER TABLE "cars"."users" DROP COLUMN IF EXISTS "deletedAt"`,
            );
        }

        // Drop new tables
        await queryRunner.query(`DROP TABLE IF EXISTS "cars"."favorite_chats"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "cars"."chat_users"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "cars"."user_block"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "cars"."notifications"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "cars"."followers"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "cars"."subscriptions"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "cars"."reviews"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "cars"."chats"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "cars"."unread_chats"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "cars"."messages"`);
        await queryRunner.query(
            `DROP TABLE IF EXISTS "cars"."message_contents"`,
        );

        // Recreate old tables
        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS "cars"."chat" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "uniqueKey" character varying NOT NULL, "lastMessageContent" character varying, "lastMessageCreatedAt" TIMESTAMP, "unreadCountForUserA" integer NOT NULL DEFAULT '0', "unreadCountForUserB" integer NOT NULL DEFAULT '0', "userAId" integer, "userBId" integer, CONSTRAINT "UQ_8febe36332a28b664a2b2434fad" UNIQUE ("uniqueKey"), CONSTRAINT "PK_9d0b2ba74336710fd31154738a5" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_8febe36332a28b664a2b2434fa" ON "cars"."chat" ("uniqueKey") `,
        );
        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS "cars"."message" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "content" text NOT NULL, "attachments" jsonb NOT NULL DEFAULT '[]', "isRead" boolean NOT NULL DEFAULT false, "isDeleted" boolean NOT NULL DEFAULT false, "chatId" uuid, "senderId" integer, CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id"))`,
        );
        if (
            !(await this.constraintExists(
                queryRunner,
                'FK_928d33ac6fe5d505cbc21b46511',
            ))
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."chat" ADD CONSTRAINT "FK_928d33ac6fe5d505cbc21b46511" FOREIGN KEY ("userAId") REFERENCES "cars"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
            );
        }
        if (
            !(await this.constraintExists(
                queryRunner,
                'FK_94b99bfa9e0c52a67b5ca71e53d',
            ))
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."chat" ADD CONSTRAINT "FK_94b99bfa9e0c52a67b5ca71e53d" FOREIGN KEY ("userBId") REFERENCES "cars"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
            );
        }
        if (
            !(await this.constraintExists(
                queryRunner,
                'FK_619bc7b78eba833d2044153bacc',
            ))
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."message" ADD CONSTRAINT "FK_619bc7b78eba833d2044153bacc" FOREIGN KEY ("chatId") REFERENCES "cars"."chat"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
            );
        }
        if (
            !(await this.constraintExists(
                queryRunner,
                'FK_bc096b4e18b1f9508197cd98066',
            ))
        ) {
            await queryRunner.query(
                `ALTER TABLE "cars"."message" ADD CONSTRAINT "FK_bc096b4e18b1f9508197cd98066" FOREIGN KEY ("senderId") REFERENCES "cars"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
            );
        }
    }
}
