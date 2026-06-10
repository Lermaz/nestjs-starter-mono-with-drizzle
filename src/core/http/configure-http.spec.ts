import { INestApplication } from '@nestjs/common';
import { configureHttpSecurity } from './configure-http';

describe('configureHttpSecurity', () => {
  it('should register helmet and body parsers', () => {
    const mockUse = jest.fn();
    const mockEnableCors = jest.fn();
    const mockApp = {
      use: mockUse,
      enableCors: mockEnableCors,
    } as unknown as INestApplication;
    configureHttpSecurity(mockApp, {
      port: 3000,
      nodeEnv: 'test',
      corsOrigins: [],
    });
    expect(mockUse).toHaveBeenCalledTimes(3);
    expect(mockEnableCors).not.toHaveBeenCalled();
  });

  it('should enable CORS when origins are configured', () => {
    const mockUse = jest.fn();
    const mockEnableCors = jest.fn();
    const mockApp = {
      use: mockUse,
      enableCors: mockEnableCors,
    } as unknown as INestApplication;
    configureHttpSecurity(mockApp, {
      port: 3000,
      nodeEnv: 'test',
      corsOrigins: ['http://localhost:5173'],
    });
    expect(mockEnableCors).toHaveBeenCalledWith({
      origin: ['http://localhost:5173'],
      credentials: true,
    });
  });
});
