/**
 * @fileoverview Cognito custom SMS sender trigger.
 *
 * Cognito encrypts the OTP code with a KMS key before passing it here.
 * We decrypt it, then deliver via Twilio's REST API so we are not blocked
 * by the AWS SNS origination-number registration requirement in the US.
 *
 * Trigger sources handled: any CustomSMSSender_* event (verification codes,
 * MFA codes, forgot-password codes, admin-created password codes).
 */
import { KMSClient, DecryptCommand } from '@aws-sdk/client-kms';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import * as https from 'https';

const kms = new KMSClient({});
const ssm = new SSMClient({});

export interface CognitoCustomSMSEvent {
  triggerSource: string;
  request: {
    code: string;
    userAttributes: Record<string, string>;
  };
}

let twilioCache: { accountSid: string; authToken: string; from: string } | null = null;

async function getTwilioConfig(): Promise<{ accountSid: string; authToken: string; from: string }> {
  if (twilioCache) return twilioCache;
  const env = process.env.ENVIRONMENT ?? 'dev';
  const [sidRes, tokenRes, fromRes] = await Promise.all([
    ssm.send(
      new GetParameterCommand({ Name: `/bba/${env}/twilio_account_sid`, WithDecryption: true }),
    ),
    ssm.send(
      new GetParameterCommand({ Name: `/bba/${env}/twilio_auth_token`, WithDecryption: true }),
    ),
    ssm.send(
      new GetParameterCommand({ Name: `/bba/${env}/twilio_from_number`, WithDecryption: false }),
    ),
  ]);
  twilioCache = {
    accountSid: sidRes.Parameter?.Value ?? '',
    authToken: tokenRes.Parameter?.Value ?? '',
    from: fromRes.Parameter?.Value ?? '',
  };
  return twilioCache;
}

async function sendSMS(to: string, body: string): Promise<void> {
  const { accountSid, authToken, from } = await getTwilioConfig();
  const payload = new URLSearchParams({ To: to, From: from, Body: body }).toString();
  const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

  await new Promise<void>((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.twilio.com',
        path: `/2010-04-01/Accounts/${accountSid}/Messages.json`,
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        if (res.statusCode !== undefined && res.statusCode >= 200 && res.statusCode < 300) {
          resolve();
        } else {
          reject(new Error(`Twilio responded with ${String(res.statusCode)}`));
        }
        res.resume();
      },
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

export async function handleCustomSMS(event: CognitoCustomSMSEvent): Promise<void> {
  const { code } = event.request;
  const phone = event.request.userAttributes.phone_number;
  if (!code || !phone) return;

  const decrypted = await kms.send(
    new DecryptCommand({ CiphertextBlob: Buffer.from(code, 'base64') }),
  );
  if (!decrypted.Plaintext) return;
  const otp = Buffer.from(decrypted.Plaintext).toString('utf-8');

  await sendSMS(phone, `Your Building Better Algorithms code is: ${otp}`);
}
