import { resolveRequestId } from './request-id.util';

describe('resolveRequestId', () => {
  it('should accept a valid UUID header value', () => {
    const inputRequestId = '550e8400-e29b-41d4-a716-446655440000';
    expect(resolveRequestId(inputRequestId)).toBe(inputRequestId);
  });

  it('should ignore invalid header values', () => {
    const actualRequestId = resolveRequestId('not-a-uuid\ninjected');
    expect(actualRequestId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(actualRequestId).not.toBe('not-a-uuid\ninjected');
  });

  it('should generate a UUID when header is missing', () => {
    const actualRequestId = resolveRequestId(undefined);
    expect(actualRequestId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });
});
