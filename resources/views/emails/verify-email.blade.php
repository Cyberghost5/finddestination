<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - FindDestination</title>
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f8fafc;
            color: #0f172a;
            margin: 0;
            padding: 0;
            line-height: 1.6;
        }
        .container {
            max-width: 580px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
            border: 1px solid #e2e8f0;
        }
        .header {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0066FF 100%);
            padding: 36px 30px;
            text-align: center;
            color: #ffffff;
        }
        .logo-box {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: #ffffff;
            padding: 6px 12px;
            border-radius: 16px;
            margin-bottom: 16px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .logo-box img {
            height: 38px;
            width: auto;
            display: block;
        }
        .brand-name {
            font-size: 22px;
            font-weight: 800;
            color: #ffffff;
            letter-spacing: -0.5px;
            margin: 0;
        }
        .brand-orange {
            color: #FF9900;
        }
        .content {
            padding: 40px 32px;
        }
        .title {
            font-size: 20px;
            font-weight: 800;
            color: #0f172a;
            margin-top: 0;
            margin-bottom: 12px;
            text-align: center;
        }
        .subtitle {
            font-size: 14px;
            color: #64748b;
            text-align: center;
            margin-bottom: 28px;
        }
        .otp-box {
            background: #f0f7ff;
            border: 2px dashed #0066FF;
            border-radius: 16px;
            padding: 20px;
            text-align: center;
            margin: 24px 0;
        }
        .otp-label {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #0066FF;
            margin-bottom: 6px;
            display: block;
        }
        .otp-code {
            font-family: 'Courier New', Courier, monospace;
            font-size: 34px;
            font-weight: 900;
            color: #0f172a;
            letter-spacing: 10px;
            margin: 0;
        }
        .btn-container {
            text-align: center;
            margin-top: 30px;
            margin-bottom: 30px;
        }
        .btn {
            display: inline-block;
            background: linear-gradient(135deg, #0066FF 0%, #0052cc 100%);
            color: #ffffff !important;
            font-size: 14px;
            font-weight: 700;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 50px;
            box-shadow: 0 4px 14px rgba(0, 102, 255, 0.35);
            transition: all 0.2s ease;
        }
        .info-card {
            background: #f8fafc;
            border-radius: 14px;
            padding: 16px;
            font-size: 12px;
            color: #64748b;
            border-left: 4px solid #FF9900;
            margin-top: 24px;
        }
        .footer {
            background: #f1f5f9;
            padding: 24px;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
        }
        .footer a {
            color: #0066FF;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header with Logo -->
        <div class="header">
            <div class="logo-box">
                <img src="{{ $logoUrl ?? 'https://finddestination.com.ng/logo.jpeg' }}" alt="FindDestination Logo">
            </div>
            <h1 class="brand-name">FindDestination<span class="brand-orange">.com.ng</span></h1>
            <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.8; font-weight: 500;">
                Verified Accommodations Across Northern Nigeria
            </p>
        </div>

        <!-- Content Body -->
        <div class="content">
            <h2 class="title">Welcome, {{ $userName }}! 👋</h2>
            <p class="subtitle">
                Thank you for registering with FindDestination. Please verify your email address to activate your account and start booking verified stays.
            </p>

            <!-- OTP Box -->
            <div class="otp-box">
                <span class="otp-label">Your Email Verification Code</span>
                <div class="otp-code">{{ $verificationCode }}</div>
            </div>

            <!-- CTA Button -->
            <div class="btn-container">
                <a href="{{ $verificationUrl }}" class="btn">Verify Email Address</a>
            </div>

            <!-- Security Note -->
            <div class="info-card">
                <strong>🔒 Security Notice:</strong> This code will expire in 30 minutes. If you did not create an account on FindDestination, no action is required and you can safely ignore this email.
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p style="margin: 0 0 6px 0;">© 2026 FindDestination.com.ng, Inc. All rights reserved.</p>
            <p style="margin: 0;">
                Bauchi • Kaduna • Kano • Plateau • Adamawa • Gombe | 
                <a href="https://finddestination.com.ng">Help Center</a>
            </p>
        </div>
    </div>
</body>
</html>
