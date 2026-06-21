/**
 * @fileoverview AWS Lambda entrypoint.
 *
 * Adapts a Lambda Function URL event (API Gateway payload format 2.0) into a Fetch
 * `Request`, runs it through GraphQL Yoga, and converts the `Response` back.
 * Also routes Cognito trigger events:
 *   CustomSMSSender_*   → Pinpoint SMS sender
 *   CustomEmailSender_* → SES email sender
 */
import type { LambdaFunctionURLEvent, LambdaFunctionURLResult } from 'aws-lambda';
import { yoga } from './yoga';
import { handleCustomSMS, type CognitoCustomSMSEvent } from './smsSender';
import { handleCustomEmail, type CognitoCustomEmailEvent } from './emailSender';

type CognitoTriggerEvent = CognitoCustomSMSEvent | CognitoCustomEmailEvent;

function isCognitoTrigger(event: unknown): event is CognitoTriggerEvent {
  return (
    typeof event === 'object' &&
    event !== null &&
    'triggerSource' in event &&
    typeof (event as Record<string, unknown>).triggerSource === 'string'
  );
}

export const handler = async (
  event: LambdaFunctionURLEvent | CognitoTriggerEvent,
): Promise<LambdaFunctionURLResult | CognitoTriggerEvent> => {
  if (isCognitoTrigger(event)) {
    const src = event.triggerSource;
    if (src.startsWith('CustomSMSSender_')) await handleCustomSMS(event);
    if (src.startsWith('CustomEmailSender_')) await handleCustomEmail(event);
    return event;
  }

  const urlEvent = event;
  const method = urlEvent.requestContext.http.method;

  const headers: Record<string, string> = {};
  for (const [key, value] of Object.entries(urlEvent.headers)) {
    if (value !== undefined) headers[key] = value;
  }

  const host = headers.host ?? 'lambda.local';
  const query = urlEvent.rawQueryString ? `?${urlEvent.rawQueryString}` : '';
  const url = `https://${host}${urlEvent.rawPath}${query}`;

  let body: string | Buffer | undefined;
  if (method !== 'GET' && method !== 'HEAD' && urlEvent.body !== undefined) {
    body = urlEvent.isBase64Encoded ? Buffer.from(urlEvent.body, 'base64') : urlEvent.body;
  }

  const response = await yoga.fetch(url, { method, headers, body });

  return {
    statusCode: response.status,
    headers: Object.fromEntries(response.headers.entries()),
    body: await response.text(),
  };
};
