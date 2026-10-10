<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PasswordResetMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $otp;
    public string $userName;

    public function __construct(string $otp, string $userName = 'Traveler')
    {
        $this->otp = $otp;
        $this->userName = $userName;
    }

    public function build()
    {
        $fromAddress = env('MAIL_FROM_ADDRESS', env('MAIL_USERNAME', 'info@finddestination.com.ng'));
        $fromName = env('MAIL_FROM_NAME', 'FindDestination');

        return $this->from($fromAddress, $fromName)
            ->subject($this->otp . ' is your FindDestination Password Reset Code')
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
          <title>Password Reset Request</title>
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
                        Account Security Alert
                      </p>
                    </td>
                  </tr>

                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 36px 32px;">
                      <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 800; color: #0f172a;">
                        Password Reset Request
                      </h2>
                      <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                        Hello <strong>' . htmlspecialchars($this->userName) . '</strong>,
                      </p>
                      <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                        We received a request to reset the password for your FindDestination account. Use the 6-digit verification code below to proceed:
                      </p>

                      <!-- OTP Box -->
                      <div style="background-color: #fff7ed; border: 2px dashed #f97316; border-radius: 16px; padding: 24px; text-align: center; margin: 28px 0;">
                        <span style="font-family: \'SFMono-Regular\', Consolas, \'Liberation Mono\', Menlo, monospace; font-size: 34px; font-weight: 900; letter-spacing: 10px; color: #c2410c; display: inline-block;">
                          ' . htmlspecialchars($this->otp) . '
                        </span>
                        <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #ea580c; text-transform: uppercase; letter-spacing: 0.5px;">
                          Expires in 15 minutes
                        </div>
                      </div>

                      <p style="margin: 0 0 16px 0; font-size: 13px; line-height: 1.6; color: #64748b;">
                        If you did not request a password reset, please ignore this email or change your password immediately if you suspect unauthorized access.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
                      <p style="margin: 0 0 4px 0; font-weight: 700; color: #64748b;">
                        FindDestination Nigeria Ltd • CAC RC: 7890123
                      </p>
                      <p style="margin: 0;">
                        https://finddestination.com.ng
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
