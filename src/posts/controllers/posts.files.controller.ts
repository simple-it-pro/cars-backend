import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
    ParseFilePipe,
    MaxFileSizeValidator,
    UseGuards,
    Param,
    Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiBearerAuth,
    ApiConsumes,
    ApiOperation,
    ApiResponse,
    ApiTags,
    ApiBody,
} from '@nestjs/swagger';

import { DetectFileFormatPipe } from '../../files/pipes';
import { FileWithFormat } from '../../files/interfaces';
import { FileTypeValidator } from '../../files/validators';
import { JwtGuard } from '../../auth/guards';
import { GetPostFileParamsDto } from '../dto/params';
import { PostFilesService } from '../services';
import { FileEntity } from '../../database/entities';
import { POST_FILE_PREUPLOAD_BODY } from '../posts.swagger';

@ApiTags('Post Files')
@ApiBearerAuth('JWT-auth')
@Controller('files')
@UseGuards(JwtGuard)
export class PostsFilesController {
    constructor(private readonly postFilesService: PostFilesService) {}

    @ApiOperation({ summary: 'Предварительно загрузить файл' })
    @ApiResponse({
        status: 200,
        description: 'Файл успешно предварительно загружен',
        type: FileEntity,
    })
    @ApiResponse({ status: 400, description: 'Неверный формат файла' })
    @ApiResponse({ status: 413, description: 'Файл слишком большой' })
    @ApiConsumes('multipart/form-data')
    @ApiBody(POST_FILE_PREUPLOAD_BODY)
    @Post('pre-upload')
    @UseInterceptors(FileInterceptor('file'))
    async preUploadFile(
        @UploadedFile(
            new DetectFileFormatPipe(),
            new ParseFilePipe({
                validators: [
                    new FileTypeValidator({
                        mimeTypes: [/image\/(jpeg|jpg|png|webp)/gi],
                    }),
                    new MaxFileSizeValidator({
                        maxSize: 10 * 1024 * 1024,
                        message:
                            'Файл слишком большой. Максимальный размер 10MB',
                    }),
                ],
            }),
        )
        file: FileWithFormat,
    ) {
        return this.postFilesService.preUploadFile(file);
    }

    @ApiOperation({ summary: 'Удалить файл поста' })
    @ApiResponse({
        status: 200,
        description: 'Файл успешно удален',
        type: String,
    })
    @ApiResponse({ status: 404, description: 'Файл не найден' })
    @Delete(':id')
    async deleteFile(@Param() { id }: GetPostFileParamsDto) {
        return this.postFilesService.deleteFile(id);
    }
}
