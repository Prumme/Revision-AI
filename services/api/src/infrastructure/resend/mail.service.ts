import { Injectable } from '@nestjs/common';
import { verifyEmailTemplate } from './templates/verify-email';
import { CreateEmailResponseSuccess, Resend } from 'resend';
import {
  BlockUserParams,
  CancelSubscriptionParams,
  NewPasswordNeededParams,
  SucceedBoughtParams,
  VerifyEmailParams,
} from './types/emails-params';
import { blockUserTemplate } from './templates/block-user';
import { succeedBoughtTemplate } from './templates/succeed-bought';
import { cancelSubscriptionTemplate } from './templates/cancel-subscription';
import { newPasswordNeededTemplate } from './templates/new-password-needed';

const resend = new Resend(process.env.RESEND_API_KEY);

@Injectable()
export class MailService {
  private async send(
    to: string,
    subject: string,
    html: string,
  ): Promise<CreateEmailResponseSuccess> {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // TODO: Change to the correct email
      to: ['aurelien23.p@gmail.com'], // TODO: Change to the correct email [to]
      subject: subject,
      html: html,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  public async sendVerifyEmail(
    to: string,
    params: VerifyEmailParams,
  ): Promise<CreateEmailResponseSuccess> {
    const subject = 'Vérification de votre adresse email';
    const template = verifyEmailTemplate(params.username, params.verifyLink);

    return await this.send(to, subject, template);
  }

  public async sendBlockUserEmail(
    to: string,
    params: BlockUserParams,
  ): Promise<CreateEmailResponseSuccess> {
    const subject = 'Ton compte a été temporairement bloqué';
    const template = blockUserTemplate(
      params.username,
      params.appealLink,
      params.reason,
    );
    return await this.send(to, subject, template);
  }

  public async sendSucceedBoughtEmail(
    to: string,
    params: SucceedBoughtParams,
  ): Promise<CreateEmailResponseSuccess> {
    const subject = 'Ton achat a été confirmé';
    const template = succeedBoughtTemplate(params.username, params.articleName);
    return await this.send(to, subject, template);
  }

  public async sendCancelSubscriptionEmail(
    to: string,
    params: CancelSubscriptionParams,
  ): Promise<CreateEmailResponseSuccess> {
    const subject = 'Ton abonnement a été annulé';
    const template = cancelSubscriptionTemplate(params.username);
    return await this.send(to, subject, template);
  }

  public async sendNewPasswordNeededEmail(
    to: string,
    params: NewPasswordNeededParams,
  ): Promise<CreateEmailResponseSuccess> {
    const subject = 'Nouveau mot de passe nécessaire';
    const template = newPasswordNeededTemplate(
      params.username,
      params.loginUrl,
    );
    return await this.send(to, subject, template);
  }
}
