import { registerAs } from '@nestjs/config';

export default registerAs('s3', () => ({
    accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
    bucketName: process.env.S3_BUCKET_NAME as string,
    endpoint: process.env.S3_ENDPOINT as string,
    region: process.env.S3_REGION as string,
}));
