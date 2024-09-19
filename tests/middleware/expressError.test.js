// tests/errors.test.js

const { ExpressError, NotFoundError, UnauthorizedError, BadRequestError, ForbiddenError } = require('../../app/middleware/expressError');

describe('ExpressError', () => {
  test('should create an instance with correct message and status', () => {
    const message = 'Something went wrong';
    const status = 500;
    const error = new ExpressError(message, status);
    
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ExpressError);
    expect(error.message).toBe(message);
    expect(error.status).toBe(status);
  });
});

describe('NotFoundError', () => {
  test('should create an instance with default message and status 404', () => {
    const error = new NotFoundError();
    
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ExpressError);
    expect(error).toBeInstanceOf(NotFoundError);
    expect(error.message).toBe('Not Found');
    expect(error.status).toBe(404);
  });

  test('should create an instance with a custom message', () => {
    const customMessage = 'Resource not found';
    const error = new NotFoundError(customMessage);
    
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ExpressError);
    expect(error).toBeInstanceOf(NotFoundError);
    expect(error.message).toBe(customMessage);
    expect(error.status).toBe(404);
  });
});

describe('UnauthorizedError', () => {
  test('should create an instance with default message and status 401', () => {
    const error = new UnauthorizedError();
    
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ExpressError);
    expect(error).toBeInstanceOf(UnauthorizedError);
    expect(error.message).toBe('Unauthorized');
    expect(error.status).toBe(401);
  });

  test('should create an instance with a custom message', () => {
    const customMessage = 'Access denied';
    const error = new UnauthorizedError(customMessage);
    
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ExpressError);
    expect(error).toBeInstanceOf(UnauthorizedError);
    expect(error.message).toBe(customMessage);
    expect(error.status).toBe(401);
  });
});

describe('BadRequestError', () => {
  test('should create an instance with default message and status 400', () => {
    const error = new BadRequestError();
    
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ExpressError);
    expect(error).toBeInstanceOf(BadRequestError);
    expect(error.message).toBe('Bad Request');
    expect(error.status).toBe(400);
  });

  test('should create an instance with a custom message', () => {
    const customMessage = 'Invalid input';
    const error = new BadRequestError(customMessage);
    
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ExpressError);
    expect(error).toBeInstanceOf(BadRequestError);
    expect(error.message).toBe(customMessage);
    expect(error.status).toBe(400);
  });
});

describe('ForbiddenError', () => {
  test('should create an instance with default message and status 403', () => {
    const error = new ForbiddenError();
    
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ExpressError);
    expect(error).toBeInstanceOf(ForbiddenError);
    expect(error.message).toBe('Bad Request');
    expect(error.status).toBe(403);
  });

  test('should create an instance with a custom message', () => {
    const customMessage = 'Access forbidden';
    const error = new ForbiddenError(customMessage);
    
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ExpressError);
    expect(error).toBeInstanceOf(ForbiddenError);
    expect(error.message).toBe(customMessage);
    expect(error.status).toBe(403);
  });
});
