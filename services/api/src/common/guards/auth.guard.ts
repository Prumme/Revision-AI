import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { SIGNED_ROUTE } from '@common/decorators/signedRoute.decorator';
import { verifySignature } from '@infrastructure/urlSignature';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const isSigned = this.reflector.getAllAndOverride<boolean>(SIGNED_ROUTE, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();

    if (isSigned) {
      const signature = request.query.s as string;
      if (!signature) {
        throw new UnauthorizedException(
          'Signature is required for signed routes',
        );
      }
      const validSignature = verifySignature(
        request.path,
        signature,
        process.env.JWT_SECRET,
        request.query, // Assuming the query contains the parameters used for signing
      );
      return validSignature;
    } else {
      const token = this.extractTokenFromHeader(request);
      if (!token) {
        throw new UnauthorizedException();
      }
      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: process.env.JWT_SECRET,
        });
        request['user'] = payload;
      } catch {
        throw new UnauthorizedException();
      }
      return true;
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
