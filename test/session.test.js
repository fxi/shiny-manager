import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Session, sessions } from '../src/session.js';
import { ProgrammableProxy } from '../src/proxy.js';
import { randomUUID } from 'crypto';
import * as utils from '../src/utils.js';

vi.mock('crypto', () => ({
  randomUUID: vi.fn().mockReturnValue('test-uuid')
}));

// Mock utils
vi.mock('../src/utils.js', () => ({
  getPort: vi.fn().mockResolvedValue(8000),
  wait: vi.fn().mockImplementation((ms) => new Promise(resolve => setTimeout(() => resolve('timeout'), ms)))
}));

vi.mock('child_process', () => ({
  spawn: vi.fn().mockReturnValue({
    pid: 12345,
    stdout: {
      on: vi.fn()
    },
    stderr: {
      on: vi.fn()
    },
    on: vi.fn(),
    kill: vi.fn()
  })
}));

// Mock the utils functions
vi.mock('../utils.js', () => ({
  getPort: vi.fn().mockResolvedValue(8000),
  wait: vi.fn().mockImplementation(async (ms) => {
    return new Promise((resolve) => {
      setTimeout(() => resolve('timeout'), 1);
    });
  })
}));

describe('Session Management', () => {
  let session;
  let proxy;
  let mockSocket;
  
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    
    // Create a new ProgrammableProxy instance
    proxy = new ProgrammableProxy();
    
    // Create a mock socket
    mockSocket = {
      emit: vi.fn()
    };
    
    // Create a session instance
    session = new Session(mockSocket, proxy, '/path/to/entrypoint.R');
  });
  
  afterEach(() => {
    // Clear the sessions Map after each test
    sessions.clear();
  });
  
  it('should create a session with the correct properties', () => {
    expect(session.id).toBe('test-uuid');
    expect(session.entrypoint).toBe('/path/to/entrypoint.R');
    expect(session.socket).toBe(mockSocket);
    expect(session.proxy).toBe(proxy);
  });
  
  it('should initialize a session correctly', async () => {
    // Mock the run and register methods
    session.run = vi.fn().mockResolvedValue(true);
    session.register = vi.fn();
    session.init_routine = vi.fn();
    
    // Call init
    const result = await session.init();
    
    // Check the result
    expect(result).toBe(true);
    expect(utils.getPort).toHaveBeenCalled();
    expect(session.port).toBe(8000);
    expect(session.url).toBe('http://0.0.0.0:8000');
    expect(session.path).toBe('/app/test-uuid/');
    expect(session.run).toHaveBeenCalled();
    expect(session.register).toHaveBeenCalled();
    expect(session.init_routine).toHaveBeenCalled();
    expect(mockSocket.emit).toHaveBeenCalledWith('init', '/app/test-uuid/');
  });
  
  it('should register and unregister the session correctly', () => {
    // Set up session properties
    session._port = 8000;
    session._url = 'http://0.0.0.0:8000';
    session._path = '/app/test-uuid/';
    
    // Mock the proxy methods
    proxy.register = vi.fn();
    proxy.unregister = vi.fn();
    
    // Register the session
    session.register();
    
    // Check if it was registered correctly
    expect(sessions.get('test-uuid')).toBe(session);
    expect(proxy.register).toHaveBeenCalledWith('/app/test-uuid/', 'http://0.0.0.0:8000');
    
    // Unregister the session
    session.unregister();
    
    // Check if it was unregistered correctly
    expect(sessions.get('test-uuid')).toBeUndefined();
    expect(proxy.unregister).toHaveBeenCalledWith('/app/test-uuid/');
  });
  
  it('should handle session destruction correctly', () => {
    // Set up session properties
    session._process = {
      kill: vi.fn()
    };
    
    // Mock the stop method instead of unregister directly
    session.stop = vi.fn();
    
    // Destroy the session
    session.destroy();
    
    // Check if destroy handled everything correctly
    expect(session.stop).toHaveBeenCalled();
    expect(session._destroyed).toBe(true);
    
    // Should do nothing if already destroyed
    session.stop.mockClear();
    
    session.destroy();
    
    expect(session.stop).not.toHaveBeenCalled();
  });
});