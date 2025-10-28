import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import axios from 'axios';

import { sms } from '../../config';

const SMS_RU_URL = 'https://sms.ru/sms/send';

@Injectable()
export class SmsService {
    private readonly logger = new Logger(SmsService.name);

    constructor(@Inject(sms.KEY) private smsConfig: ConfigType<typeof sms>) {}

    async sendVerificationCode(phone: string, code: string): Promise<boolean> {
        if (this.smsConfig.testMode) {
            this.logger.debug(`[TEST MODE] SMS to: ${phone}, code: ${code}`);
            return true;
        }

        if (!this.smsConfig.apiId) {
            this.logger.error('SMS_RU_API_ID is not configured');
            return false;
        }

        const message = `Ваш код подтверждения: ${code}`;

        const params = {
            api_id: this.smsConfig.apiId,
            to: phone,
            msg: message,
            json: 1,
        };

        try {
            const response = await axios.get(SMS_RU_URL, {
                params,
                timeout: 10000,
            });

            this.logger.debug(
                `SMS.ru response: ${JSON.stringify(response.data)}`,
            );

            if (response.data.status === 'OK') {
                const smsStatus = response.data.sms?.[phone]?.status;
                if (smsStatus === 'OK') {
                    this.logger.log(`SMS successfully sent to ${phone}`);
                    return true;
                } else {
                    this.logger.error(
                        `SMS sending failed for ${phone}: ${smsStatus}`,
                    );
                    return false;
                }
            } else {
                this.logger.error(
                    `SMS.ru API error: ${response.data.status_code} - ${response.data.status_text}`,
                );
                return false;
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    this.logger.error(
                        `SMS.ru API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`,
                    );
                } else if (error.request) {
                    this.logger.error(
                        'No response received from SMS.ru',
                        error.message,
                    );
                } else {
                    this.logger.error(
                        'Error setting up SMS request',
                        error.message,
                    );
                }
            } else {
                this.logger.error('Unexpected error sending SMS', error);
            }
            return false;
        }
    }
}
