/**
 * @fileoverview Cognito custom SMS sender trigger.
 *
 * Cognito encrypts the OTP code using the AWS Encryption SDK (not raw KMS)
 * before passing it to this Lambda. We decrypt it with the same SDK, then
 * deliver via Pinpoint SMS Voice v2 using the dedicated toll-free origination
 * number — giving us full control over the origination identity and message.
 *
 * Trigger sources handled: any CustomSMSSender_* event (verification codes,
 * MFA codes, forgot-password codes, admin-created password codes).
 */
import { buildClient, CommitmentPolicy, KmsKeyringNode } from '@aws-crypto/client-node';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import {
  PinpointSMSVoiceV2Client,
  SendTextMessageCommand,
} from '@aws-sdk/client-pinpoint-sms-voice-v2';

const { decrypt } = buildClient(CommitmentPolicy.REQUIRE_ENCRYPT_ALLOW_DECRYPT);
const ssm = new SSMClient({});
const pinpoint = new PinpointSMSVoiceV2Client({});

export interface CognitoCustomSMSEvent {
  triggerSource: string;
  request: {
    code: string;
    userAttributes: Record<string, string>;
  };
}

let originationNumberCache: string | null = null;

async function getOriginationNumber(): Promise<string> {
  if (originationNumberCache) return originationNumberCache;
  const env = process.env.ENVIRONMENT ?? 'dev';
  const res = await ssm.send(
    new GetParameterCommand({ Name: `/bba/${env}/sns_from_number`, WithDecryption: false }),
  );
  originationNumberCache = res.Parameter?.Value ?? '';
  return originationNumberCache;
}

async function sendSMS(to: string, body: string): Promise<void> {
  const originationIdentity = await getOriginationNumber();
  await pinpoint.send(
    new SendTextMessageCommand({
      DestinationPhoneNumber: to,
      OriginationIdentity: originationIdentity,
      MessageBody: body,
      MessageType: 'TRANSACTIONAL',
    }),
  );
}

export async function handleCustomSMS(event: CognitoCustomSMSEvent): Promise<void> {
  const { code } = event.request;
  const phone = event.request.userAttributes.phone_number;
  if (!code || !phone) return;

  // Cognito encrypts the OTP using the AWS Encryption SDK, not raw KMS.
  // The key ARN is passed in as an env var set by Terraform.
  const keyArn = process.env.COGNITO_SMS_KEY_ARN ?? '';
  const keyring = new KmsKeyringNode({ keyIds: [keyArn] });
  const { plaintext } = await decrypt(keyring, Buffer.from(code, 'base64'));
  const otp = plaintext.toString('utf-8');

  const msg = `${otp} is your one-time Building Better Algorithms sign-in code. Never share this code with anyone.`;
  await sendSMS(phone, msg);
}
