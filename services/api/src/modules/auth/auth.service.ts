import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '@modules/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcryptjs';
import { User } from '@entities/user.entity';
import { ReqUser } from '@common/types/request';
import { CustomerRepository } from '@repositories/customer.repository';
import { CustomerAndUser } from '@entities/customer.entity';
import { MailService } from '@infrastructure/resend/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject('CustomerRepository')
    private readonly customerRepository: CustomerRepository,
    private usersService: UserService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async signIn(
    email: string,
    pass: string,
  ): Promise<{ access_token: string; user: User }> {
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

    const payload = { sub: user.id, username: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: user,
    };
  }

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create(registerDto);

    // Génération du token de vérification (à implémenter selon votre logique)
    const verifyToken = await this.jwtService.signAsync({ sub: user.id });
    const verifyLink = `${process.env.FRONTEND_URL}/auth/verify-email?token=${verifyToken}`;

    // Envoi de l'email de vérification
    console.log(verifyLink);
    await this.mailService.sendVerifyEmail(user.email, {
      username: user.username,
      verifyLink: verifyLink,
    });

    return user;
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
        bio: user.bio,
      },
    };
  }

  async getCurrentCustomer(
    reqUser: ReqUser,
  ): Promise<Omit<CustomerAndUser, 'password' | 'lastUpdatedPassword'>> {
    const customerAndUser = await this.customerRepository.findByUserId(
      reqUser.sub,
    );
    if (!customerAndUser) {
      throw new UnauthorizedException('Customer not found');
    }
    if (!customerAndUser.customerId) {
      throw new UnauthorizedException('Customer ID not found');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, lastUpdatedPassword, ...customer } =
      customerAndUser as CustomerAndUser;
    return customer;
  }
}
