import { BrevoMailerService } from '../../infrastructure/brevo/BrevoMailerService';

export interface Mailable {
  to: string;
}

export interface MailerService {
  sendSubscriptionActivationEmail(
    mailable: Mailable,
    payload: any,
  ): Promise<true | Error>;

  sendSubscriptionDeactivationEmail(
    mailable: Mailable,
    payload: any,
  ): Promise<true | Error>;
}

export const MailerServiceProvider = {
  provide: 'MailerService',
  useClass: BrevoMailerService,
};
