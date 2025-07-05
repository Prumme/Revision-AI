import { Controller, Headers, Inject, Post, Req } from '@nestjs/common';
import Stripe from 'stripe';
import { MailerService } from '@services/MailerService';
import { CustomerRepository } from '@repositories/customer.repository';
import {
  ActiveSubscriptionUseCaseFactory,
  InactiveSubscriptionUseCaseFactory,
} from '../../domain/usecases/SubscriptionUsecases';
import { Public } from '@common/decorators/public.decorator';
import { StripeSubscriptionProvider } from '../../infrastructure/stripe/StripeSubscriptionProvider';

export type StripeEventHandler = (event: Stripe.Event) => Promise<true | Error>;

@Controller('stripe')
export class StripeController {
  private stripe: Stripe;

  public constructor(
    @Inject('MailerService')
    private mailer: MailerService,
    @Inject('CustomerRepository')
    private customerRepository: CustomerRepository,
    @Inject(StripeSubscriptionProvider)
    private stripeSubscriptionProvider: StripeSubscriptionProvider,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  @Public()
  @Post('webhook')
  async handleWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
  ) {
    let response: true | Error = true;
    try {
      const rawBody = (req as any).rawBody || req.body;

      const event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
      );

      switch (event.type) {
        case 'invoice.payment_succeeded':
          response = await this.handleInvoicePaymentSucceeded(event);
          break;
        case 'invoice.payment_failed':
          response = await this.handleInvoicePaymentFailedOrDelete(event);
          break;
        case 'customer.subscription.deleted':
          response = await this.handleInvoicePaymentFailedOrDelete(event);
          break;
      }

      return { received: true };
    } catch (err) {
      console.error('Error verifying webhook signature:', err);
      response = new Error('Failed to verify webhook signature');
    }

    if (response instanceof Error) throw response;
    console.log('Webhook received:', response);
    return response;
  }

  private async handleInvoicePaymentSucceeded(
    event: Stripe.InvoicePaymentSucceededEvent,
  ) {
    const invoice = event.data.object as Stripe.Invoice;

    const useCase = ActiveSubscriptionUseCaseFactory(
      this.mailer,
      this.customerRepository,
    );

    const invoiceItem = await this.stripe.invoiceItems.retrieve(
      invoice.lines.data[0].id,
    );

    const tier = await this.stripeSubscriptionProvider.getTierByProductId(
      invoiceItem.pricing.price_details.product,
    );

    const result = await useCase({
      customerId: event.data.object.customer as string,
      tier,
    });

    if (result instanceof Error) {
      console.error('Error activating subscription:', result);
      return new Error('Failed to activate subscription');
    }

    return true;
  }

  private handleInvoicePaymentFailedOrDelete(
    event:
      | Stripe.InvoicePaymentFailedEvent
      | Stripe.CustomerSubscriptionDeletedEvent,
  ): Promise<true | Error> {
    const invoice = event.data.object as Stripe.Invoice;
    const customerId = invoice.customer as string;

    const useCase = InactiveSubscriptionUseCaseFactory(
      this.mailer,
      this.customerRepository,
    );

    return useCase({ customerId });
  }
}
