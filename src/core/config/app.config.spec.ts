import { parseCorsOrigins, resolveSwaggerEnabled } from './app.config';

describe('parseCorsOrigins', () => {
  it('should return empty array when unset', () => {
    expect(parseCorsOrigins(undefined)).toEqual([]);
    expect(parseCorsOrigins('')).toEqual([]);
  });

  it('should parse comma-separated origins', () => {
    expect(
      parseCorsOrigins('http://localhost:5173, https://app.example.com'),
    ).toEqual(['http://localhost:5173', 'https://app.example.com']);
  });
});

describe('resolveSwaggerEnabled', () => {
  it('should enable Swagger outside production', () => {
    expect(resolveSwaggerEnabled('development', undefined)).toBe(true);
  });

  it('should disable Swagger in production by default', () => {
    expect(resolveSwaggerEnabled('production', undefined)).toBe(false);
  });

  it('should enable Swagger in production when explicitly set', () => {
    expect(resolveSwaggerEnabled('production', 'true')).toBe(true);
  });
});
