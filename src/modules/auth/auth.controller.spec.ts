import { Test, TestingModule } from '@nestjs/testing';
import { ok } from '../../common/result/result.helpers';
import { AuthService } from './application/auth.service';
import { AuthController } from './presentation/auth.controller';

describe('AuthController', () => {
  let authController: AuthController;
  let mockAuthService: jest.Mocked<Pick<AuthService, 'register' | 'login'>>;

  beforeEach(async () => {
    mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
    };
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();
    authController = app.get<AuthController>(AuthController);
  });

  describe('register', () => {
    it('should delegate to auth service', async () => {
      mockAuthService.register.mockResolvedValue(ok({ accessToken: 'token' }));
      const actualResult = await authController.register({
        email: 'user@example.com',
        password: 'password123',
      });
      expect(mockAuthService.register.mock.calls[0]).toEqual([
        'user@example.com',
        'password123',
      ]);
      expect(actualResult).toEqual({ accessToken: 'token' });
    });
  });

  describe('login', () => {
    it('should delegate to auth service', async () => {
      mockAuthService.login.mockResolvedValue(ok({ accessToken: 'token' }));
      const actualResult = await authController.login({
        email: 'user@example.com',
        password: 'password123',
      });
      expect(mockAuthService.login.mock.calls[0]).toEqual([
        'user@example.com',
        'password123',
      ]);
      expect(actualResult).toEqual({ accessToken: 'token' });
    });
  });
});
