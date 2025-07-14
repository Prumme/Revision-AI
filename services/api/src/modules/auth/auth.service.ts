import { ReqUser } from '@common/types/request';
import { CustomerAndUser } from '@entities/customer.entity';
import { User } from '@entities/user.entity';
import { MailService } from '@infrastructure/resend/mail.service';
import { UserService } from '@modules/user/user.service';
import {
  Inject,
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CustomerRepository } from '@repositories/customer.repository';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { TOTPService, TOTPServiceProvider } from '@services/TOTPService';
import * as UserEntity from '@entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @Inject('CustomerRepository')
    private readonly customerRepository: CustomerRepository,
    private usersService: UserService,
    private jwtService: JwtService,
    private mailService: MailService,
    @Inject(TOTPServiceProvider.provide)
    private totpservice: TOTPService,
  ) {}

  async signIn(
    email: string,
    pass: string,
    totpCode?: string,
  ): Promise<{ access_token: string; user: User } | { needTOTP: boolean }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException();
    }

    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException('Email not verified');
    }

    if (user.blocked) {
      throw new UnauthorizedException('Account blocked');
    }

    if (UserEntity.hasTOTPEnabled(user)) {
      if (totpCode === undefined) {
        return { needTOTP: true };
      }
      const isTotpValid = this.totpservice.verifyCode(
        totpCode,
        user.TOTPSecret,
      );
      if (!isTotpValid) {
        throw new UnauthorizedException('Invalid TOTP code');
      }
    }

    const payload = { sub: user.id, username: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: user,
    };
  }

  async logout(): Promise<{ message: string }> {
    return { message: 'Déconnexion réussie' };
  }

  async register(registerDto: RegisterDto) {
    try {
      const user = await this.usersService.create(registerDto);

      // Génération du token de vérification (à implémenter selon votre logique)
      const verifyToken = await this.jwtService.signAsync({ sub: user.id });
      const verifyLink = `${process.env.FRONTEND_URL}/auth/verify-email?token=${verifyToken}`;

      // Envoi de l'email de vérification
      await this.mailService.sendVerifyEmail(user.email, {
        username: user.username,
        verifyLink: verifyLink,
      });

      return user;
    } catch (error) {
      if (error.message?.includes("nom d'utilisateur existe déjà")) {
        throw new ConflictException(
          "Un utilisateur avec ce nom d'utilisateur existe déjà",
        );
      }
      if (error.message?.includes('email existe déjà')) {
        throw new ConflictException(
          'Un utilisateur avec cet email existe déjà',
        );
      }
      throw error;
    }
  }

  async verifyEmail(token: string) {
    const decoded = await this.jwtService.verifyAsync(token);
    const user = await this.usersService.findById(decoded.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    await this.usersService.verifyEmail(user.id);
    return { message: 'Email vérifié avec succès' };
  }

  async getCurrentUser(reqUser: ReqUser) {
    const user = await this.usersService.findById(reqUser.sub);
    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        role: user.role,
        bio: user.bio,
        subscriptionTier: user.subscriptionTier,
        customerId: user.customerId,
        TOTPSecret: user.TOTPSecret,
      },
    };
  }

  async getCurrentCustomer(
    reqUser: ReqUser,
  ): Promise<Omit<CustomerAndUser, 'password' | 'lastUpdatedPassword'> | null> {
    const customerAndUser = await this.customerRepository.findByUserId(
      reqUser.sub,
    );
    if (!customerAndUser || !customerAndUser.customerId) {
      return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, lastUpdatedPassword, ...customer } =
      customerAndUser as CustomerAndUser;
    return customer;
  }

  async toogleTOTP(
    reqUser: ReqUser,
    enable: boolean,
    validateTOTPCode?: string,
  ): Promise<User> {
    const user = await this.usersService.findById(reqUser.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    } else if (enable) {
      if (validateTOTPCode && user.TOTPSecret) {
        const isTotpValid = this.totpservice.verifyCode(
          validateTOTPCode,
          user.TOTPSecret,
        );
        if (!isTotpValid) {
          throw new UnauthorizedException('Invalid TOTP code');
        }
        // find the user and set the TOTPSecret to active
        user.TOTPSecret.active = true;
      } else {
        // create a new TOTP secret not active
        const totpSecret = this.totpservice.generateSecret(user.id);
        user.TOTPSecret = totpSecret;
      }
    } else if (!enable) {
      // Disable TOTP
      user.TOTPSecret = null;
    }
    return this.usersService.update(user.id, user);
  }
}
