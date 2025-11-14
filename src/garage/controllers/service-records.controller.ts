import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiExtraModels,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

import { JwtGuard } from '../../auth/guards';
import { AuthUser } from '../../auth/decorators';
import { JwtUserData } from '../../users/types';
import { ServiceRecordsService } from '../services';
import { CreateServiceRecordDto, UpdateServiceRecordDto } from '../dto';
import { SERVICE_RECORDS_API_DOCS } from '../swagger';
import { ServiceRecord } from '../../database/entities';

@ApiTags('Garage – Service Records')
@ApiBearerAuth('JWT-auth')
@ApiExtraModels(ServiceRecord)
@UseGuards(JwtGuard)
@Controller('garage/cars/:carId/service-records')
export class ServiceRecordsController {
    constructor(
        private readonly serviceRecordsService: ServiceRecordsService,
    ) {}

    @Post()
    @ApiOperation(SERVICE_RECORDS_API_DOCS.OPERATIONS.CREATE_SERVICE_RECORD)
    @ApiBody(SERVICE_RECORDS_API_DOCS.BODIES.CREATE_SERVICE_RECORD)
    @ApiOkResponse(SERVICE_RECORDS_API_DOCS.RESPONSES.CREATE_SERVICE_RECORD)
    @ApiResponse(SERVICE_RECORDS_API_DOCS.RESPONSES.BAD_REQUEST)
    @ApiResponse(SERVICE_RECORDS_API_DOCS.RESPONSES.UNAUTHORIZED)
    async create(
        @Param('carId', ParseUUIDPipe) carId: string,
        @Body() createServiceRecordDto: CreateServiceRecordDto,
        @AuthUser() user: JwtUserData,
    ) {
        return this.serviceRecordsService.create(
            user.sub,
            carId,
            createServiceRecordDto,
        );
    }

    @Get()
    @ApiOperation(SERVICE_RECORDS_API_DOCS.OPERATIONS.GET_ALL_SERVICE_RECORDS)
    @ApiOkResponse(SERVICE_RECORDS_API_DOCS.RESPONSES.GET_ALL_SERVICE_RECORDS)
    @ApiResponse(SERVICE_RECORDS_API_DOCS.RESPONSES.UNAUTHORIZED)
    async getAll(
        @Param('carId', ParseUUIDPipe) carId: string,
        @AuthUser() user: JwtUserData,
    ) {
        return this.serviceRecordsService.getAll(user.sub, carId);
    }

    @Get(':recordId')
    @ApiOperation(SERVICE_RECORDS_API_DOCS.OPERATIONS.GET_SERVICE_RECORD)
    @ApiParam(SERVICE_RECORDS_API_DOCS.PARAMS.RECORD_ID)
    @ApiOkResponse(SERVICE_RECORDS_API_DOCS.RESPONSES.GET_SERVICE_RECORD)
    @ApiResponse(SERVICE_RECORDS_API_DOCS.RESPONSES.NOT_FOUND)
    @ApiResponse(SERVICE_RECORDS_API_DOCS.RESPONSES.UNAUTHORIZED)
    async getOne(
        @Param('carId', ParseUUIDPipe) carId: string,
        @Param('recordId', ParseUUIDPipe) recordId: string,
        @AuthUser() user: JwtUserData,
    ) {
        return this.serviceRecordsService.getOne(user.sub, carId, recordId);
    }

    @Patch(':recordId')
    @ApiOperation(SERVICE_RECORDS_API_DOCS.OPERATIONS.UPDATE_SERVICE_RECORD)
    @ApiParam(SERVICE_RECORDS_API_DOCS.PARAMS.RECORD_ID)
    @ApiBody(SERVICE_RECORDS_API_DOCS.BODIES.UPDATE_SERVICE_RECORD)
    @ApiOkResponse(SERVICE_RECORDS_API_DOCS.RESPONSES.UPDATE_SERVICE_RECORD)
    @ApiResponse(SERVICE_RECORDS_API_DOCS.RESPONSES.NOT_FOUND)
    @ApiResponse(SERVICE_RECORDS_API_DOCS.RESPONSES.BAD_REQUEST)
    @ApiResponse(SERVICE_RECORDS_API_DOCS.RESPONSES.UNAUTHORIZED)
    async update(
        @Param('carId', ParseUUIDPipe) carId: string,
        @Param('recordId', ParseUUIDPipe) recordId: string,
        @Body() updateServiceRecordDto: UpdateServiceRecordDto,
        @AuthUser() user: JwtUserData,
    ) {
        return this.serviceRecordsService.update(
            user.sub,
            carId,
            recordId,
            updateServiceRecordDto,
        );
    }

    @Delete(':recordId')
    @ApiOperation(SERVICE_RECORDS_API_DOCS.OPERATIONS.DELETE_SERVICE_RECORD)
    @ApiParam(SERVICE_RECORDS_API_DOCS.PARAMS.RECORD_ID)
    @ApiOkResponse(SERVICE_RECORDS_API_DOCS.RESPONSES.DELETE_SERVICE_RECORD)
    @ApiResponse(SERVICE_RECORDS_API_DOCS.RESPONSES.NOT_FOUND)
    @ApiResponse(SERVICE_RECORDS_API_DOCS.RESPONSES.UNAUTHORIZED)
    async delete(
        @Param('carId', ParseUUIDPipe) carId: string,
        @Param('recordId', ParseUUIDPipe) recordId: string,
        @AuthUser() user: JwtUserData,
    ) {
        return this.serviceRecordsService.delete(user.sub, carId, recordId);
    }
}
