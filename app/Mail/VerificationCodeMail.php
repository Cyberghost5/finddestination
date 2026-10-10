<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class VerificationCodeMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $code;
    public string $userName;

    public function __construct(string $code, string $userName = 'Traveler')
    {
        $this->code = $code;
        $this->userName = $userName;
    }

    public function build()
    {
        $fromAddress = env('MAIL_FROM_ADDRESS', env('MAIL_USERNAME', 'info@finddestination.com.ng'));
        $fromName = env('MAIL_FROM_NAME', 'FindDestination');

        return $this->from($fromAddress, $fromName)
            ->subject($this->code . ' is your FindDestination Verification Code')
            ->html($this->renderHtmlContent());
    }

    private function renderHtmlContent(): string
    {
        return '
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>FindDestination Verification Code</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" max-width="580" style="max-width: 580px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.07); border: 1px solid #e2e8f0;">
                  
                  <!-- Brand Header -->
                  <tr>
                    <td style="background-color: #0f172a; padding: 30px; text-align: center; border-bottom: 3px solid #2563eb;">
                      <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">
                        FindDestination<span style="color: #f97316;">.com.ng</span>
                      </h1>
                      <p style="margin: 6px 0 0 0; font-size: 12px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                        Verified Northern Nigeria Stays
                      </p>
                    </td>
                  </tr>

                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 36px 32px;">
                      <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 800; color: #0f172a;">
                        Verify Your Email Address
                      </h2>
                      <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                        Hello <strong>' . htmlspecialchars($this->userName) . '</strong>,
                      </p>
                      <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                        Thank you for registering with FindDestination. Please use the 6-digit verification code below to verify your email address and activate your account:
                      </p>

                      <!-- OTP Box -->
                      <div style="background-color: #eff6ff; border: 2px dashed #3b82f6; border-radius: 16px; padding: 24px; text-align: center; margin: 28px 0;">
                        <span style="font-family: \'SFMono-Regular\', Consolas, \'Liberation Mono\', Menlo, monospace; font-size: 34px; font-weight: 900; letter-spacing: 10px; color: #1e3a8a; display: inline-block;">
                          ' . htmlspecialchars($this->code) . '
                        </span>
                        <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: 0.5px;">
                          Valid for 30 minutes
                        </div>
                      </div>

                      <p style="margin: 0 0 16px 0; font-size: 13px; line-height: 1.6; color: #64748b;">
                        Enter this code on the verification screen to proceed. If you did not create an account on FindDestination, please safely disregard this message.
                      </p>

                      <div style="background-color: #f8fafc; border-left: 4px solid #f97316; padding: 12px 16px; border-radius: 4px; margin-top: 24px;">
                        <p style="margin: 0; font-size: 12px; color: #475569; font-weight: 600;">
                          Security Tip: Never share this code with anyone. FindDestination staff will never ask for your verification code.
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
                      <p style="margin: 0 0 4px 0; font-weight: 700; color: #64748b;">
                        FindDestination Nigeria Ltd • CAC RC: 7890123
                      </p>
                      <p style="margin: 0;">
                        Bauchi • Kaduna • Kano • Plateau • Adamawa • Gombe
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>';
    }
}
