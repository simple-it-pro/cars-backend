import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { FileWithFormat } from '../../files/interfaces';
import { FilesService } from '../../files/services';
import { Post, PostFile } from '../../database/entities';

@Injectable()
export class PostFilesService {
    constructor(
        @InjectRepository(Post)
        private readonly postsRepository: Repository<Post>,
        private readonly filesService: FilesService,
    ) {}

    preUploadFile(file: FileWithFormat) {
        return this.filesService.preUploadFile(file);
    }

    async deleteFile(id: string) {
        const post = await this.postsRepository.findOne({
            where: { files: { file: { id } } },
            select: ['id'],
        });

        if (!post) return this.filesService.deleteFile(id);

        const postWithFiles = (await this.postsRepository.findOne({
            where: { id: post.id },
            relations: ['files', 'files.file'],
        })) as Post;

        if (postWithFiles.files.length <= 1)
            throw new BadRequestException(
                'Нельзя удалить последний файл поста',
            );

        const newPostFiles = postWithFiles.files
            .sort((a, b) => a.order - b.order)
            .reduce<PostFile[]>((acc, postFile) => {
                if (postFile.file.id === id) return acc;

                const order =
                    acc.length > 0 ? acc[acc.length - 1].order + 1 : 0;

                return [...acc, { ...postFile, order }];
            }, []);

        return this.postsRepository.manager.transaction(async (manager) => {
            await manager.save(PostFile, newPostFiles);
            await this.filesService.deleteFile(id);
        });
    }
}
