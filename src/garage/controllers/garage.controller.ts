import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

import { GarageService } from '../services';
import { CreateCarDto, UpdateCarDto } from '../dto';
import { JwtGuard } from '../../auth/guards';
import { AuthUser } from '../../auth/decorators';
import { JwtUserData } from '../../users/types';
import { CarStatus } from '../../database/enums/cars';
import { GARAGE_API_DOCS, GARAGE_BODIES } from '../swagger';
import { FilesInterceptor } from '@nestjs/platform-express';

@ApiTags('Garage - Cars')
@Controller('garage/cars')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtGuard)
export class GarageController {
    constructor(private readonly garageService: GarageService) {}

    @Post()
    @ApiOperation(GARAGE_API_DOCS.OPERATIONS.CREATE_CAR)
    @ApiBody(GARAGE_BODIES.CREATE_CAR)
    @ApiOkResponse(GARAGE_API_DOCS.RESPONSES.CREATE_CAR)
    @ApiResponse(GARAGE_API_DOCS.RESPONSES.BAD_REQUEST)
    @ApiResponse(GARAGE_API_DOCS.RESPONSES.UNAUTHORIZED)
    async create(
        @Body() createCarDto: CreateCarDto,
        @AuthUser() user: JwtUserData,
    ) {
        return this.garageService.create(user.sub, createCarDto);
    }

    @Get()
    @ApiOperation(GARAGE_API_DOCS.OPERATIONS.GET_ALL_CARS)
    @ApiOkResponse(GARAGE_API_DOCS.RESPONSES.GET_ALL_CARS)
    @ApiResponse(GARAGE_API_DOCS.RESPONSES.UNAUTHORIZED)
    @ApiQuery(GARAGE_API_DOCS.QUERIES.STATUS_OPTIONAL)
    async getAll(
        @AuthUser() user: JwtUserData,
        @Query('status') status?: CarStatus,
    ) {
        return this.garageService.getAll(user.sub, status);
    }

    @Get(':id')
    @ApiOperation(GARAGE_API_DOCS.OPERATIONS.GET_CAR)
    @ApiParam(GARAGE_API_DOCS.PARAMS.CAR_ID)
    @ApiOkResponse(GARAGE_API_DOCS.RESPONSES.GET_CAR)
    @ApiResponse(GARAGE_API_DOCS.RESPONSES.NOT_FOUND)
    @ApiResponse(GARAGE_API_DOCS.RESPONSES.UNAUTHORIZED)
    async getOne(
        @Param('id', ParseUUIDPipe) id: string,
        @AuthUser() user: JwtUserData,
    ) {
        return this.garageService.getOne(user.sub, id);
    }

    @Patch(':id')
    @ApiOperation(GARAGE_API_DOCS.OPERATIONS.UPDATE_CAR)
    @ApiParam(GARAGE_API_DOCS.PARAMS.CAR_ID)
    @ApiBody(GARAGE_BODIES.UPDATE_CAR)
    @ApiOkResponse(GARAGE_API_DOCS.RESPONSES.UPDATE_CAR)
    @ApiResponse(GARAGE_API_DOCS.RESPONSES.NOT_FOUND)
    @ApiResponse(GARAGE_API_DOCS.RESPONSES.BAD_REQUEST)
    @ApiResponse(GARAGE_API_DOCS.RESPONSES.UNAUTHORIZED)
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateCarDto: UpdateCarDto,
        @AuthUser() user: JwtUserData,
    ) {
        return this.garageService.update(user.sub, id, updateCarDto);
    }

    @Delete(':id')
    @ApiOperation(GARAGE_API_DOCS.OPERATIONS.DELETE_CAR)
    @ApiParam(GARAGE_API_DOCS.PARAMS.CAR_ID)
    @ApiOkResponse(GARAGE_API_DOCS.RESPONSES.DELETE_CAR)
    @ApiResponse(GARAGE_API_DOCS.RESPONSES.NOT_FOUND)
    @ApiResponse(GARAGE_API_DOCS.RESPONSES.UNAUTHORIZED)
    async delete(
        @Param('id', ParseUUIDPipe) id: string,
        @AuthUser() user: JwtUserData,
    ) {
        return this.garageService.delete(user.sub, id);
    }

    @Patch(':id/status')
    @ApiOperation(GARAGE_API_DOCS.OPERATIONS.CHANGE_CAR_STATUS)
    @ApiParam(GARAGE_API_DOCS.PARAMS.CAR_ID)
    @ApiBody(GARAGE_BODIES.CHANGE_CAR_STATUS)
    @ApiOkResponse(GARAGE_API_DOCS.RESPONSES.CHANGE_CAR_STATUS)
    @ApiResponse(GARAGE_API_DOCS.RESPONSES.INVALID_STATUS_TRANSITION)
    @ApiResponse(GARAGE_API_DOCS.RESPONSES.NOT_FOUND)
    @ApiResponse(GARAGE_API_DOCS.RESPONSES.UNAUTHORIZED)
    async changeStatus(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() body: { status: CarStatus; price?: number },
        @AuthUser() user: JwtUserData,
    ) {
        return this.garageService.changeStatus(
            user.sub,
            id,
            body.status,
            body.price,
        );
    }
    @Post(':id/photos')
    @ApiOperation(GARAGE_API_DOCS.OPERATIONS.ADD_CAR_PHOTOS)
    @ApiParam(GARAGE_API_DOCS.PARAMS.CAR_ID)
    @ApiConsumes('multipart/form-data')
    @ApiBody(GARAGE_BODIES.ADD_CAR_PHOTOS)
    @ApiOkResponse(GARAGE_API_DOCS.RESPONSES.ADD_CAR_PHOTOS)
    @ApiResponse(GARAGE_API_DOCS.RESPONSES.NO_PHOTOS)
    @ApiResponse(GARAGE_API_DOCS.RESPONSES.NOT_FOUND)
    @ApiResponse(GARAGE_API_DOCS.RESPONSES.UNAUTHORIZED)
    @UseInterceptors(FilesInterceptor('photos', 10))
    async addPhotos(
        @Param('id', ParseUUIDPipe) id: string,
        @UploadedFiles() photos: Express.Multer.File[],
        @AuthUser() user: JwtUserData,
    ) {
        return this.garageService.addPhotos(id, user.sub, photos);
    }

    @Delete(':id/photos/:photoId')
    @ApiOperation(GARAGE_API_DOCS.OPERATIONS.REMOVE_CAR_PHOTO)
    @ApiParam(GARAGE_API_DOCS.PARAMS.CAR_ID)
    @ApiParam(GARAGE_API_DOCS.PARAMS.PHOTO_ID)
    @ApiOkResponse(GARAGE_API_DOCS.RESPONSES.REMOVE_CAR_PHOTO)
    @ApiResponse(GARAGE_API_DOCS.RESPONSES.PHOTO_NOT_FOUND)
    @ApiResponse(GARAGE_API_DOCS.RESPONSES.NOT_FOUND)
    @ApiResponse(GARAGE_API_DOCS.RESPONSES.UNAUTHORIZED)
    async removePhoto(
        @Param('id', ParseUUIDPipe) id: string,
        @Param('photoId', ParseUUIDPipe) photoId: string,
        @AuthUser() user: JwtUserData,
    ) {
        return this.garageService.removePhoto(id, photoId, user.sub);
    }

    @Patch(':id/photos/reorder')
    @ApiOperation(GARAGE_API_DOCS.OPERATIONS.REORDER_CAR_PHOTOS)
    @ApiParam(GARAGE_API_DOCS.PARAMS.CAR_ID)
    @ApiBody(GARAGE_BODIES.REORDER_PHOTOS)
    @ApiOkResponse(GARAGE_API_DOCS.RESPONSES.REORDER_CAR_PHOTOS)
    @ApiResponse(GARAGE_API_DOCS.RESPONSES.NOT_FOUND)
    @ApiResponse(GARAGE_API_DOCS.RESPONSES.BAD_REQUEST)
    @ApiResponse(GARAGE_API_DOCS.RESPONSES.UNAUTHORIZED)
    async reorderPhotos(
        @Param('id', ParseUUIDPipe) id: string,
        @Body('photoIds') photoIds: string[],
        @AuthUser() user: JwtUserData,
    ) {
        return this.garageService.reorderPhotos(id, photoIds, user.sub);
    }
}
