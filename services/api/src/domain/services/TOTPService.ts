import { TOTPSecret } from "@domain/value-objects/TOTPSecret";
import { SpeekeasyTOTPService } from "@infrastructure/2AF/SpeekeasyTOTPService";

export interface TOTPService{
    generateSecret(userId:string): TOTPSecret;
    verifyCode(code : string, secret : TOTPSecret): boolean;    
}

export const TOTPServiceProvider = {
    provide: 'TOTPService',
    useClass: SpeekeasyTOTPService,
};