import Stripe from 'stripe';
import { SubscriptionTier } from '../../domain/value-objects/subscriptionTier';
import { SubscriptionInfo } from 'domain/value-objects/subscriptionPrice';
import { SubscriptionProvider } from '@services/SubscriptionProvider';
import { Injectable } from '@nestjs/common';
import { CustomerIdentifier } from '@entities/customer.entity';
import { CustomerNotFoundError } from '../../domain/errors/SubscriptionError';
import { CustomerDto } from '@modules/subscription/dto/customer.dto';
import { Invoice } from '@common/types/invoice';
import { ReqUser } from '@common/types/request';
import { UserService } from '@modules/user/user.service';

@Injectable()
export class StripeSubscriptionProvider implements SubscriptionProvider {
  private readonly stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  private stripeProductIdToTier: Record<string, SubscriptionTier> = {};
  private tierToStripeProductId: Partial<Record<SubscriptionTier, string>> = {};
  private mappingInitialized = false;

  constructor(private userService: UserService) {
    this.initStripeMappings();
  }

  private async initStripeMappings() {
    if (this.mappingInitialized) return;
    const productsOrError = await this.getProductsPrices();
    if (productsOrError instanceof Error) {
      console.error('Failed to initialize Stripe mappings:', productsOrError);
      return;
    }
    const products = productsOrError;
    for (const product of products) {
      // Convention: productName doit correspondre à SubscriptionTier (ex: 'Basic', 'Pro')
      let tier: SubscriptionTier | undefined;
      switch (product.productName.toLowerCase()) {
        case 'basic':
          tier = SubscriptionTier.BASIC;
          break;
        case 'pro':
          tier = SubscriptionTier.PRO;
          break;
        default:
          console.warn(
            `Produit Stripe inconnu pour le mapping: ${product.productName}`,
          );
          continue;
      }
      this.stripeProductIdToTier[product.productId] = tier;
      this.tierToStripeProductId[tier] = product.productId;
    }
    this.mappingInitialized = true;
  }

  private async ensureMappingsInitialized() {
    if (!this.mappingInitialized) {
      await this.initStripeMappings();
    }
  }

  async getTierByProductId(
    productId: string,
  ): Promise<SubscriptionTier | undefined> {
    await this.ensureMappingsInitialized();
    return this.stripeProductIdToTier[productId];
  }

  async getProductIdByTier(
    tier: SubscriptionTier,
  ): Promise<string | undefined> {
    await this.ensureMappingsInitialized();
    // FREE n'est jamais dans le mapping
    if (tier === SubscriptionTier.FREE) return undefined;
    return this.tierToStripeProductId[tier];
  }

  async getProductsPrices(): Promise<SubscriptionInfo[] | Error> {
    try {
      // Add conditions to filter only product and prices that are for RevisionAI
      const products = await this.stripe.products.list({
        active: true,
      });

      const prices = await this.stripe.prices.list({
        active: true,
      });

      const subscriptionInfos: SubscriptionInfo[] = products.data.map(
        (product) => {
          const price = prices.data.find(
            (p) => p.product === product.id && p.active,
          );
          return {
            productId: product.id,
            productName: product.name,
            priceId: price ? price.id : null,
            recurringInterval: price ? price.recurring?.interval : null,
            amount: price ? price.unit_amount || 0 : 0,
            currency: price ? price.currency : 'eur',
          };
        },
      );
      subscriptionInfos.sort((a, b) => a.amount - b.amount);
      return subscriptionInfos;
    } catch (error) {
      console.error('Error fetching Stripe product prices:', error);
      return new Error('Failed to fetch Stripe product prices');
    }
  }

  async upsertCustomer(
    customerPayload: CustomerDto & { customerId?: string; email: string },
  ): Promise<CustomerIdentifier | Error> {
    try {
      let customer: Stripe.Customer;
      //update a customer on stripe if customerId is provided create a new one otherwise
      if (customerPayload.customerId) {
        customer = await this.stripe.customers.update(
          customerPayload.customerId,
          {
            email: customerPayload.email,
            name: `${customerPayload.firstName} ${customerPayload.lastName}`,
            address: customerPayload.address,
          },
        );
      } else {
        customer = await this.stripe.customers.create({
          email: customerPayload.email,
          name: `${customerPayload.firstName} ${customerPayload.lastName}`,
          address: customerPayload.address,
        });
      }

      if (!customer.id) {
        throw new Error('Customer ID not found after creation');
      }

      return { customerId: customer.id };
    } catch (e) {
      console.error('Error creating customer in Stripe:', e);
      return new Error('Failed to create customer');
    }
  }
  async getSubscriptionStatus(
    customerIdentifier: CustomerIdentifier,
  ): Promise<SubscriptionTier | Error> {
    try {
      await this.stripe.customers.retrieve(customerIdentifier.customerId);
    } catch (e) {
      console.error('Error retrieving subscription status:', e);
      return e;
    }

    const subscriptions = await this.stripe.subscriptions.list({
      customer: customerIdentifier.customerId,
      status: 'active',
    });

    if (subscriptions.data.length === 0) {
      return SubscriptionTier.FREE;
    }

    const subscription = subscriptions.data[0];
    const productId = subscription.items.data[0].price.product as string;
    const tier = await this.getTierByProductId(productId);
    if (!tier) return new Error('Customer is subscribed to an unknown tier');
    return tier;
  }

  async subscribe(
    customerIdentifier: CustomerIdentifier,
    tier: SubscriptionTier,
    paymentMethodId: string,
  ): Promise<true | Error> {
    try {
      const customer = await this.stripe.customers.retrieve(
        customerIdentifier.customerId,
      );

      if (!customer) return new Error('Customer not found');

      if (paymentMethodId) {
        await this.stripe.paymentMethods.attach(paymentMethodId, {
          customer: customerIdentifier.customerId,
        });
        await this.stripe.customers.update(customerIdentifier.customerId, {
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
        });
      }

      const currentSubscriptions =
        await this.getSubscriptionStatus(customerIdentifier);
      if (currentSubscriptions instanceof Error) {
        return currentSubscriptions;
      }

      if (currentSubscriptions === tier) {
        return true;
      }

      if (currentSubscriptions !== SubscriptionTier.FREE) {
        const unsubscribeResult = await this.unsubscribe(customerIdentifier, {
          immediateUnsubscribe: true,
        });
        if (unsubscribeResult instanceof Error) {
          return unsubscribeResult;
        }
      }
    } catch (error) {
      return new CustomerNotFoundError(customerIdentifier);
    }

    const productId = await this.getProductIdByTier(tier);
    if (!productId) return new Error('Invalid subscription tier');
    try {
      const priceId = await this.stripe.prices
        .list({
          product: productId,
          active: true,
        })
        .then((prices) => {
          if (prices.data.length === 0) return null;
          return prices.data[0].id;
        });

      if (!priceId) return new Error('Invalid subscription tier');

      const subscription = await this.stripe.subscriptions.create({
        customer: customerIdentifier.customerId,
        items: [
          {
            price: priceId,
          },
        ],
      });
      if (subscription.status !== 'active')
        return new Error('Subscription creation failed');
      return true;
    } catch (error) {
      console.error("Erreur lors de la création de l'abonnement:", error);
      return error;
    }
  }

  async unsubscribe(
    customerIdentifier: CustomerIdentifier,
    args?: any,
  ): Promise<true | Error> {
    try {
      await this.stripe.customers.retrieve(customerIdentifier.customerId);
    } catch (error) {
      console.error('Error retrieving customer:', error);
      return new CustomerNotFoundError(customerIdentifier);
    }

    const subscriptions = await this.stripe.subscriptions.list({
      customer: customerIdentifier.customerId,
      status: 'active',
    });

    if (subscriptions.data.length === 0) {
      return new Error('Aucun abonnement actif trouvé pour ce client.');
    }

    for (const subscription of subscriptions.data) {
      try {
        if (!args?.immediateUnsubscribe) {
          const updatedSubscription = await this.stripe.subscriptions.update(
            subscription.id,
            {
              cancel_at_period_end: true,
            },
          );
          if (!updatedSubscription.cancel_at_period_end) {
            return new Error('Failed to update subscription for cancellation');
          }
        } else {
          await this.stripe.subscriptions.cancel(subscription.id);
        }
      } catch (error) {
        console.error('Error canceling subscription:', error);
        return new Error('Failed to cancel subscription');
      }
    }

    return true;
  }

  async getInvoices(
    customerId: string,
    reqUser: ReqUser,
  ): Promise<Invoice[] | Error> {
    const user = await this.userService.findById(reqUser.sub);
    if (!user) return new Error('User not found');

    if (user.role !== 'admin' && user.customerId !== customerId) {
      return new Error('Unauthorized');
    }

    const invoices = await this.stripe.invoices.list({
      customer: customerId,
    });
    return invoices.data as Partial<Stripe.Invoice>[] as Invoice[];
  }
}
