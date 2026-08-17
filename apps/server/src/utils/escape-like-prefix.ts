const LIKE_SPECIAL_CHARS = /[\\%_]/g;

/** @description Escapes a literal so it can be safely used as a LIKE prefix, backslash is the default LIKE escape in Postgres */
export const escapeLikePrefix = (value: string) => value.replace(LIKE_SPECIAL_CHARS, (char) => `\\${char}`);
