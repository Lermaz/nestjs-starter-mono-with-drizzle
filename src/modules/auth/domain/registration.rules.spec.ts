import { DomainError } from './domain.error';
import {
  assertEmailAvailable,
  assertPasswordMeetsPolicy,
  INVALID_CREDENTIALS_MESSAGE,
} from './registration.rules';

describe('assertPasswordMeetsPolicy', () => {
  it('should pass when password meets minimum length', () => {
    const actualResult = assertPasswordMeetsPolicy('password123');
    expect(actualResult.ok).toBe(true);
  });

  it('should fail when password is too short', () => {
    const actualResult = assertPasswordMeetsPolicy('short');
    expect(actualResult.ok).toBe(false);
    if (!actualResult.ok) {
      expect(actualResult.error).toBeInstanceOf(DomainError);
    }
  });

  it('should fail when password exceeds bcrypt limit', () => {
    const actualResult = assertPasswordMeetsPolicy('a'.repeat(73));
    expect(actualResult.ok).toBe(false);
    if (!actualResult.ok) {
      expect(actualResult.error.message).toContain('at most 72');
    }
  });
});

describe('assertEmailAvailable', () => {
  it('should pass when no user exists', () => {
    const actualResult = assertEmailAvailable(null);
    expect(actualResult.ok).toBe(true);
  });

  it('should fail with generic credentials error when email exists', () => {
    const existingUser = {
      id: 'user-1',
      email: 'user@example.com',
      passwordHash: 'hash',
      createdAt: new Date(),
    };
    const actualResult = assertEmailAvailable(existingUser);
    expect(actualResult.ok).toBe(false);
    if (!actualResult.ok) {
      expect(actualResult.error).toBeInstanceOf(DomainError);
      expect(actualResult.error.message).toBe(INVALID_CREDENTIALS_MESSAGE);
      expect(actualResult.error.statusCode).toBe(401);
    }
  });
});
