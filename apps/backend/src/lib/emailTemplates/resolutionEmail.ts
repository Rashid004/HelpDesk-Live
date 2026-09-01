/**
 * Resolution email — sent when a ticket moves to "resolved".
 *
 * Visual language mirrors the web app's neobrutalism tokens
 * (apps/web/app/globals.css): warm cream ground, white card, 3px solid
 * ink border, hard un-blurred offset shadow, chunky uppercase label,
 * saturated blue CTA.
 *
 * Kept as table + inline styles on purpose — Gmail/Outlook strip <style>
 * blocks and don't do flexbox/grid. Clients that ignore box-shadow still
 * get the solid border, so the layout never breaks.
 */

export interface ResolutionEmailParams {
  referenceNumber: string;
  ticketUrl: string;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

const INK = "#0a0a0a";
const CREAM = "#fffcf5";
const PAPER = "#ffffff";
const MUTED = "#6b6b6b";
const YELLOW = "#ffd23f";
const BLUE = "#2d6bff";
const GREEN = "#1f9e5a";

const FONT_STACK =
  "'Space Grotesk', 'Helvetica Neue', Arial, sans-serif";

export function renderResolutionEmail(params: ResolutionEmailParams): RenderedEmail {
  const { referenceNumber, ticketUrl } = params;

  const subject = `Ticket ${referenceNumber} resolved`;

  const text = [
    `Your support ticket ${referenceNumber} has been resolved.`,
    ``,
    `View the full conversation and resolution note here:`,
    ticketUrl,
    ``,
    `If the issue isn't fully sorted, just reply in the ticket and it reopens.`,
    ``,
    `— HelpDesk Live`,
  ].join("\n");

  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background-color:${CREAM};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${CREAM};padding:32px 16px;">
      <tr>
        <td align="center">
          <!-- card -->
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background-color:${PAPER};border:3px solid ${INK};border-radius:6px;box-shadow:6px 6px 0 0 ${INK};">
            <!-- yellow header strip -->
            <tr>
              <td style="background-color:${YELLOW};border-bottom:3px solid ${INK};padding:18px 28px;font-family:${FONT_STACK};font-weight:800;font-size:18px;letter-spacing:-0.02em;color:${INK};">
                HelpDesk&nbsp;Live
              </td>
            </tr>

            <!-- body -->
            <tr>
              <td style="padding:32px 28px;font-family:${FONT_STACK};color:${INK};">
                <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:${GREEN};">
                  Ticket resolved
                </p>
                <h1 style="margin:0 0 16px;font-size:24px;font-weight:800;letter-spacing:-0.02em;color:${INK};">
                  ${referenceNumber}
                </h1>
                <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:${INK};">
                  Good news — your support ticket has been marked
                  <strong>resolved</strong>. Open it to read the resolution
                  note and the full conversation.
                </p>

                <!-- CTA -->
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="background-color:${BLUE};border:3px solid ${INK};border-radius:6px;box-shadow:4px 4px 0 0 ${INK};">
                      <a href="${ticketUrl}" style="display:inline-block;padding:12px 22px;font-family:${FONT_STACK};font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:${PAPER};text-decoration:none;">
                        View ticket
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:28px 0 0;font-size:13px;line-height:1.6;color:${MUTED};">
                  Still not sorted? Reply inside the ticket and it reopens
                  automatically — no need to file a new one.
                </p>
              </td>
            </tr>

            <!-- footer -->
            <tr>
              <td style="border-top:3px solid ${INK};padding:16px 28px;font-family:${FONT_STACK};font-size:11px;color:${MUTED};">
                You're receiving this because you opened a ticket on HelpDesk Live.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, html, text };
}
