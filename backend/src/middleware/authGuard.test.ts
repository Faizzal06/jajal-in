import { Request, Response } from 'express';
import { requireAuth, AuthRequest } from './authGuard';
import { supabase } from '../lib/supabase';

jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
  },
}));

describe('requireAuth middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  it('should return 401 if Authorization header is missing', async () => {
    await requireAuth(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized: No token provided' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 401 if token format is invalid', async () => {
    mockRequest.headers = { authorization: 'Bearer' };

    await requireAuth(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized: Invalid token' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 401 if supabase auth getUser returns an error or no user', async () => {
    mockRequest.headers = { authorization: 'Bearer invalid_token' };
    (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: null },
      error: new Error('Invalid token'),
    });

    await requireAuth(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(supabase.auth.getUser).toHaveBeenCalledWith('invalid_token');
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized: Invalid token' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should attach user to request and call next() if token is valid', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    mockRequest.headers = { authorization: 'Bearer valid_token' };
    (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    });

    await requireAuth(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(supabase.auth.getUser).toHaveBeenCalledWith('valid_token');
    expect((mockRequest as AuthRequest).user).toEqual(mockUser);
    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });
});
