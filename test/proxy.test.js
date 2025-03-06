import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProgrammableProxy } from '../proxy.js';

describe('ProgrammableProxy', () => {
  let proxy;
  
  beforeEach(() => {
    proxy = new ProgrammableProxy();
  });
  
  it('should create a proxy instance with empty routes', () => {
    expect(proxy).toBeDefined();
    expect(proxy.routes).toBeDefined();
    expect(proxy.routes.size).toBe(0);
  });
  
  it('should register routes correctly', () => {
    const sourcePath = '/app/test';
    const targetUrl = 'http://localhost:3000';
    
    const result = proxy.register(sourcePath, targetUrl);
    
    expect(result).toBe(true);
    expect(proxy.routes.size).toBe(1);
    expect(proxy.routes.get(sourcePath)).toBe(targetUrl);
  });
  
  it('should unregister routes correctly', () => {
    // Set up a route first
    const sourcePath = '/app/test';
    const targetUrl = 'http://localhost:3000';
    proxy.register(sourcePath, targetUrl);
    
    // Now unregister it
    const result = proxy.unregister(sourcePath);
    
    expect(result).toBe(true);
    expect(proxy.routes.size).toBe(0);
  });
  
  it('should return false when unregistering a non-existent route', () => {
    const result = proxy.unregister('/non-existent');
    
    expect(result).toBe(false);
  });
  
  it('should return registered routes as an object', () => {
    // Set up some routes
    proxy.register('/app/1', 'http://localhost:3001');
    proxy.register('/app/2', 'http://localhost:3002');
    
    const routes = proxy.getRoutes();
    
    expect(routes).toEqual({
      '/app/1': 'http://localhost:3001',
      '/app/2': 'http://localhost:3002'
    });
  });
  
  it('middleware should proxy requests for matching routes', () => {
    // Set up route
    proxy.register('/app/test', 'http://localhost:3000');
    
    // Mock req, res, next
    const req = {
      path: '/app/test/path',
      originalUrl: '/app/test/path?query=value',
      url: '/app/test/path?query=value'
    };
    const res = {};
    const next = vi.fn();
    
    // Mock web method
    proxy.proxy.web = vi.fn();
    
    // Call middleware
    const middleware = proxy.middleware();
    middleware(req, res, next);
    
    // Check if proxy.web was called with the right parameters
    expect(proxy.proxy.web).toHaveBeenCalledWith(req, res, {
      ws: true,
      target: 'http://localhost:3000'
    });
    expect(req.url).toBe('/path?query=value');
    expect(next).not.toHaveBeenCalled();
  });
  
  it('middleware should call next for non-matching routes', () => {
    // Set up route
    proxy.register('/app/test', 'http://localhost:3000');
    
    // Mock req, res, next for a non-matching route
    const req = {
      path: '/non-matching',
      originalUrl: '/non-matching'
    };
    const res = {};
    const next = vi.fn();
    
    // Call middleware
    const middleware = proxy.middleware();
    middleware(req, res, next);
    
    // Check that next was called
    expect(next).toHaveBeenCalled();
  });
});