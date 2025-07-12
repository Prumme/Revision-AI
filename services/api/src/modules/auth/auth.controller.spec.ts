import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;


  const mockAuthService = {
    signIn: jest.fn(),
    toogleTOTP: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('should login user successfully', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const expectedResult = { access_token: 'jwt-token', user:{} };

      authService.signIn.mockResolvedValue(expectedResult as any);

      const result = await controller.signIn(loginDto);

      expect(authService.signIn).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
        undefined
      );
      expect(result).toEqual(expectedResult);
    });
  });
});
