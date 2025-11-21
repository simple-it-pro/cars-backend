import { CursorDto, CursorMetaDto } from '../../../shared/pagination/cursor';
import { ReviewResponseDto } from './review-response.dto';

export class ReviewCursorDto extends CursorDto<ReviewResponseDto> {
    constructor(items: ReviewResponseDto[], meta: CursorMetaDto) {
        super(items, meta);
    }
}
