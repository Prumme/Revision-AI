import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@modules/user/user.service';
import { AuthService } from './auth.service';
import { MailService } from '@infrastructure/resend/mail.service';
import { TOTPService, TOTPServiceProvider } from '@services/TOTPService';
import { CustomerRepository } from '@repositories/customer.repository';
import { User } from '@entities/user.entity';
import * as UserEntity from '@entities/user.entity';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;
  let mailService: jest.Mocked<MailService>;
  let totpService: jest.Mocked<TOTPService>;
  let customerRepository: jest.Mocked<CustomerRepository>;

  const mockUser: User = {
    id: '1',
    username: 'testuser',
    updatedAt: new Date(),
    createdAt: new Date(),
    password: 'hashedPassword',
    emailVerified: true,
    TOTPSecret: null,
  } as User;

  const mockUserWithTOTP: User = {
    ...mockUser,
    TOTPSecret: {
      active: false,
      secret: 'secret123',
      otpauth_url: 'otpauth://totp/Example:test@example.com',
      userId: mockUser.id,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: 'CustomerRepository',
          useValue: {
            // Mock methods as needed
          },
        },
        {
          provide: UserService,
          useValue: {
            findByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: MailService,
          useValue: {
            // Mock methods as needed
          },
        },
        {
          provide: TOTPServiceProvider.provide,
          useValue: {
            verifyCode: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);
    mailService = module.get(MailService);
    totpService = module.get(TOTPServiceProvider.provide);
    customerRepository = module.get('CustomerRepository');
  });

  describe('signIn', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return access token and user for valid credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const mockToken = 'jwt-token';

      userService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue(mockToken);
      jest.spyOn(UserEntity, 'hasTOTPEnabled').mockReturnValue(false);

      const result = await service.signIn(email, password);

      expect(result).toEqual({
        access_token: mockToken,
        user: mockUser,
      });
      expect(userService.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        username: mockUser.email,
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const email = 'nonexistent@example.com';
      const password = 'password123';

      userService.findByEmail.mockResolvedValue(null);

      await expect(service.signIn(email, password)).rejects.toThrow(
        UnauthorizedException
      );
      expect(userService.findByEmail).toHaveBeenCalledWith(email);
    });

    it('should throw UnauthorizedException when email not verified', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const unverifiedUser = { ...mockUser, emailVerified: false };

      userService.findByEmail.mockResolvedValue(unverifiedUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.signIn(email, password)).rejects.toThrow(
        new UnauthorizedException('Email not verified')
      );
    });

    it('should return needTOTP when TOTP is enabled but code not provided', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      userService.findByEmail.mockResolvedValue(mockUserWithTOTP);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jest.spyOn(UserEntity, 'hasTOTPEnabled').mockReturnValue(true);

      const result = await service.signIn(email, password);

      expect(result).toEqual({ needTOTP: true });
      expect(UserEntity.hasTOTPEnabled).toHaveBeenCalledWith(mockUserWithTOTP);
    });

    it('should throw UnauthorizedException when TOTP code is invalid', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const totpCode = '123456';

      userService.findByEmail.mockResolvedValue(mockUserWithTOTP);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jest.spyOn(UserEntity, 'hasTOTPEnabled').mockReturnValue(true);
      totpService.verifyCode.mockReturnValue(false);

      await expect(service.signIn(email, password, totpCode)).rejects.toThrow(
        new UnauthorizedException('Invalid TOTP code')
      );
      expect(totpService.verifyCode).toHaveBeenCalledWith(
        totpCode,
        mockUserWithTOTP.TOTPSecret
      );
    });

    it('should return access token when TOTP code is valid', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const totpCode = '123456';
      const mockToken = 'jwt-token';

      userService.findByEmail.mockResolvedValue(mockUserWithTOTP);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jest.spyOn(UserEntity, 'hasTOTPEnabled').mockReturnValue(true);
      totpService.verifyCode.mockReturnValue(true);
      jwtService.signAsync.mockResolvedValue(mockToken);

      const result = await service.signIn(email, password, totpCode);

      expect(result).toEqual({
        access_token: mockToken,
        user: mockUserWithTOTP,
      });
      expect(totpService.verifyCode).toHaveBeenCalledWith(
        totpCode,
        mockUserWithTOTP.TOTPSecret
      );
    });

    it('should handle empty TOTP code as undefined', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const totpCode = '';

      userService.findByEmail.mockResolvedValue(mockUserWithTOTP);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jest.spyOn(UserEntity, 'hasTOTPEnabled').mockReturnValue(true);

      const result = await service.signIn(email, password, totpCode);

      expect(result).toEqual({ needTOTP: true });
    });
  });
});
