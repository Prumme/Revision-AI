import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { SubscriptionTier } from '../../../domain/value-objects/subscriptionTier';

export class SubscribeDTO {
  @ApiProperty({ description: "ID du customer qui s'abonne" })
  @IsString()
  customerId: string;

  @ApiProperty({
    description: "ID stripe du moyen de paiement utilisé pour l'abonnement",
    required: false,
  })
  @IsString()
  paymentMethodId: string;

  @ApiProperty({
    enum: SubscriptionTier,
    description: "Niveau d'abonnement choisi",
  })
  @IsEnum(SubscriptionTier)
  @IsString()
  tier: SubscriptionTier;
}
