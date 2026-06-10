import { validateEnvironment } from './env.validation';

describe('validateEnvironment', () => {
  it('should allow development without explicit JWT_SECRET', () => {
    const actualConfig = validateEnvironment({ NODE_ENV: 'development' });
    expect(actualConfig.JWT_SECRET).toBe('change-me-in-production');
  });

  it('should reject default JWT_SECRET in production', () => {
    expect(() =>
      validateEnvironment({
        NODE_ENV: 'production',
        JWT_SECRET: 'change-me-in-production',
        DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/app',
      }),
    ).toThrow('JWT_SECRET must be set to a non-default value in production');
  });

  it('should reject missing DATABASE_URL in production', () => {
    expect(() =>
      validateEnvironment({
        NODE_ENV: 'production',
        JWT_SECRET: 'secure-production-secret',
      }),
    ).toThrow('DATABASE_URL must be set in production');
  });

  it('should accept valid production configuration', () => {
    const actualConfig = validateEnvironment({
      NODE_ENV: 'production',
      JWT_SECRET: 'secure-production-secret',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/app',
    });
    expect(actualConfig.JWT_SECRET).toBe('secure-production-secret');
  });

  it('should accept postgresql DATABASE_URL', () => {
    const actualConfig = validateEnvironment({
      NODE_ENV: 'development',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/app',
    });
    expect(actualConfig.DATABASE_URL).toBe(
      'postgresql://postgres:postgres@localhost:5432/app',
    );
  });

  it('should reject sqlite DATABASE_URL', () => {
    expect(() =>
      validateEnvironment({
        NODE_ENV: 'development',
        DATABASE_URL: 'sqlite://./data/app.db',
      }),
    ).toThrow('DATABASE_URL must use postgresql:// scheme');
  });
});
