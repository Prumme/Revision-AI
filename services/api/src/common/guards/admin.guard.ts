import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '@modules/user/user.service';
import { Inject } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    @Inject(UserService)
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }

    const fullUser = await this.userService.findById(user.sub);
    if (!fullUser || fullUser.role !== 'admin') {
      throw new UnauthorizedException('Accès refusé : rôle admin requis');
    }

    return true;
  }
}
