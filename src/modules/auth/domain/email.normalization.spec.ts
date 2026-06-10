import { normalizeEmail } from './email.normalization';

describe('normalizeEmail', () => {
  it('should trim and lowercase the email', () => {
    expect(normalizeEmail('  User@Example.COM  ')).toBe('user@example.com');
  });
});
