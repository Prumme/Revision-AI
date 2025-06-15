import { Mailable, MailerService } from '@services/MailerService';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BrevoMailerService implements MailerService {
  sendSubscriptionActivationEmail(
    mailable: Mailable,
    payload: any,
  ): Promise<true | Error> {
    console.log('Send subscription Email', mailable, payload);
    return Promise.resolve(true);
  }
  sendSubscriptionDeactivationEmail(
    mailable: Mailable,
    payload: any,
  ): Promise<true | Error> {
    console.log('Send Subscription Deactivation Email', mailable, payload);
    return Promise.resolve(true);
  }
}
