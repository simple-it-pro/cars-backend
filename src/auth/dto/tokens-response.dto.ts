import { ApiProperty } from '@nestjs/swagger';

import { User } from '../../database/entities';

export class TokensResponseDto {
    @ApiProperty({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        description: 'JWT Access token',
    })
    accessToken: string;

    @ApiProperty({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        description: 'JWT Refresh token',
    })
    refreshToken: string;
}

export class TokensResponseDtoWithUser extends TokensResponseDto {
    @ApiProperty({ type: User })
    user: User;
}

export class WSTokenResponseDto {
    @ApiProperty({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        description: 'JWT WS token',
    })
    wsToken: string;
}
