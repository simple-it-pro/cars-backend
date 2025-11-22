import { Module } from '@nestjs/common';

import { SmsService } from './services';

@Module({
    providers: [SmsService],
    exports: [SmsService],
})
export class SmsModule {}
