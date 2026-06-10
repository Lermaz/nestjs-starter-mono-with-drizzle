import { DomainError } from '../errors/domain.error';
import { ok } from './result.helpers';
import { unwrapDomainResult } from './unwrap-domain-result';

describe('unwrapDomainResult', () => {
  it('should return the value when result is ok', () => {
    const inputResult = ok({ accessToken: 'token' });
    const actualValue = unwrapDomainResult(inputResult);
    expect(actualValue).toEqual({ accessToken: 'token' });
  });

  it('should rethrow domain error when result failed', () => {
    const inputError = new DomainError('Invalid credentials', 401);
    expect(() => unwrapDomainResult({ ok: false, error: inputError })).toThrow(
      inputError,
    );
  });
});
