import fs from 'fs';
import path from 'path';

function getLogoBase64(): string {
  try {
    const logoPath = path.resolve(__dirname, '../../src/assets/indvstry-logo-email.png');
    return fs.readFileSync(logoPath).toString('base64');
  } catch {
    return '';
  }
}

export function getEmailSignatureHtml(senderName: string = 'Amber Jacobs'): string {
  const logo = getLogoBase64();
  const logoImg = logo
    ? `<img src="data:image/png;base64,${logo}" alt="Indvstry Clvb" width="200" style="display:block;margin-bottom:12px;" />`
    : '';

  return `
<div style="font-family:Arial,sans-serif;font-size:14px;color:#222;margin-top:32px;border-top:1px solid #e0e0e0;padding-top:16px;max-width:500px;">
  <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">${senderName}</p>
  <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Indvstry Clvb, Community Manager</p>
  ${logoImg}
  <p style="margin:0 0 4px 0;">+44 7438 932403</p>
  <p style="margin:0 0 4px 0;">London, UK</p>
  <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#222;">www.indvstryclvb.com</a></p>
  <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
  <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission; it is not to be forwarded to third parties. You are hereby notified that any disclosure or distribution, without the express written consent of the sender, is unauthorised. If you received this e-mail in error, please delete the message immediately.</p>
</div>`;
}

export function appendSignatureToText(body: string, senderName?: string): { html: string } {
  const plainTextFormatted = body.replace(/\n/g, '<br>');
  const signature = getEmailSignatureHtml(senderName);
  return { html: `<div style="font-family:Arial,sans-serif;font-size:14px;color:#222;">${plainTextFormatted}</div>${signature}` };
}
