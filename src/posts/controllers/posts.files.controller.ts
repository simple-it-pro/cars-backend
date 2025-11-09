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
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';

import { DetectFileFormatPipe } from '../../files/pipes';
import { FileWithFormat } from '../../files/interfaces';
import { FileTypeValidator } from '../../files/validators';
import { JwtGuard } from '../../auth/guards';
import { GetPostFileParamsDto } from '../dto/params';
import { PostFilesService } from '../services';

@ApiBearerAuth('JWT-auth')
@Controller('files')
@UseGuards(JwtGuard)
export class PostsFilesController {
    constructor(private readonly postFilesService: PostFilesService) {}

    @Post('pre-upload')
    @ApiConsumes('multipart/form-data')
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

    @Delete(':id')
    async deleteFile(@Param() { id }: GetPostFileParamsDto) {
        return this.postFilesService.deleteFile(id);
    }
}
