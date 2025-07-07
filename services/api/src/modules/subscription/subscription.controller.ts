import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Put,
  Req,
  Param,
} from '@nestjs/common';
import {
  UpsertCustomerUseCaseFactory,
  SubscribeUseCaseFactory,
  UnsubscribeUseCaseFactory,
} from '../../domain/usecases/SubscriptionUsecases';
import { SubscriptionProvider } from '@services/SubscriptionProvider';
import { SubscribeDTO } from '@modules/subscription/dto/subscribe.dto';
import { AuthService } from '@modules/auth/auth.service';
import { Request } from 'express';
import { ReqUser } from '@common/types/request';
import { CustomerDto } from '@modules/subscription/dto/customer.dto';
import { CustomerRepository } from '@repositories/customer.repository';
import { MailService } from '@infrastructure/resend/mail.service';
import { Public } from '@common/decorators/public.decorator';

@Controller('subscription')
export class SubscriptionController {
  public constructor(
    @Inject('SubscriptionProvider')
    private subscriptionProvider: SubscriptionProvider,
    @Inject('CustomerRepository')
    private customerRepository: CustomerRepository,
    private authService: AuthService,

    private mailService: MailService,
  ) {}

  @Post('/subscribe')
  async subscribe(@Body() body: SubscribeDTO) {
    const useCase = SubscribeUseCaseFactory(this.subscriptionProvider);
    const response = await useCase(body);
    if (!response) throw response;
    return { message: 'Subscription created successfully' };
  }

  @Post('/unsubscribe')
  async unsubscribe(@Req() req: Request & { user: ReqUser }) {
    const customer = await this.authService.getCurrentCustomer(req.user);
    const useCase = UnsubscribeUseCaseFactory(this.subscriptionProvider);
    const response = await useCase(customer);
    if (!response) throw response;
    return { message: 'Unsubscribed successfully' };
  }

  @Put('/customer')
  async putCustomer(
    @Req() req: Request & { user: ReqUser },
    @Body() body: CustomerDto,
  ) {
    const useCase = UpsertCustomerUseCaseFactory(
      this.subscriptionProvider,
      this.customerRepository,
    );
    const customer = await useCase({ ...body, userId: req.user.sub });
    if (customer instanceof Error) throw customer;
    return { message: 'Customer created/updated successfully', customer };
  }

  @Get('/customer')
  async getCustomer(@Req() req: Request & { user: ReqUser }) {
    const customer = await this.authService.getCurrentCustomer(req.user);
    return { customer };
  }

  @Get('/subscription-products')
  @Public()
  async getSubscriptionProducts() {
    const products = await this.subscriptionProvider.getProductsPrices();
    if (products instanceof Error) throw products;
    return { products };
  }

  @Get('/invoices/:customerId')
  async getInvoices(
    @Param('customerId') customerId: string,
    @Req() req: Request & { user: ReqUser },
  ) {
    const invoices = await this.subscriptionProvider.getInvoices(
      customerId,
      req.user,
    );
    if (invoices instanceof Error) throw invoices;
    return { invoices };
  }
}
