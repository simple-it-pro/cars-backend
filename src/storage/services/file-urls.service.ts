import { Injectable } from '@nestjs/common';
import { StorageService } from '.';

@Injectable()
export class FileUrlsService {
    constructor(private readonly storageService: StorageService) {}

    async addSignedUrlsDeep<T>(obj: T): Promise<T> {
        const visited = new WeakSet<object>();
        const processed = await this.processValue(obj as unknown, visited);
        return processed as T;
    }

    private async processValue(
        value: unknown,
        visited: WeakSet<object>,
    ): Promise<unknown> {
        if (value === null || value === undefined) {
            return value;
        }

        const valueType = typeof value;

        if (valueType !== 'object') {
            return value;
        }

        if (value instanceof Date) {
            return value;
        }

        if (Array.isArray(value)) {
            const result: unknown[] = [];
            for (const item of value) {
                const processedItem = await this.processValue(item, visited);
                result.push(processedItem);
            }
            return result;
        }

        const obj = value as Record<string, unknown>;

        if (visited.has(obj)) return obj;

        visited.add(obj);

        if (typeof obj.url === 'string') {
            obj.url = await this.storageService.getFileUrl(obj.url);
        }

        const keys = Object.keys(obj);
        for (const key of keys) {
            const fieldValue = obj[key];

            if (fieldValue && typeof fieldValue === 'object') {
                obj[key] = await this.processValue(fieldValue, visited);
            }
        }

        return obj;
    }
}
