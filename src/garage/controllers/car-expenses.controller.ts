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
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from '../../auth/guards';
import { AuthUser } from '../../auth/decorators';
import { JwtUserData } from '../../users/types';
import { CarExpensesService } from '../services';
import { CreateCarExpenseDto, UpdateCarExpenseDto } from '../dto';
import { CAR_EXPENSE_API_DOCS } from '../swagger';

@ApiTags('Garage – Expenses')
@Controller('garage/cars/:carId/expenses')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtGuard)
export class CarExpensesController {
    constructor(private readonly carExpensesService: CarExpensesService) {}

    @Post()
    @ApiOperation(CAR_EXPENSE_API_DOCS.OPERATIONS.CREATE_EXPENSE)
    @ApiBody(CAR_EXPENSE_API_DOCS.BODIES.CREATE_EXPENSE)
    @ApiOkResponse(CAR_EXPENSE_API_DOCS.RESPONSES.CREATE_EXPENSE)
    @ApiResponse(CAR_EXPENSE_API_DOCS.RESPONSES.BAD_REQUEST)
    @ApiResponse(CAR_EXPENSE_API_DOCS.RESPONSES.UNAUTHORIZED)
    async create(
        @Param('carId', ParseUUIDPipe) carId: string,
        @Body() createCarExpenseDto: CreateCarExpenseDto,
        @AuthUser() user: JwtUserData,
    ) {
        return this.carExpensesService.create(
            user.sub,
            carId,
            createCarExpenseDto,
        );
    }

    @Get()
    @ApiOperation(CAR_EXPENSE_API_DOCS.OPERATIONS.GET_ALL_EXPENSES)
    @ApiOkResponse(CAR_EXPENSE_API_DOCS.RESPONSES.GET_ALL_EXPENSES)
    @ApiResponse(CAR_EXPENSE_API_DOCS.RESPONSES.UNAUTHORIZED)
    async getAll(
        @Param('carId', ParseUUIDPipe) carId: string,
        @AuthUser() user: JwtUserData,
    ) {
        return this.carExpensesService.getAll(user.sub, carId);
    }

    @Get(':expenseId')
    @ApiOperation(CAR_EXPENSE_API_DOCS.OPERATIONS.GET_EXPENSE)
    @ApiParam(CAR_EXPENSE_API_DOCS.PARAMS.EXPENSE_ID)
    @ApiOkResponse(CAR_EXPENSE_API_DOCS.RESPONSES.GET_EXPENSE)
    @ApiResponse(CAR_EXPENSE_API_DOCS.RESPONSES.NOT_FOUND)
    @ApiResponse(CAR_EXPENSE_API_DOCS.RESPONSES.UNAUTHORIZED)
    async getOne(
        @Param('carId', ParseUUIDPipe) carId: string,
        @Param('expenseId', ParseUUIDPipe) expenseId: string,
        @AuthUser() user: JwtUserData,
    ) {
        return this.carExpensesService.getOne(user.sub, carId, expenseId);
    }

    @Patch(':expenseId')
    @ApiOperation(CAR_EXPENSE_API_DOCS.OPERATIONS.UPDATE_EXPENSE)
    @ApiParam(CAR_EXPENSE_API_DOCS.PARAMS.EXPENSE_ID)
    @ApiBody(CAR_EXPENSE_API_DOCS.BODIES.UPDATE_EXPENSE)
    @ApiOkResponse(CAR_EXPENSE_API_DOCS.RESPONSES.UPDATE_EXPENSE)
    @ApiResponse(CAR_EXPENSE_API_DOCS.RESPONSES.NOT_FOUND)
    @ApiResponse(CAR_EXPENSE_API_DOCS.RESPONSES.BAD_REQUEST)
    @ApiResponse(CAR_EXPENSE_API_DOCS.RESPONSES.UNAUTHORIZED)
    async update(
        @Param('carId', ParseUUIDPipe) carId: string,
        @Param('expenseId', ParseUUIDPipe) expenseId: string,
        @Body() updateCarExpenseDto: UpdateCarExpenseDto,
        @AuthUser() user: JwtUserData,
    ) {
        return this.carExpensesService.update(
            user.sub,
            carId,
            expenseId,
            updateCarExpenseDto,
        );
    }

    @Delete(':expenseId')
    @ApiOperation(CAR_EXPENSE_API_DOCS.OPERATIONS.DELETE_EXPENSE)
    @ApiParam(CAR_EXPENSE_API_DOCS.PARAMS.EXPENSE_ID)
    @ApiOkResponse(CAR_EXPENSE_API_DOCS.RESPONSES.DELETE_EXPENSE)
    @ApiResponse(CAR_EXPENSE_API_DOCS.RESPONSES.NOT_FOUND)
    @ApiResponse(CAR_EXPENSE_API_DOCS.RESPONSES.UNAUTHORIZED)
    async delete(
        @Param('carId', ParseUUIDPipe) carId: string,
        @Param('expenseId', ParseUUIDPipe) expenseId: string,
        @AuthUser() user: JwtUserData,
    ) {
        return this.carExpensesService.delete(user.sub, carId, expenseId);
    }
}
