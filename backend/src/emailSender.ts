/**
 * @fileoverview Cognito custom email sender trigger.
 *
 * Cognito encrypts the OTP/code using the AWS Encryption SDK before passing it
 * to this Lambda. We decrypt it with the same SDK, then deliver a branded HTML
 * email via SES — giving us full control over design and copy.
 *
 * Trigger sources handled:
 *   CustomEmailSender_SignUp            — account email verification
 *   CustomEmailSender_ResendCode        — resent verification code
 *   CustomEmailSender_ForgotPassword    — password reset code
 *   CustomEmailSender_Authentication    — email OTP MFA sign-in code
 *   CustomEmailSender_UpdateUserAttribute / VerifyUserAttribute — email change
 */
import { buildClient, CommitmentPolicy, KmsKeyringNode } from '@aws-crypto/client-node';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const { decrypt } = buildClient(CommitmentPolicy.REQUIRE_ENCRYPT_ALLOW_DECRYPT);
const ses = new SESClient({});

const FROM = 'Building Better Algorithms <noreply@buildbetteralgorithms.com>';
const APP = 'Building Better Algorithms';

export interface CognitoCustomEmailEvent {
  triggerSource: string;
  request: {
    code: string;
    userAttributes: Record<string, string>;
    clientMetadata?: Record<string, string>;
  };
}

interface EmailContent {
  subject: string;
  heading: string;
  body: string;
  codeLabel: string;
}

function getContent(triggerSource: string): EmailContent {
  switch (triggerSource) {
    case 'CustomEmailSender_ForgotPassword':
      return {
        subject: `Reset your ${APP} password`,
        heading: 'Password reset',
        body: "We received a request to reset the password for your account. Use the code below to complete the reset. If you didn't request this, you can safely ignore this email.",
        codeLabel: 'Password reset code',
      };
    case 'CustomEmailSender_Authentication':
      return {
        subject: `Your ${APP} sign-in code`,
        heading: 'Sign-in code',
        body: 'Use the code below to complete your sign-in. This code expires in 10 minutes. Never share this code with anyone.',
        codeLabel: 'Sign-in code',
      };
    case 'CustomEmailSender_UpdateUserAttribute':
    case 'CustomEmailSender_VerifyUserAttribute':
      return {
        subject: `Verify your ${APP} email address`,
        heading: 'Verify your email',
        body: 'Use the code below to verify your new email address.',
        codeLabel: 'Verification code',
      };
    default:
      // SignUp + ResendCode
      return {
        subject: `Verify your ${APP} email address`,
        heading: 'Confirm your account',
        body: 'Welcome to Building Better Algorithms! Use the code below to verify your email address and activate your account.',
        codeLabel: 'Verification code',
      };
  }
}

function buildHtml(code: string, content: EmailContent): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${content.subject}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#0f0f13;border-radius:12px 12px 0 0;padding:28px 40px;text-align:center;">
            <span style="font-size:15px;font-weight:700;letter-spacing:0.04em;color:#ffffff;">${APP}</span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:40px 40px 32px;">
            <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0f0f13;">${content.heading}</h1>
            <p style="margin:0 0 32px;font-size:15px;line-height:1.6;color:#4b5563;">${content.body}</p>

            <!-- Code box -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding:0 0 32px;">
                  <div style="display:inline-block;background:#f4f4f5;border:1px solid #e5e7eb;border-radius:10px;padding:18px 40px;">
                    <div style="font-size:11px;font-weight:600;letter-spacing:0.08em;color:#6b7280;text-transform:uppercase;margin-bottom:8px;">${content.codeLabel}</div>
                    <div style="font-size:32px;font-weight:800;letter-spacing:0.18em;color:#0f0f13;font-family:'Courier New',Courier,monospace;">${code}</div>
                  </div>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.5;">
              This code expires in 10&nbsp;minutes. If you did not request this, no action is needed.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9f9fb;border-top:1px solid #e5e7eb;border-radius:0 0 12px 12px;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              © ${new Date().getFullYear()} ${APP} &nbsp;·&nbsp;
              <a href="https://buildbetteralgorithms.com" style="color:#6b7280;text-decoration:none;">buildbetteralgorithms.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildText(code: string, content: EmailContent): string {
  return `${content.heading}

${content.body}

${content.codeLabel}: ${code}

This code expires in 10 minutes.

— ${APP}
https://buildbetteralgorithms.com`;
}

export async function handleCustomEmail(event: CognitoCustomEmailEvent): Promise<void> {
  const { code } = event.request;
  const to = event.request.userAttributes.email;
  if (!code || !to) return;

  const keyArn = process.env.COGNITO_SMS_KEY_ARN ?? '';
  const keyring = new KmsKeyringNode({ keyIds: [keyArn] });
  const { plaintext } = await decrypt(keyring, Buffer.from(code, 'base64'));
  const otp = plaintext.toString('utf-8');

  const content = getContent(event.triggerSource);

  await ses.send(
    new SendEmailCommand({
      Source: FROM,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: content.subject, Charset: 'UTF-8' },
        Body: {
          Html: { Data: buildHtml(otp, content), Charset: 'UTF-8' },
          Text: { Data: buildText(otp, content), Charset: 'UTF-8' },
        },
      },
    }),
  );
}
