export abstract class DomainError extends Error {
  public abstract readonly statusCode: number;

  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UserNotFoundError extends DomainError {
  public readonly statusCode = 404;
  constructor(identifier: string) {
    super(`User with identifier '${identifier}' not found`, 'USER_NOT_FOUND');
  }
}

export class InvalidConfigError extends DomainError {
  public readonly statusCode = 400;
  constructor(message: string) {
    super(message, 'INVALID_CARD_CONFIG');
  }
}

export class AuthenticationError extends DomainError {
  public readonly statusCode = 401;
  constructor(message = 'Unauthorized') {
    super(message, 'AUTHENTICATION_FAILED');
  }
}

export class GitHubApiError extends DomainError {
  constructor(
    message: string,
    public readonly statusCode: number = 502,
    code = 'GITHUB_API_ERROR',
  ) {
    super(message, code);
  }
}
