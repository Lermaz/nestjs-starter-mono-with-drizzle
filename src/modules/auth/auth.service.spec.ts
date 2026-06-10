import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';
import { DomainError } from '../../common/errors/domain.error';
import { User } from './domain/user.model';
import { AuthService } from './application/auth.service';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from './application/ports/user.repository.port';

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<UserRepositoryPort>;
  let mockJwtService: jest.Mocked<Pick<JwtService, 'signAsync'>>;

  const inputUser: User = {
    id: 'user-1',
    email: 'user@example.com',
    passwordHash: 'hashed-password',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      findIdentityById: jest.fn(),
      save: jest.fn(),
    };
    mockJwtService = {
      signAsync: jest.fn().mockResolvedValue('test-token'),
    };
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: USER_REPOSITORY,
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(10),
          },
        },
      ],
    }).compile();
    authService = app.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should create a user and return access token', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.save.mockResolvedValue(inputUser);
      const actualResult = await authService.register(
        '  User@Example.COM  ',
        'password123',
      );
      expect(actualResult.ok).toBe(true);
      if (actualResult.ok) {
        expect(actualResult.value).toEqual({ accessToken: 'test-token' });
      }
      expect(mockUserRepository.findByEmail.mock.calls[0]?.[0]).toBe(
        'user@example.com',
      );
      expect(mockUserRepository.save.mock.calls[0]?.[0]).toEqual({
        email: 'user@example.com',
        passwordHash: 'hashed-password',
      });
    });

    it('should return generic credentials error when email exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(inputUser);
      const actualResult = await authService.register(
        'user@example.com',
        'password123',
      );
      expect(actualResult.ok).toBe(false);
      if (!actualResult.ok) {
        expect(actualResult.error).toBeInstanceOf(DomainError);
        expect(actualResult.error.message).toBe('Invalid credentials');
        expect(actualResult.error.statusCode).toBe(401);
      }
    });

    it('should return DomainError when password is too short', async () => {
      const actualResult = await authService.register(
        'user@example.com',
        'short',
      );
      expect(actualResult.ok).toBe(false);
      if (!actualResult.ok) {
        expect(actualResult.error).toBeInstanceOf(DomainError);
      }
    });

    it('should return DomainError when password is too long', async () => {
      const actualResult = await authService.register(
        'user@example.com',
        'a'.repeat(73),
      );
      expect(actualResult.ok).toBe(false);
      if (!actualResult.ok) {
        expect(actualResult.error).toBeInstanceOf(DomainError);
      }
    });
  });

  describe('login', () => {
    it('should return access token for valid credentials', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(inputUser);
      jest.mocked(bcrypt.compare).mockResolvedValue(true as never);
      const actualResult = await authService.login(
        'user@example.com',
        'password123',
      );
      expect(actualResult.ok).toBe(true);
      if (actualResult.ok) {
        expect(actualResult.value).toEqual({ accessToken: 'test-token' });
      }
    });

    it('should return DomainError for unknown user', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      const actualResult = await authService.login(
        'user@example.com',
        'password123',
      );
      expect(actualResult.ok).toBe(false);
      if (!actualResult.ok) {
        expect(actualResult.error).toBeInstanceOf(DomainError);
      }
    });

    it('should return DomainError for invalid password', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(inputUser);
      jest.mocked(bcrypt.compare).mockResolvedValue(false as never);
      const actualResult = await authService.login(
        'user@example.com',
        'wrong-password',
      );
      expect(actualResult.ok).toBe(false);
      if (!actualResult.ok) {
        expect(actualResult.error).toBeInstanceOf(DomainError);
      }
    });
  });
});
