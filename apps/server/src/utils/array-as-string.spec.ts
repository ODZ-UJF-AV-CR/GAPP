import { describe, expect, it } from 'vitest';
import { arrayAsString } from './array-as-string.ts';

describe('arrayAsString', () => {
    it('quotes every item', () => {
        expect(arrayAsString(['alpha', 'bravo'])).toBe('["alpha","bravo"]');
    });

    it('stringifies numbers', () => {
        expect(arrayAsString([1, 2])).toBe('["1","2"]');
    });

    it('escapes quotes so a callsign cannot break out of the flux literal', () => {
        expect(arrayAsString(['ev"il'])).toBe('["ev\\"il"]');
    });

    it('escapes backslashes before quotes', () => {
        expect(arrayAsString(['back\\slash'])).toBe('["back\\\\slash"]');
    });

    it('handles an injection attempt as a single literal', () => {
        const result = arrayAsString(['a"]) or true //']);

        expect(result).toBe('["a\\"]) or true //"]');
        // only the two delimiting quotes stay unescaped, so the payload cannot close the literal early
        expect(result.match(/(?<!\\)"/g)).toHaveLength(2);
    });

    it('returns an empty list for no items', () => {
        expect(arrayAsString([])).toBe('[]');
    });
});
