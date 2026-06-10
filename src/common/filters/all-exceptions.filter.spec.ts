import { ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './all-exceptions.filter';

describe('AllExceptionsFilter', () => {
  beforeAll(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });
  let allExceptionsFilter: AllExceptionsFilter;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockConfigService = {
      get: jest.fn().mockReturnValue('development'),
    } as unknown as ConfigService;
    allExceptionsFilter = new AllExceptionsFilter(mockConfigService);
  });

  it('should return error message in development', () => {
    const mockHost = createMockHost(mockStatus);
    allExceptionsFilter.catch(new Error('Unexpected failure'), mockHost);
    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Unexpected failure' }),
    );
  });

  it('should hide error details in production', () => {
    const mockConfigService = {
      get: jest.fn().mockReturnValue('production'),
    } as unknown as ConfigService;
    const productionFilter = new AllExceptionsFilter(mockConfigService);
    const mockHost = createMockHost(mockStatus);
    productionFilter.catch(new Error('Sensitive detail'), mockHost);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Internal server error' }),
    );
  });
});

function createMockHost(mockStatus: jest.Mock): ArgumentsHost {
  return {
    switchToHttp: () => ({
      getResponse: () => ({ status: mockStatus }),
      getRequest: () => ({ method: 'GET', url: '/todos' }),
    }),
  } as unknown as ArgumentsHost;
}
