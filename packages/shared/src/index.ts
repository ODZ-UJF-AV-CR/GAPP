import { type Static, Type } from '@sinclair/typebox';

export const add = (a: number, b: number) => a + b;

export const ExampleSchema = Type.Object({
    message: Type.String(),
});

export type ExampleType = Static<typeof ExampleSchema>;
