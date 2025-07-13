import { SetMetadata } from '@nestjs/common';
export const SIGNED_ROUTE = 'signedRoute';
export const SignedRoute = () => SetMetadata(SIGNED_ROUTE, true);
