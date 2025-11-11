export const isSingleFile = (value: unknown): value is Express.Multer.File => {
    return (
        typeof value === 'object' &&
        value !== null &&
        'mimetype' in value &&
        'originalname' in value
    );
};
