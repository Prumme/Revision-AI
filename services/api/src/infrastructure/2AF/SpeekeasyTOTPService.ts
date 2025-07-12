import { TOTPSecret } from "@domain/value-objects/TOTPSecret";
import { Injectable } from "@nestjs/common";
import { TOTPService } from "@services/TOTPService";
import * as speakeasy from 'speakeasy';

@Injectable()
export class SpeekeasyTOTPService implements TOTPService {
    public generateSecret(userId: string): TOTPSecret {
        const secret = speakeasy.generateSecret({ length: 20 });
        return {
            secret: secret.base32,
            otpauth_url: secret.otpauth_url,
            userId: userId,
        };
    }
    public verifyCode(code: string, secret: TOTPSecret): boolean {
        return speakeasy.totp.verify({
            secret: secret.secret,
            encoding: "base32",
            token: code
        });
    }

}