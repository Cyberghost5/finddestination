<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class HostRegistrationStatusMail extends Mailable
{
    use Queueable, SerializesModels;

    public User $host;
    public string $status; // 'approved' or 'rejected'
    public ?string $rejectionReason;

    public function __construct(User $host, string $status, ?string $rejectionReason = null)
    {
        $this->host = $host;
        $this->status = strtolower($status);
        $this->rejectionReason = $rejectionReason;
    }

    public function build()
    {
        $fromAddress = env('MAIL_FROM_ADDRESS', env('MAIL_USERNAME', 'info@finddestination.com.ng'));
        $fromName = env('MAIL_FROM_NAME', 'FindDestination');

        $businessName = $this->host->business_name ?: $this->host->name;
        $isApproved = ($this->status === 'approved');

        $subject = $isApproved
            ? "Congratulations! Your Host Partner Account for {$businessName} is Approved"
            : "Important Update Regarding Your FindDestination Host Application ({$businessName})";

        return $this->from($fromAddress, $fromName)
            ->subject($subject)
            ->html($this->renderHtmlContent());
    }

    private function renderHtmlContent(): string
    {
        $isApproved = ($this->status === 'approved');
        $hostName = htmlspecialchars($this->host->name ?: 'Host Partner');
        $businessName = htmlspecialchars($this->host->business_name ?: 'Your Enterprise');
        $cacNumber = htmlspecialchars($this->host->cac_number ?: 'Not Provided');
        $reason = htmlspecialchars($this->rejectionReason ?: 'Corporate registration details could not be validated against the registry.');
        $appUrl = rtrim(env('APP_URL', 'http://127.0.0.1:8000'), '/');

        $primaryColor = $isApproved ? '#059669' : '#dc2626';
        $lightBgColor = $isApproved ? '#ecfdf5' : '#fef2f2';
        $borderColor = $isApproved ? '#a7f3d0' : '#fecaca';

        return '
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>' . ($isApproved ? 'Host Registration Approved' : 'Host Registration Update') . '</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 16px;">
            <tr>
              <td align="center">
                <table width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
                  
                  <!-- Brand Header -->
                  <tr>
                    <td style="background-color: #0f172a; padding: 32px 30px; text-align: center; border-bottom: 3px solid ' . $primaryColor . ';">
                      <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">
                        FindDestination<span style="color: #f97316;">.com.ng</span>
                      </h1>
                      <p style="margin: 6px 0 0 0; font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">
                        Trusted Digital Accommodation Marketplace • Northern Nigeria
                      </p>
                    </td>
                  </tr>

                  <!-- Status Banner -->
                  <tr>
                    <td style="background-color: ' . $lightBgColor . '; padding: 18px 32px; border-bottom: 1px solid ' . $borderColor . '; text-align: center;">
                      <span style="display: inline-block; padding: 6px 14px; border-radius: 999px; background-color: ' . $primaryColor . '; color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
                        ' . ($isApproved ? '✓ Level 1 CAC Verification Cleared' : '⚠ Audit Status: Application Declined') . '
                      </span>
                    </td>
                  </tr>

                  <!-- Main Content Body -->
                  <tr>
                    <td style="padding: 36px 32px;">
                      <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 800; color: #0f172a; line-height: 1.3;">
                        ' . ($isApproved ? 'Congratulations, ' . $hostName . '!' : 'Host Application Notice for ' . $hostName) . '
                      </h2>

                      <p style="margin: 0 0 18px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                        ' . ($isApproved 
                            ? 'We are pleased to inform you that your host partner registration for <strong>' . $businessName . '</strong> (CAC: <code style="background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; color: #0f172a;">' . $cacNumber . '</code>) has been verified and <strong>officially approved</strong> by our Super Admin compliance audit team.' 
                            : 'Thank you for your application to join FindDestination as a verified host partner for <strong>' . $businessName . '</strong> (CAC: <code style="background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; color: #0f172a;">' . $cacNumber . '</code>). Following our compliance audit, we regret to inform you that your registration could not be approved at this time.') . '
                      </p>

                      <!-- Summary Card -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0; margin: 24px 0;">
                        <tr>
                          <td style="padding: 20px 24px;">
                            <div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
                              Registration Summary
                            </div>
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px; line-height: 1.8;">
                              <tr>
                                <td style="color: #64748b; width: 45%;">Applicant Name:</td>
                                <td style="color: #0f172a; font-weight: 700;">' . $hostName . '</td>
                              </tr>
                              <tr>
                                <td style="color: #64748b;">Enterprise / Brand:</td>
                                <td style="color: #0f172a; font-weight: 700;">' . $businessName . '</td>
                              </tr>
                              <tr>
                                <td style="color: #64748b;">CAC Registration No:</td>
                                <td style="color: #0f172a; font-family: monospace; font-weight: 700;">' . $cacNumber . '</td>
                              </tr>
                              <tr>
                                <td style="color: #64748b;">Verification Status:</td>
                                <td style="color: ' . $primaryColor . '; font-weight: 800; text-transform: uppercase;">
                                  ' . ($isApproved ? 'Approved & Activated' : 'Declined') . '
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      ' . ($isApproved ? '
                      <!-- Approved Features -->
                      <div style="margin: 28px 0 24px 0;">
                        <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
                          What You Can Do Now:
                        </h3>
                        <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.8;">
                          <li><strong>Upload Properties:</strong> Add your serviced apartments, suites, and guest lodges across Northern Nigeria.</li>
                          <li><strong>Request Tier 3 Field Inspections:</strong> Certified regional agents can physically audit your locations for the Tier 3 Trust Badge.</li>
                          <li><strong>Guest Liaison Messaging:</strong> Directly communicate with confirmed guests who book your properties.</li>
                          <li><strong>Automated Escrow Disbursals:</strong> Receive verified guest payouts directly to your designated bank account upon check-in.</li>
                        </ul>
                      </div>

                      <div style="text-align: center; margin: 36px 0 24px 0;">
                        <a href="' . $appUrl . '" style="display: inline-block; background-color: #059669; color: #ffffff; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 36px; border-radius: 999px; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);">
                          Access Your Host Dashboard →
                        </a>
                      </div>
                      ' : '
                      <!-- Rejection Reason Card -->
                      <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px 20px; border-radius: 8px; margin: 24px 0;">
                        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #991b1b; letter-spacing: 0.5px; margin-bottom: 4px;">
                          Compliance Auditor Remarks
                        </div>
                        <p style="margin: 0; font-size: 13px; color: #7f1d1d; font-weight: 600; line-height: 1.5;">
                          ' . $reason . '
                        </p>
                      </div>

                      <p style="margin: 24px 0 16px 0; font-size: 13px; line-height: 1.6; color: #475569;">
                        If you believe this was an error, or if you need to update your registered business name or RC/BN credentials, please contact our support desk or reply directly to this email with your updated documentation.
                      </p>

                      <div style="text-align: center; margin: 32px 0 20px 0;">
                        <a href="mailto:info@finddestination.com.ng?subject=Host%20Application%20Review%20Appeal%20-%20' . urlencode($businessName) . '" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 13px; font-weight: 800; text-decoration: none; padding: 12px 30px; border-radius: 999px;">
                          Contact Compliance Support Desk
                        </a>
                      </div>
                      ') . '

                      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; margin-top: 28px;">
                        <p style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.5;">
                          <strong>Need assistance?</strong> Our host relations team is available 24/7 at <a href="mailto:info@finddestination.com.ng" style="color: #2563eb; text-decoration: none; font-weight: 600;">info@finddestination.com.ng</a> or via the support chat in your account.
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; line-height: 1.6;">
                      <p style="margin: 0 0 4px 0; font-weight: 700; color: #64748b;">
                        FindDestination Nigeria Ltd • Trusted Northern Nigeria Escrow Platform
                      </p>
                      <p style="margin: 0; color: #94a3b8;">
                        Bauchi • Kaduna • Kano • Jos • Yola • Gombe • Abuja
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
        ';
    }
}
