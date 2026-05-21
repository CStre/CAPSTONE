/**
 * @fileoverview Local development server.
 *
 * Loads `.env`, ensures the local DynamoDB table exists, and serves GraphQL Yoga
 * over plain HTTP. Not used in AWS — the Lambda uses handler.ts.
 */
import 'dotenv/config';
import { createServer } from 'node:http';
import { yoga } from './yoga';
import { ensureLocalTable } from './db';
import { config } from './config';

async function main(): Promise<void> {
  if (config.dynamoEndpoint) {
    await ensureLocalTable();
    console.log(`DynamoDB table "${config.dynamoTable}" ready at ${config.dynamoEndpoint}`);
  }

  createServer((req, res) => void yoga(req, res)).listen(config.port, () => {
    console.log(`GraphQL ready at http://localhost:${config.port}/graphql`);
    console.log(`Auth mode: ${config.authMode}`);
  });
}

main().catch((err: unknown) => {
  console.error('Failed to start dev server:', err);
  process.exit(1);
});
