import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

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

  @ApiProperty({ type: User })
  user: User;
}
