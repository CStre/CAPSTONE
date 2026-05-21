/**
 * @fileoverview AWS Lambda entrypoint.
 *
 * Adapts a Lambda Function URL event (API Gateway payload format 2.0) into a Fetch
 * `Request`, runs it through GraphQL Yoga, and converts the `Response` back.
 */
import type { LambdaFunctionURLHandler } from 'aws-lambda';
import { yoga } from './yoga';

export const handler: LambdaFunctionURLHandler = async (event) => {
  const method = event.requestContext.http.method;

  const headers: Record<string, string> = {};
  for (const [key, value] of Object.entries(event.headers)) {
    if (value !== undefined) headers[key] = value;
  }

  const host = headers.host ?? 'lambda.local';
  const query = event.rawQueryString ? `?${event.rawQueryString}` : '';
  const url = `https://${host}${event.rawPath}${query}`;

  let body: string | Buffer | undefined;
  if (method !== 'GET' && method !== 'HEAD' && event.body !== undefined) {
    body = event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body;
  }

  const response = await yoga.fetch(url, { method, headers, body });

  return {
    statusCode: response.status,
    headers: Object.fromEntries(response.headers.entries()),
    body: await response.text(),
  };
};
