import { Test, TestingModule } from '@nestjs/testing';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../application/ports/user.repository.port';
import { AuthPublicApi } from './auth-public.api';

describe('AuthPublicApi', () => {
  let authPublicApi: AuthPublicApi;
  let mockUserRepository: jest.Mocked<UserRepositoryPort>;

  beforeEach(async () => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      findIdentityById: jest.fn(),
      save: jest.fn(),
    };
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        AuthPublicApi,
        {
          provide: USER_REPOSITORY,
          useValue: mockUserRepository,
        },
      ],
    }).compile();
    authPublicApi = app.get<AuthPublicApi>(AuthPublicApi);
  });

  describe('validateUser', () => {
    it('should return token payload when user exists', async () => {
      mockUserRepository.findIdentityById.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
      });
      const actualPayload = await authPublicApi.validateUser('user-1');
      expect(actualPayload).toEqual({
        userId: 'user-1',
        email: 'user@example.com',
      });
    });

    it('should return null when user does not exist', async () => {
      mockUserRepository.findIdentityById.mockResolvedValue(null);
      const actualPayload = await authPublicApi.validateUser('missing');
      expect(actualPayload).toBeNull();
    });
  });
});
