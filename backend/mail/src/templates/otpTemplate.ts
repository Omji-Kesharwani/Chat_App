export function otpTemplate(otp: string) {
  return `
    <div style="background: #181A20; min-height: 100vh; padding: 0; margin: 0;">
      <div style="max-width: 420px; margin: 40px auto; background: #23262F; border-radius: 18px; box-shadow: 0 4px 24px rgba(0,0,0,0.18); padding: 36px 32px 32px 32px; font-family: 'Segoe UI', 'Arial', sans-serif;">
        <div style="text-align: center; margin-bottom: 28px;">
          <!-- Use logo URL from environment variable -->
          <img src='${process.env.LOGO_URL}' alt='ChatApp Logo' style='width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, #4F8EF7 60%, #38B6FF 100%); box-shadow: 0 2px 8px rgba(79,142,247,0.18); margin-bottom: 12px;' />
          <div style="display: inline-block; background: linear-gradient(90deg, #4F8EF7 0%, #38B6FF 100%); color: #fff; font-size: 2rem; font-weight: 800; letter-spacing: 3px; border-radius: 18px; padding: 8px 32px; margin-top: 10px; margin-bottom: 0; box-shadow: 0 2px 8px rgba(79,142,247,0.18); font-family: 'Segoe UI', 'Arial', sans-serif;">ChatApp</div>
        </div>
        <h2 style="color: #4F8EF7; text-align: center; font-size: 2rem; font-weight: 700; margin-bottom: 12px; letter-spacing: 1px;">Verify Your Email</h2>
        <p style="color: #B0B3B8; font-size: 1.08rem; text-align: center; margin-bottom: 28px;">Enter the OTP below to verify your email address for <b style='color:#fff;'>ChatApp</b>.</p>
        <div style="background: linear-gradient(90deg, #4F8EF7 0%, #38B6FF 100%); color: #fff; font-size: 2.2rem; font-weight: 700; letter-spacing: 1px; border-radius: 10px; padding: 18px 0; text-align: center; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(79,142,247,0.10);">
          ${otp}
        </div>
        <p style="color: #8A8D91; font-size: 0.98rem; text-align: center; margin-bottom: 18px;">This OTP is valid for 5 minutes. <br/>Do not share it with anyone.</p>
        <hr style="border: none; border-top: 1px solid #35373B; margin: 28px 0;">
        <p style="color: #5A5C60; font-size: 0.92rem; text-align: center;">If you did not request this, you can safely ignore this email.</p>
      </div>
    </div>
  `;
} 