import React, { useState } from 'react';
import {
  CheckCircle2,
  X,
  ShieldCheck,
  Building2,
  Calendar,
  MapPin,
  Printer,
  Download,
  QrCode,
  Lock,
  ArrowRight,
  Check
} from 'lucide-react';

export default function VoucherModal({ isOpen, onClose, booking }) {
  if (!isOpen || !booking) return null;

  const [isCopied, setIsCopied] = useState(false);

  // Normalize data fields from different caller modals (Checkout, Trips, OrderTracker)
  const reference = booking.reference || booking.bookingRef || 'FD-TRIP-2026';
  const propertyName = booking.property?.name || booking.propertyTitle || 'FindDestination Verified Stay';
  const propertyAddress = booking.property?.address
    ? `${booking.property.address}${booking.property.city ? `, ${booking.property.city}` : ''}`
    : (booking.location || 'Northern Nigeria');
  const propertyImage = booking.property?.images?.[0] || booking.propertyImage || '/logo.jpeg';
  const roomName = booking.room?.name || booking.roomType || 'Executive Verified Stay';
  const checkInDate = booking.checkInDate || booking.checkIn || 'Scheduled Date';
  const checkOutDate = booking.checkOutDate || booking.checkOut || 'Scheduled Date';
  const guestName = booking.guestName || 'Verified Guest';
  const guestPhone = booking.guestPhone || '+234 800 FindDestination';
  const guestEmail = booking.guestEmail || '';
  const nights = booking.nights || 2;
  const totalAmount = typeof booking.totalAmount === 'number'
    ? `₦${booking.totalAmount.toLocaleString()}`
    : (booking.totalAmount || 'Paid in Full');

  const verificationUrl = `https://finddestination.com.ng/#track-booking?ref=${encodeURIComponent(reference)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(verificationUrl)}`;

  const handleCopyRef = () => {
    if (reference) {
      navigator.clipboard.writeText(reference);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    // Create an isolated hidden iframe to guarantee 100% single-page printing with zero background bleed
    const printIframe = document.createElement('iframe');
    printIframe.setAttribute('title', 'FindDestination Voucher Print');
    printIframe.style.position = 'fixed';
    printIframe.style.right = '0';
    printIframe.style.bottom = '0';
    printIframe.style.width = '0';
    printIframe.style.height = '0';
    printIframe.style.border = '0';
    printIframe.style.opacity = '0';
    document.body.appendChild(printIframe);

    const doc = printIframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>FindDestination Voucher - ${reference}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            }
            html, body {
              width: 100%;
              background: #ffffff;
              color: #0f172a;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .voucher-wrapper {
              max-width: 680px;
              margin: 0 auto;
              border: 1.5px solid #cbd5e1;
              border-radius: 16px;
              overflow: hidden;
              background: #ffffff;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            .voucher-header {
              background: #0f172a;
              color: #ffffff;
              padding: 18px 24px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #2563eb;
            }
            .brand-title {
              font-size: 20px;
              font-weight: 900;
              letter-spacing: -0.5px;
            }
            .brand-sub {
              font-size: 11px;
              color: #94a3b8;
              margin-top: 2px;
            }
            .badge-confirmed {
              background: rgba(16, 185, 129, 0.15);
              color: #10b981;
              border: 1px solid #10b981;
              padding: 4px 10px;
              border-radius: 9999px;
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .voucher-body {
              padding: 18px 24px;
            }
            .ref-box {
              display: flex;
              justify-content: space-between;
              align-items: center;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 10px 16px;
              margin-bottom: 14px;
            }
            .ref-label {
              font-size: 10px;
              font-weight: 800;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .ref-value {
              font-size: 16px;
              font-weight: 900;
              color: #1e40af;
              font-family: monospace;
            }
            .escrow-pill {
              font-size: 11px;
              font-weight: 800;
              color: #059669;
              background: #ecfdf5;
              border: 1px solid #a7f3d0;
              padding: 4px 10px;
              border-radius: 9999px;
            }
            .property-box {
              display: flex;
              gap: 14px;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 12px;
              margin-bottom: 14px;
              align-items: center;
            }
            .prop-img {
              width: 64px;
              height: 64px;
              border-radius: 10px;
              object-fit: cover;
              background: #f1f5f9;
              flex-shrink: 0;
            }
            .prop-name {
              font-size: 14px;
              font-weight: 800;
              color: #0f172a;
              margin-bottom: 3px;
            }
            .prop-addr {
              font-size: 11px;
              color: #64748b;
              margin-bottom: 3px;
            }
            .prop-room {
              font-size: 12px;
              font-weight: 700;
              color: #2563eb;
            }
            .grid-details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
              margin-bottom: 14px;
            }
            .detail-card {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 10px;
              padding: 9px 12px;
            }
            .detail-label {
              font-size: 10px;
              font-weight: 800;
              color: #64748b;
              text-transform: uppercase;
              margin-bottom: 2px;
            }
            .detail-main {
              font-size: 13px;
              font-weight: 800;
              color: #0f172a;
            }
            .detail-sub {
              font-size: 11px;
              color: #64748b;
              margin-top: 1px;
            }
            .qr-security-box {
              display: flex;
              align-items: center;
              justify-content: space-between;
              background: #eff6ff;
              border: 1.5px solid #bfdbfe;
              border-radius: 12px;
              padding: 12px 16px;
              margin-bottom: 14px;
              gap: 16px;
            }
            .qr-text-title {
              font-size: 13px;
              font-weight: 800;
              color: #1e3a8a;
              margin-bottom: 3px;
            }
            .qr-text-desc {
              font-size: 11px;
              color: #2563eb;
              line-height: 1.4;
            }
            .qr-img-wrapper {
              background: #ffffff;
              padding: 5px;
              border-radius: 10px;
              border: 1px solid #cbd5e1;
              flex-shrink: 0;
              width: 86px;
              height: 86px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .qr-img {
              width: 76px;
              height: 76px;
              display: block;
            }
            .instructions {
              border-top: 1px dashed #cbd5e1;
              padding-top: 10px;
              font-size: 10px;
              color: #64748b;
              line-height: 1.4;
            }
            .voucher-footer {
              background: #f8fafc;
              border-top: 1px solid #e2e8f0;
              padding: 9px 24px;
              display: flex;
              justify-content: space-between;
              font-size: 10px;
              color: #94a3b8;
              font-weight: 700;
            }
          </style>
        </head>
        <body>
          <div class="voucher-wrapper">
            <div class="voucher-header">
              <div>
                <div class="brand-title">FindDestination<span style="color:#f97316;">.com.ng</span></div>
                <div class="brand-sub">Official Trip Accommodation Voucher & Escrow Certificate</div>
              </div>
              <div class="badge-confirmed">✓ Escrow Confirmed</div>
            </div>

            <div class="voucher-body">
              <div class="ref-box">
                <div>
                  <div class="ref-label">Booking Reference</div>
                  <div class="ref-value">${reference}</div>
                </div>
                <div class="escrow-pill">🔒 100% Escrow Protected</div>
              </div>

              <div class="property-box">
                ${propertyImage ? `<img src="${propertyImage}" class="prop-img" alt="Stay" />` : ''}
                <div>
                  <div class="prop-name">${propertyName}</div>
                  <div class="prop-addr">📍 ${propertyAddress}</div>
                  <div class="prop-room">🛏️ ${roomName}</div>
                </div>
              </div>

              <div class="grid-details">
                <div class="detail-card">
                  <div class="detail-label">Lead Guest</div>
                  <div class="detail-main">${guestName}</div>
                  <div class="detail-sub">${guestPhone} ${guestEmail ? `• ${guestEmail}` : ''}</div>
                </div>

                <div class="detail-card">
                  <div class="detail-label">Duration & Total Amount</div>
                  <div class="detail-main">${nights} Night${nights > 1 ? 's' : ''}</div>
                  <div class="detail-sub">Total: ${totalAmount}</div>
                </div>

                <div class="detail-card">
                  <div class="detail-label">Check-in Date & Time</div>
                  <div class="detail-main">${checkInDate}</div>
                  <div class="detail-sub">From 14:00 (2:00 PM)</div>
                </div>

                <div class="detail-card">
                  <div class="detail-label">Check-out Date & Time</div>
                  <div class="detail-main">${checkOutDate}</div>
                  <div class="detail-sub">Until 12:00 (12:00 PM)</div>
                </div>
              </div>

              <div class="qr-security-box">
                <div>
                  <div class="qr-text-title">Check-in Security QR Code</div>
                  <div class="qr-text-desc">
                    Scan with any smartphone camera at reception to verify booking legitimacy and unlock host escrow payout 24h post-arrival.
                  </div>
                </div>
                <div class="qr-img-wrapper">
                  <img src="${qrCodeUrl}" class="qr-img" alt="QR Verification" />
                </div>
              </div>

              <div class="instructions">
                <strong>Check-in Notice:</strong> Present this voucher alongside a valid government-issued ID upon arrival. Payout to property host is securely retained in FindDestination Escrow and automatically released 24 hours after check-in.
              </div>
            </div>

            <div class="voucher-footer">
              <span>FindDestination Nigeria Ltd • CAC RC: 7890123</span>
              <span>https://finddestination.com.ng</span>
            </div>
          </div>
        </body>
      </html>
    `);
    doc.close();

    const triggerPrint = () => {
      try {
        printIframe.contentWindow.focus();
        printIframe.contentWindow.print();
      } catch (err) {
        console.error("Print execution failed:", err);
      } finally {
        setTimeout(() => {
          if (printIframe && printIframe.parentNode) {
            printIframe.parentNode.removeChild(printIframe);
          }
        }, 1500);
      }
    };

    setTimeout(triggerPrint, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200 print-voucher-modal-overlay">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] print-voucher-card">

        {/* Header */}
        <div className="bg-gradient-to-r from-tafiya-blue to-tafiya-blue-700 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer no-print"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-tafiya-gold">Booking Confirmed</span>
          </div>

          <h2 className="text-xl font-black">Official Trip Voucher</h2>
          <p className="text-xs text-slate-200 mt-1">Present this digital voucher upon check-in at property.</p>
        </div>

        {/* Voucher Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 bg-white">

          {/* Reference Badge */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Booking Reference</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-base font-black text-tafiya-blue font-mono">{reference}</span>
                <button
                  type="button"
                  onClick={handleCopyRef}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors no-print cursor-pointer"
                  title="Copy reference number"
                >
                  {isCopied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Status</span>
              <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <Lock className="w-3 h-3" /> Escrow Held
              </span>
            </div>
          </div>

          {/* Property Info */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Accommodation Details</h3>
            <div className="flex items-start gap-4 p-4 border border-slate-200 rounded-2xl">
              <img
                src={propertyImage}
                alt={propertyName}
                className="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-100"
              />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900">{propertyName}</h4>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-tafiya-blue" />
                  <span>{propertyAddress}</span>
                </p>
                <p className="text-xs font-semibold text-slate-700">{roomName}</p>
              </div>
            </div>
          </div>

          {/* Guest & Stay Schedule */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold block">Lead Guest</span>
              <span className="font-bold text-slate-800">{guestName}</span>
              <span className="text-[11px] text-slate-500 block">{guestPhone}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold block">Duration</span>
              <span className="font-bold text-slate-800">{nights} Night{nights > 1 ? 's' : ''}</span>
              <span className="text-[11px] text-slate-500 block">Total: {totalAmount}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold block">Check-in</span>
              <span className="font-bold text-slate-800">{checkInDate}</span>
              <span className="text-[11px] text-slate-500 block">From 14:00 (2:00 PM)</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold block">Check-out</span>
              <span className="font-bold text-slate-800">{checkOutDate}</span>
              <span className="text-[11px] text-slate-500 block">Until 12:00 (12:00 PM)</span>
            </div>
          </div>

          {/* Real Scannable QR Code & Settlement Info */}
          <div className="flex items-center justify-between p-4 bg-tafiya-blue-50/50 border border-tafiya-blue-100 rounded-2xl gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-900 block flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-tafiya-blue" />
                Check-in Security QR Code
              </span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Scan with any smartphone camera at reception to verify booking legitimacy and release escrow.
              </p>
              <span className="text-[10px] font-mono font-bold text-tafiya-blue block">
                {reference}
              </span>
            </div>

            {/* Real QR Code Generator Image */}
            <div className="w-20 h-20 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
              <img
                src={qrCodeUrl}
                alt={`QR Verification Code for ${reference}`}
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100 no-print">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-tafiya-gold" />
            <span>Print Voucher</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-tafiya-blue text-white rounded-full font-bold text-xs shadow-md hover:bg-tafiya-blue-600 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
