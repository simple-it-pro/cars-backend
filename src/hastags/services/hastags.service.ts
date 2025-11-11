import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { Hashtag } from '../../database/entities';

@Injectable()
export class HashtagsService {
    constructor(
        @InjectRepository(Hashtag)
        private readonly hashtagRepository: Repository<Hashtag>,
    ) {}

    async getHashatgsFromTextAndSave(text: string) {
        const hashtags = this.getHashtagsFromText(text);

        const hashtagsInDatabase = await this.hashtagRepository.find({
            where: {
                name: In(hashtags),
            },
        });

        const hashtagsToSave = hashtags
            .filter(
                (hashtag) =>
                    !hashtagsInDatabase.find(
                        (hastagFromDb) => hastagFromDb.name === hashtag,
                    ),
            )
            .map((hashtag) => this.hashtagRepository.create({ name: hashtag }));

        const savedHashtags = hashtagsToSave.length
            ? await this.hashtagRepository.save(hashtagsToSave)
            : [];

        return [...savedHashtags, ...hashtagsInDatabase];
    }

    private getHashtagsFromText(text: string) {
        const hashtags = text
            .match(/#[A-Za-zА-Яа-яЁё0-9_]+/gu)
            ?.map((hashtag) => hashtag.slice(1));

        return hashtags ? [...new Set(hashtags)] : [];
    }
}
