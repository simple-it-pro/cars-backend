import { PartialType } from '@nestjs/swagger';
import { CreateCarExpenseDto } from './create-car-expense.dto';

export class UpdateCarExpenseDto extends PartialType(CreateCarExpenseDto) {}
