import { Injectable } from '@nestjs/common';
import { StorageService } from '.';

@Injectable()
export class FileUrlsService {
    constructor(private readonly storageService: StorageService) {}

    async addSignedUrl<T extends { url?: string }>(obj: T): Promise<T> {
        if (!obj?.url) return obj;
        const signedUrl = await this.storageService.getFileUrl(obj.url);
        return { ...obj, url: signedUrl };
    }

    async addSignedUrls<T extends { url?: string }>(arr: T[]): Promise<T[]> {
        if (!arr || arr.length === 0) return arr;
        return Promise.all(arr.map((x) => this.addSignedUrl(x)));
    }

    async addSignedUrlsDeep<T>(obj: T): Promise<T> {
        if (!obj || typeof obj !== 'object') return obj;

        if (Array.isArray(obj)) {
            const mapped = await Promise.all(
                obj.map((item) => this.addSignedUrlsDeep(item)),
            );
            return mapped as unknown as T;
        }

        const plain = obj as Record<string, unknown>;
        const newObj: Record<string, unknown> = { ...plain };

        if (typeof plain.url === 'string')
            newObj.url = await this.storageService.getFileUrl(plain.url);

        for (const key of Object.keys(plain)) {
            const value = plain[key];
            if (value && typeof value === 'object')
                newObj[key] = await this.addSignedUrlsDeep(value);
        }

        return newObj as T;
    }
}
