import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import {
    Body,
    Controller,
    Delete,
    MaxFileSizeValidator,
    Param,
    ParseFilePipe,
    ParseUUIDPipe,
    Patch,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { GARAGE_API_DOCS, GARAGE_BODIES } from '../swagger';
import { AuthUser } from '../../auth/decorators';
import { JwtUserData } from '../../users/types';
import { FileInterceptor } from '@nestjs/platform-express';
import { DetectFileFormatPipe } from '../../files/pipes';
import { FileWithFormat } from '../../files/interfaces';
import { FileTypeValidator } from '../../files/validators';
import { GarageService } from '../services';
import { JwtGuard } from '../../auth/guards';

@ApiTags('Garage Files')
@Controller('garage/files')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtGuard)
export class GarageFilesController {
    constructor(private readonly garageService: GarageService) {}

    @Post(':id/photos')
    @ApiOperation(GARAGE_API_DOCS.OPERATIONS.ATTACH_CAR_PHOTOS)
    @ApiParam(GARAGE_API_DOCS.PARAMS.CAR_ID)
    @ApiBody(GARAGE_BODIES.ATTACH_CAR_PHOTOS)
    @ApiOkResponse(GARAGE_API_DOCS.RESPONSES.ATTACH_CAR_PHOTOS)
    @ApiResponse(GARAGE_API_DOCS.RESPONSES.TOO_MANY_PHOTOS)
    @ApiResponse(GARAGE_API_DOCS.RESPONSES.FILES_NOT_FOUND)
    @ApiResponse(GARAGE_API_DOCS.RESPONSES.NOT_FOUND)
    @ApiResponse(GARAGE_API_DOCS.RESPONSES.UNAUTHORIZED)
    async attachPhotos(
        @Param('id', ParseUUIDPipe) id: string,
        @Body('fileIds') fileIds: string[],
        @AuthUser() user: JwtUserData,
    ) {
        return this.garageService.attachPhotos(id, user.sub, fileIds);
    }

    @Delete(':id/photos/:fileId')
    @ApiOperation(GARAGE_API_DOCS.OPERATIONS.REMOVE_CAR_PHOTO)
    @ApiParam(GARAGE_API_DOCS.PARAMS.CAR_ID)
    @ApiParam(GARAGE_API_DOCS.PARAMS.FILE_ID)
    @ApiOkResponse(GARAGE_API_DOCS.RESPONSES.REMOVE_CAR_PHOTO)
    @ApiResponse(GARAGE_API_DOCS.RESPONSES.PHOTO_NOT_FOUND)
    @ApiResponse(GARAGE_API_DOCS.RESPONSES.NOT_FOUND)
    @ApiResponse(GARAGE_API_DOCS.RESPONSES.UNAUTHORIZED)
    async removePhoto(
        @Param('id', ParseUUIDPipe) id: string,
        @Param('fileId', ParseUUIDPipe) fileId: string,
        @AuthUser() user: JwtUserData,
    ) {
        return this.garageService.removePhoto(id, fileId, user.sub);
    }

    @Patch(':id/photos/reorder')
    @ApiOperation(GARAGE_API_DOCS.OPERATIONS.REORDER_CAR_PHOTOS)
    @ApiParam(GARAGE_API_DOCS.PARAMS.CAR_ID)
    @ApiBody(GARAGE_BODIES.REORDER_CAR_PHOTOS)
    @ApiOkResponse(GARAGE_API_DOCS.RESPONSES.REORDER_CAR_PHOTOS)
    @ApiResponse(GARAGE_API_DOCS.RESPONSES.BAD_REQUEST)
    @ApiResponse(GARAGE_API_DOCS.RESPONSES.NOT_FOUND)
    @ApiResponse(GARAGE_API_DOCS.RESPONSES.UNAUTHORIZED)
    async reorderPhotos(
        @Param('id', ParseUUIDPipe) id: string,
        @Body('photoIds') photoIds: string[],
        @AuthUser() user: JwtUserData,
    ) {
        return this.garageService.reorderPhotos(id, photoIds, user.sub);
    }

    @Post('pre-upload')
    @ApiOperation(GARAGE_API_DOCS.OPERATIONS.PRE_UPLOAD)
    @ApiConsumes('multipart/form-data')
    @ApiBody(GARAGE_BODIES.PRE_UPLOAD)
    @ApiOkResponse(GARAGE_API_DOCS.RESPONSES.PRE_UPLOAD_SUCCESS)
    @ApiResponse(GARAGE_API_DOCS.RESPONSES.INVALID_FILE_TYPE)
    @ApiResponse(GARAGE_API_DOCS.RESPONSES.FILE_TOO_LARGE)
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
        return this.garageService.preUploadFile(file);
    }
}
