interface EmailParams {
  username: string;
}

export interface VerifyEmailParams extends EmailParams {
  verifyLink: string;
}

export interface BlockUserParams extends EmailParams {
  appealLink: string;
  reason?: string;
}
export interface UnblockUserParams extends EmailParams {}
export interface SucceedBoughtParams extends EmailParams {
  articleName: string;
}

export interface CancelSubscriptionParams extends EmailParams {}

export interface NewPasswordNeededParams extends EmailParams {
  loginUrl: string;
}

export interface DeleteAccountParams extends EmailParams {}

export interface AskNewUsernameParams extends EmailParams {}

export interface ForgotPasswordParams extends EmailParams {
  resetPasswordUrl: string;
}

export interface ResetPasswordConfirmationParams extends EmailParams {}
