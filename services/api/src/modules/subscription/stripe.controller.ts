import { Controller, Headers, Inject, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import Stripe from 'stripe';
import { CustomerRepository } from '@repositories/customer.repository';
import {
  ActiveSubscriptionUseCaseFactory,
  InactiveSubscriptionUseCaseFactory,
} from '../../domain/usecases/SubscriptionUsecases';
import { Public } from '@common/decorators/public.decorator';
import { StripeSubscriptionProvider } from '../../infrastructure/stripe/StripeSubscriptionProvider';
import { MailService } from '@infrastructure/resend/mail.service';

export type StripeEventHandler = (event: Stripe.Event) => Promise<true | Error>;

@Controller('stripe')
export class StripeController {
  private stripe: Stripe;

  public constructor(
    private mailService: MailService,
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
      // Utiliser le rawBody capturé par le middleware
      const rawBody = req.rawBody;

      if (!rawBody) {
        throw new Error(
          'Raw body is required for webhook signature verification',
        );
      }

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
        case 'customer.subscription.updated':
          // Gérer les mises à jour d'abonnement si nécessaire
          console.log('Subscription updated:', event.data.object);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
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
      this.mailService,
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
      this.mailService,
      this.customerRepository,
    );

    return useCase({ customerId });
  }
}
