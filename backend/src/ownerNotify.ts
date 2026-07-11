/**
 * @fileoverview Owner notifications via SES — currently just "someone downloaded the
 * research paper." Uses the same verified sender as the Cognito email trigger.
 *
 * Best-effort: a send failure (SES sandbox, throttling, local dev with dummy creds)
 * is logged and swallowed so it never breaks the caller's request. Sending to a fixed
 * owner address means SES **sandbox** mode is fine as long as that address is a
 * verified identity — no production access required.
 */
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { config } from './config';

const ses = new SESClient({});
const FROM = 'Building Better Algorithms <noreply@buildbetteralgorithms.com>';

/**
 * Email the owner that a signed-in user downloaded the capstone research paper.
 * Returns true ONLY if the notification was actually sent — the frontend gates the
 * download on this, so a missing downloader email or a failed send blocks the download.
 */
export async function notifyResearchDownload(downloaderEmail: string): Promise<boolean> {
  const to = config.ownerEmail;
  if (!to) return false; // notifications disabled (no OWNER_EMAIL configured)
  if (!downloaderEmail) return false; // can't identify the user → block the download

  const when = new Date().toISOString();

  try {
    await ses.send(
      new SendEmailCommand({
        Source: FROM,
        Destination: { ToAddresses: [to] },
        Message: {
          Subject: { Data: 'Someone downloaded your research paper', Charset: 'UTF-8' },
          Body: {
            Text: {
              Data: `${downloaderEmail} downloaded the Building Better Algorithms research paper.\n\nWhen: ${when}`,
              Charset: 'UTF-8',
            },
          },
        },
      }),
    );
    return true;
  } catch (err) {
    console.error(`research-download notification failed: ${(err as Error).message}`);
    return false;
  }
}
