import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

import { FileEntity, Post } from '.';

@Entity({ name: 'post_files' })
class PostFile {
    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column('int')
    order: number;

    @ManyToOne(() => Post, (post) => post.files, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    post: Post;

    @OneToOne(() => FileEntity, (file) => file.postFile, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn()
    file: FileEntity;
}

export default PostFile;
