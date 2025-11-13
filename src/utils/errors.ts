export class BaseError extends Error {
  constructor(message: string, public code: string, public timestamp: number = Date.now()) {
    super(message)
    this.name = this.constructor.name
  }
}

export class BusinessError extends BaseError {
  constructor(message: string, code: string) {
    super(message, code)
  }
}

export class SystemError extends BaseError {
  constructor(message: string, code: string, public originalError?: Error) {
    super(message, code)
  }
}

export class ExternalServiceError extends BaseError {
  constructor(public service: string, message: string, code: string, public statusCode?: number) {
    super(message, code)
  }
}

export class ApiError extends ExternalServiceError {
  constructor(message: string, code: string, statusCode?: number, public endpoint?: string) {
    super('QWeatherAPI', message, code, statusCode)
  }
}

export class NetworkError extends SystemError {
  constructor(message: string, originalError?: Error) {
    super(message, 'NETWORK_ERROR', originalError)
  }
}

export class TimeoutError extends SystemError {
  constructor(message: string = '请求超时') {
    super(message, 'TIMEOUT_ERROR')
  }
}

export class ValidationError extends BusinessError {
  constructor(public field: string, public value: any, message: string) {
    super(message, 'VALIDATION_ERROR')
  }
}

export const ERROR_CODES = {
  API_KEY_INVALID: 'API_KEY_INVALID',
  API_REQUEST_FAILED: 'API_REQUEST_FAILED',
  API_RESPONSE_INVALID: 'API_RESPONSE_INVALID',
  API_RATE_LIMIT: 'API_RATE_LIMIT',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  DATA_NOT_FOUND: 'DATA_NOT_FOUND',
  DATA_INVALID: 'DATA_INVALID',
  CITY_NOT_FOUND: 'CITY_NOT_FOUND',
  LOCATION_PERMISSION_DENIED: 'LOCATION_PERMISSION_DENIED',
  LOCATION_UNAVAILABLE: 'LOCATION_UNAVAILABLE',
  RATE_LIMITED: 'RATE_LIMITED',
} as const
