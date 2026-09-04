import { OTP, sequelize } from './models';
import bcrypt from 'bcryptjs';

async function testTimezoneExpiry() {
  await sequelize.authenticate();

  const mobile = '+919999999999';
  const otpCode = '529214';
  const salt = await bcrypt.genSalt(10);
  const otpHash = await bcrypt.hash(otpCode, salt);
  const expiry = new Date(Date.now() + 600 * 1000);

  console.log('JS Current Time (Date.now()):', new Date().toISOString());
  console.log('JS Expiry Time:', expiry.toISOString());

  // Upsert OTP
  let existing = await OTP.findOne({ where: { mobile } });
  if (existing) {
    await existing.update({
      otp_hash: otpHash,
      attempts: 0,
      expires_at: expiry,
    });
    console.log('Updated existing OTP record in MySQL.');
  } else {
    existing = await OTP.create({
      mobile,
      otp_hash: otpHash,
      attempts: 0,
      expires_at: expiry,
    });
    console.log('Created new OTP record in MySQL.');
  }

  // Fetch back
  const fetched = await OTP.findOne({ where: { mobile } });
  if (fetched) {
    console.log('Fetched Record expires_at:', fetched.expires_at);
    console.log('Fetched Record expires_at (ISO):', new Date(fetched.expires_at).toISOString());
    console.log('Comparison (new Date() > fetched.expires_at):', new Date() > new Date(fetched.expires_at));
    const isMatch = await bcrypt.compare(otpCode, fetched.otp_hash);
    console.log('Bcrypt match result:', isMatch);
  }

  process.exit(0);
}

testTimezoneExpiry();
