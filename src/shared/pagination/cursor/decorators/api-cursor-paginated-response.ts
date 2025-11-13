import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

import { CursorDto } from '../dto';

export const ApiCursorPaginatedResponse = <TModel extends Type<any>>(
    model: TModel,
) => {
    return applyDecorators(
        ApiExtraModels(CursorDto),
        ApiOkResponse({
            description: 'Successfully received model list',
            schema: {
                allOf: [
                    { $ref: getSchemaPath(CursorDto) },
                    {
                        properties: {
                            items: {
                                type: 'array',
                                items: { $ref: getSchemaPath(model) },
                            },
                        },
                    },
                ],
            },
        }),
    );
};
