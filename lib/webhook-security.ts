// lib/webhook-security.ts
import crypto from 'crypto';

const SIGNATURE_VERSION = 'v1';
const TOLERANCE_SECONDS = 300; // 5 minutes

export function verifyWhopSignature(
  rawBody: string,
  signature: string,
  timestamp: string
): boolean {
  try {
    // 1. Check timestamp to prevent replay attacks
    const currentTime = Math.floor(Date.now() / 1000);
    const webhookTime = parseInt(timestamp, 10);

    if (Math.abs(currentTime - webhookTime) > TOLERANCE_SECONDS) {
      console.warn('Webhook timestamp outside tolerance window');
      return false;
    }

    // 2. Parse signature header (format: v1=signature)
    const parts = signature.split('=');
    if (parts.length !== 2 || parts[0] !== SIGNATURE_VERSION) {
      console.error('Invalid signature format');
      return false;
    }

    const providedSignature = parts[1];

    // 3. Compute expected signature
    const signedPayload = `${timestamp}.${rawBody}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.WHOP_WEBHOOK_SECRET!)
      .update(signedPayload, 'utf8')
      .digest('hex');

    // 4. Use constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(providedSignature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

// Support for secret rotation (when transitioning)
export function verifyWhopSignatureWithRotation(
  rawBody: string,
  signature: string,
  timestamp: string,
  secrets: string[] // [currentSecret, previousSecret]
): boolean {
  return secrets.some(secret => {
    const signedPayload = `${timestamp}.${rawBody}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(signedPayload, 'utf8')
      .digest('hex');

    try {
      return crypto.timingSafeEqual(
        Buffer.from(signature.split('=')[1], 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch {
      return false;
    }
  });
}