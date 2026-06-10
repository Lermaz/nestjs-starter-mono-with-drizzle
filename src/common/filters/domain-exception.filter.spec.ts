import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { DomainError } from '../errors/domain.error';
import { DomainExceptionFilter } from './domain-exception.filter';

describe('DomainExceptionFilter', () => {
  let domainExceptionFilter: DomainExceptionFilter;
  let mockResponse: { status: jest.Mock; json: jest.Mock };
  let mockRequest: { url: string };

  beforeEach(() => {
    domainExceptionFilter = new DomainExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockRequest = { url: '/todos' };
  });

  it('should map DomainError to configured status code', () => {
    const mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;
    const inputError = new DomainError('Todo title cannot be empty', 400);
    domainExceptionFilter.catch(inputError, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'Todo title cannot be empty',
        path: '/todos',
      }),
    );
  });
});
