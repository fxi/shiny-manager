import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProgrammableProxy } from '../proxy.js';
import express from 'express';

// Mock express
vi.mock('express', () => {
  const mockUse = vi.fn();
  const mockApp = {
    use: mockUse
  };
  return {
    default: vi.fn(() => mockApp),
    Router: vi.fn(() => ({ use: mockUse }))
  };
});

describe('Express Integration', () => {
  let proxy;
  let app;
  
  beforeEach(() => {
    proxy = new ProgrammableProxy();
    app = express();
  });
  
  it('should integrate with Express correctly', () => {
    // Add the proxy middleware to Express
    app.use(proxy.middleware());
    
    // Check if express.use was called with a function
    expect(app.use).toHaveBeenCalled();
    const middleware = app.use.mock.calls[0][0];
    expect(typeof middleware).toBe('function');
  });
  
  it('should handle multiple registered routes in the middleware', () => {
    // Register some routes
    proxy.register('/app/1', 'http://localhost:3001');
    proxy.register('/app/2', 'http://localhost:3002');
    
    // Mock proxy.web method
    proxy.proxy.web = vi.fn();
    
    // Create middleware
    const middleware = proxy.middleware();
    
    // Test with a matching route
    const req1 = {
      path: '/app/1/path',
      originalUrl: '/app/1/path?param=value',
      url: '/original/url'
    };
    const res1 = {};
    const next1 = vi.fn();
    
    middleware(req1, res1, next1);
    
    // Check if proxy.web was called correctly
    expect(proxy.proxy.web).toHaveBeenCalledWith(req1, res1, {
      ws: true,
      target: 'http://localhost:3001'
    });
    expect(req1.url).toBe('/path?param=value');
    expect(next1).not.toHaveBeenCalled();
    
    // Test with another matching route
    proxy.proxy.web.mockClear();
    const req2 = {
      path: '/app/2/different/path',
      originalUrl: '/app/2/different/path',
      url: '/original/url'
    };
    const res2 = {};
    const next2 = vi.fn();
    
    middleware(req2, res2, next2);
    
    // Check if proxy.web was called correctly for second route
    expect(proxy.proxy.web).toHaveBeenCalledWith(req2, res2, {
      ws: true,
      target: 'http://localhost:3002'
    });
    expect(req2.url).toBe('/different/path');
    expect(next2).not.toHaveBeenCalled();
  });
});