import { PostStatusEnum } from '../../database/enums';
import { FileEntity, Hashtag, PostFile } from '../../database/entities';

export interface PostWithFile {
    id: string;
    description: string;
    status: PostStatusEnum;
    createdAt: Date;
    updatedAt: Date;
    cover: FileEntity;
    hashtags?: Hashtag[];
    files?: PostFile[];
}
