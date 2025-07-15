import { Injectable, Logger } from '@nestjs/common';
import { verifyEmailTemplate } from './templates/verify-email';
import { CreateEmailResponseSuccess, Resend } from 'resend';
import {
  AskNewUsernameParams,
  BlockUserParams,
  CancelSubscriptionParams,
  DeleteAccountParams,
  ForgotPasswordParams,
  NewPasswordNeededParams,
  ResetPasswordConfirmationParams,
  SucceedBoughtParams,
  UnblockUserParams,
  VerifyEmailParams,
} from './types/emails-params';
import { blockUserTemplate } from './templates/block-user';
import { succeedBoughtTemplate } from './templates/succeed-bought';
import { cancelSubscriptionTemplate } from './templates/cancel-subscription';
import { newPasswordNeededTemplate } from './templates/new-password-needed';
import { deleteAccountTemplate } from './templates/delete-account';
import { unblockUserTemplate } from './templates/unblock-user';
import { askNewUsernameTemplate } from './templates/ask-new-username';
import { forgotPasswordTemplate } from './templates/forgot-password';
import { resetPasswordConfirmationTemplate } from './templates/reset-password-confirmation';

class NullResend {
  emails = {
    send: async () => {
      throw new Error('Resend API key is not set');
    },
  };
}

@Injectable()
export class MailService {
  private resend: Resend | NullResend;
  constructor() {
    const logger = new Logger(MailService.name);
    if (!process.env.RESEND_API_KEY) {
      logger.warn(
        'Resend API key is not set. MailService will not send emails.',
      );
      this.resend = new NullResend();
    } else {
      logger.log('Using Resend service for sending emails');
      this.resend = new Resend(process.env.RESEND_API_KEY);
    }
  }

  private async send(
    to: string,
    subject: string,
    html: string,
  ): Promise<CreateEmailResponseSuccess> {
    const { data, error } = await this.resend.emails.send({
      from: 'Contact <contact@revision-ai.com>',
      to: [to],
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

  public async sendUnblockUserEmail(
    to: string,
    params: UnblockUserParams,
  ): Promise<CreateEmailResponseSuccess> {
    const subject = 'Ton compte a été débloqué';
    const loginUrl = `${process.env.FRONTEND_URL}/login`;
    const template = unblockUserTemplate(params.username, loginUrl);
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

  public async sendSubscriptionDeactivationEmail(
    to: string,
    params: CancelSubscriptionParams,
  ): Promise<CreateEmailResponseSuccess> {
    const subject = 'Ton abonnement a été annulé';
    const template = cancelSubscriptionTemplate(params.username);
    return await this.send(to, subject, template);
  }

  public async sendSubscriptionActivationEmail(
    to: string,
    params: SucceedBoughtParams,
  ): Promise<CreateEmailResponseSuccess> {
    const subject = 'Ton abonnement a été activé';
    const template = succeedBoughtTemplate(params.username, params.articleName);
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

  public async sendAskNewUsernameEmail(
    to: string,
    params: AskNewUsernameParams,
  ): Promise<CreateEmailResponseSuccess> {
    const subject = 'Action requise : modifie ton nom d’utilisateur';
    const changeUsernameUrl = `${process.env.FRONTEND_URL}/profile`;
    const template = askNewUsernameTemplate(params.username, changeUsernameUrl);
    return await this.send(to, subject, template);
  }

  public async sendDeleteAccountEmail(
    to: string,
    params: DeleteAccountParams,
  ): Promise<CreateEmailResponseSuccess> {
    const subject = 'Ton compte a été supprimé';
    const template = deleteAccountTemplate(params.username);
    return await this.send(to, subject, template);
  }

  public async sendForgotPasswordEmail(
    to: string,
    params: ForgotPasswordParams,
  ): Promise<CreateEmailResponseSuccess> {
    const subject = 'Réinitialisation de ton mot de passe';
    const template = forgotPasswordTemplate(
      params.username,
      params.resetPasswordUrl,
    );
    return await this.send(to, subject, template);
  }

  public async sendResetPasswordConfirmationEmail(
    to: string,
    params: ResetPasswordConfirmationParams,
  ): Promise<CreateEmailResponseSuccess> {
    const subject = 'Mot de passe réinitialisé avec succès';
    const template = resetPasswordConfirmationTemplate(params.username);
    return await this.send(to, subject, template);
  }
}
