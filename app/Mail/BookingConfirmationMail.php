<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class BookingConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public array $bookingDetails;

    public function __construct(array $bookingDetails)
    {
        $this->bookingDetails = $bookingDetails;
    }

    public function build()
    {
        $fromAddress = env('MAIL_FROM_ADDRESS', env('MAIL_USERNAME', 'info@finddestination.com.ng'));
        $fromName = env('MAIL_FROM_NAME', 'FindDestination');
        $reference = $this->bookingDetails['reference'] ?? 'FD-BOOKING';

        return $this->from($fromAddress, $fromName)
            ->subject('Booking Confirmed: ' . $reference . ' (Escrow Protected)')
            ->html($this->renderHtmlContent());
    }

    private function renderHtmlContent(): string
    {
        $b = $this->bookingDetails;
        $ref = htmlspecialchars($b['reference'] ?? '');
        $guestName = htmlspecialchars($b['guestName'] ?? 'Valued Guest');
        $propertyName = htmlspecialchars($b['propertyName'] ?? 'FindDestination Verified Stay');
        $propertyAddress = htmlspecialchars($b['propertyAddress'] ?? '');
        $roomName = htmlspecialchars($b['roomName'] ?? 'Standard Suite');
        $checkIn = htmlspecialchars($b['checkInDate'] ?? '');
        $checkOut = htmlspecialchars($b['checkOutDate'] ?? '');
        $nights = htmlspecialchars((string)($b['nights'] ?? 1));
        $totalAmount = htmlspecialchars((string)($b['totalAmount'] ?? ''));
        $voucherUrl = 'https://finddestination.com.ng/#track-booking?ref=' . urlencode($ref);

        return '
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Confirmed</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" max-width="580" style="max-width: 580px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.07); border: 1px solid #e2e8f0;">
                  
                  <!-- Brand Header -->
                  <tr>
                    <td style="background-color: #0f172a; padding: 30px; text-align: center; border-bottom: 3px solid #10b981;">
                      <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">
                        FindDestination<span style="color: #f97316;">.com.ng</span>
                      </h1>
                      <div style="display: inline-block; background-color: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; color: #10b981; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-top: 8px;">
                        ✓ Booking Confirmed & Escrow Held
                      </div>
                    </td>
                  </tr>

                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 36px 32px;">
                      <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 800; color: #0f172a;">
                        Your Trip Reservation is Confirmed!
                      </h2>
                      <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                        Dear <strong>' . $guestName . '</strong>,
                      </p>
                      <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                        Your reservation has been successfully confirmed. Under our <strong>100% Escrow Protection Guarantee</strong>, your payment is held securely in escrow and will only be disbursed to the host 24 hours after your successful check-in.
                      </p>

                      <!-- Summary Card -->
                      <table width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; margin-bottom: 24px;">
                        <tr>
                          <td style="padding: 6px 0; font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Reference</td>
                          <td style="padding: 6px 0; font-size: 15px; color: #1e40af; font-weight: 900; font-family: monospace; text-align: right;">' . $ref . '</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Property</td>
                          <td style="padding: 6px 0; font-size: 13px; color: #0f172a; font-weight: 800; text-align: right;">' . $propertyName . '</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Location</td>
                          <td style="padding: 6px 0; font-size: 12px; color: #475569; text-align: right;">' . $propertyAddress . '</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Room / Unit</td>
                          <td style="padding: 6px 0; font-size: 12px; color: #2563eb; font-weight: 700; text-align: right;">' . $roomName . '</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Check-in</td>
                          <td style="padding: 6px 0; font-size: 13px; color: #0f172a; font-weight: 800; text-align: right;">' . $checkIn . ' (From 14:00)</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Check-out</td>
                          <td style="padding: 6px 0; font-size: 13px; color: #0f172a; font-weight: 800; text-align: right;">' . $checkOut . ' (Until 12:00)</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Duration</td>
                          <td style="padding: 6px 0; font-size: 13px; color: #0f172a; font-weight: 800; text-align: right;">' . $nights . ' Night(s)</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0 4px 0; font-size: 12px; color: #0f172a; font-weight: 800; border-top: 1px solid #e2e8f0;">Total Amount Paid</td>
                          <td style="padding: 10px 0 4px 0; font-size: 16px; color: #059669; font-weight: 900; text-align: right; border-top: 1px solid #e2e8f0;">' . $totalAmount . '</td>
                        </tr>
                      </table>

                      <!-- Action Button -->
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="' . $voucherUrl . '" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 9999px; font-weight: 800; font-size: 13px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37,99,235,0.3);">
                          View Official Voucher & QR Code
                        </a>
                      </div>

                      <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #64748b;">
                        Please present your digital voucher and a valid government ID upon check-in at property reception.
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
