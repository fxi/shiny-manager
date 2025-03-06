import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProgrammableProxy } from '../src/proxy.js';

describe('WebSocket Handling', () => {
  let proxy;
  
  beforeEach(() => {
    proxy = new ProgrammableProxy();
  });
  
  it('should handle WebSocket upgrades for matching routes', () => {
    // Set up route
    proxy.register('/app/ws', 'http://localhost:4000');
    
    // Mock req, socket, head
    const req = {
      url: '/app/ws/socket'
    };
    const socket = {
      destroy: vi.fn()
    };
    const head = Buffer.from('');
    
    // Mock ws method
    proxy.proxy.ws = vi.fn();
    
    // Call handleUpgrade
    proxy.handleUpgrade(req, socket, head);
    
    // Check if proxy.ws was called with the right parameters
    expect(proxy.proxy.ws).toHaveBeenCalledWith(req, socket, head, {
      target: 'http://localhost:4000'
    });
    expect(req.url).toBe('/socket');
    expect(socket.destroy).not.toHaveBeenCalled();
  });
  
  it('should destroy socket for non-matching routes', () => {
    // Set up route
    proxy.register('/app/ws', 'http://localhost:4000');
    
    // Mock req, socket, head for a non-matching route
    const req = {
      url: '/non-matching'
    };
    const socket = {
      destroy: vi.fn()
    };
    const head = Buffer.from('');
    
    // Call handleUpgrade
    proxy.handleUpgrade(req, socket, head);
    
    // Check that socket.destroy was called
    expect(socket.destroy).toHaveBeenCalled();
  });
  
  it('should properly handle relative paths in WebSocket upgrades', () => {
    // Set up route
    proxy.register('/app/ws', 'http://localhost:4000');
    
    // Mock req, socket, head
    const req = {
      url: '/app/ws'
    };
    const socket = {
      destroy: vi.fn()
    };
    const head = Buffer.from('');
    
    // Mock ws method
    proxy.proxy.ws = vi.fn();
    
    // Call handleUpgrade
    proxy.handleUpgrade(req, socket, head);
    
    // Check if proxy.ws was called with the right parameters
    expect(proxy.proxy.ws).toHaveBeenCalledWith(req, socket, head, {
      target: 'http://localhost:4000'
    });
    expect(req.url).toBe('/');
  });
});