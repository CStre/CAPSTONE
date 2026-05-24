/**
 * @fileoverview Emits the GraphQL schema as SDL to backend/schema.graphql.
 *
 * The frontend's GraphQL Code Generator reads that file. Re-run after any
 * schema change: `npm run printschema`.
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { lexicographicSortSchema, printSchema } from 'graphql';
import { schema } from '../src/schema';

const outputPath = join(import.meta.dirname, '..', 'schema.graphql');
writeFileSync(outputPath, printSchema(lexicographicSortSchema(schema)) + '\n');
console.log(`Wrote ${outputPath}`);
