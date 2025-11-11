import {
    ParseFileOptions,
    PipeTransform,
    FileValidator,
    HttpStatus,
    HttpException,
} from '@nestjs/common';

export class ParseFilesPipe implements PipeTransform {
    private readonly fileIsRequired: boolean;
    private readonly validators: FileValidator[];
    private readonly exceptionFactory: (error: string) => unknown;
    private readonly errorHttpStatusCode: HttpStatus;

    constructor(options?: ParseFileOptions) {
        this.fileIsRequired = options?.fileIsRequired || true;
        this.validators = options?.validators || [];
        this.errorHttpStatusCode =
            options?.errorHttpStatusCode || HttpStatus.BAD_REQUEST;
        this.exceptionFactory =
            options?.exceptionFactory ||
            ((error: string) =>
                new HttpException(error, this.errorHttpStatusCode));
    }

    async transform(
        files:
            | Express.Multer.File
            | Express.Multer.File[]
            | Record<string, Express.Multer.File[]>
            | undefined,
    ) {
        if (!files) {
            if (this.fileIsRequired)
                throw this.exceptionFactory('No file uploaded');
            return [];
        }

        const filesArray = this.normalize(files);
        const errors: string[] = [];

        for (const validator of this.validators) {
            for (const file of filesArray) {
                const isValid = await validator.isValid(file);

                if (!isValid) errors.push(validator.buildErrorMessage(file));
            }
        }

        if (errors.length) throw this.exceptionFactory(errors.join('. '));

        return files;
    }

    private normalize(value: unknown): Express.Multer.File[] {
        if (Array.isArray(value)) return value as Express.Multer.File[];
        if (value && typeof value === 'object') {
            return Object.values(value).flat() as Express.Multer.File[];
        }
        return [value] as Express.Multer.File[];
    }
}
