export interface TOTPSecret {
    secret: string; // The TOTP secret key
    otpauth_url: string; // The OTP Auth URL for generating QR codes
    userId: string; // The ID of the user associated with this TOTP secret
}