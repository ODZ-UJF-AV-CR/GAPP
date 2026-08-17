import { describe, expect, it } from 'vitest';
import { escapeLikePrefix } from './escape-like-prefix.ts';

describe('escapeLikePrefix', () => {
    it('leaves a plain name untouched', () => {
        expect(escapeLikePrefix('balloon')).toBe('balloon');
    });

    it('escapes the single character wildcard so a name is not matched loosely', () => {
        expect(escapeLikePrefix('bal_oon')).toBe('bal\\_oon');
    });

    it('escapes the multi character wildcard', () => {
        expect(escapeLikePrefix('bal%oon')).toBe('bal\\%oon');
    });

    it('escapes backslashes', () => {
        expect(escapeLikePrefix('bal\\oon')).toBe('bal\\\\oon');
    });
});
