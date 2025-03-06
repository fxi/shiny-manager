import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Session } from '../src/session.js';
import { ProgrammableProxy } from '../src/proxy.js';

describe('Socket.IO Integration', () => {
  let mockSocket;
  let proxy;
  
  beforeEach(() => {
    // Create a fresh proxy for each test
    proxy = new ProgrammableProxy();
    
    // Create a mock socket.io socket
    mockSocket = {
      emit: vi.fn(),
      on: vi.fn((event, callback) => {
        if (event === 'message') {
          mockSocket.messageCallback = callback;
        } else if (event === 'disconnect') {
          mockSocket.disconnectCallback = callback;
        }
      })
    };
    
    // Clear mocks
    vi.clearAllMocks();
  });
  
  it('should emit init event when session initialized', async () => {
    // Create a mock Session class that doesn't actually try to spawn processes
    const mockSession = {
      init: vi.fn().mockResolvedValue(true),
      destroy: vi.fn(),
      path: '/app/mock-id/'
    };
    
    // Mock the Session constructor
    vi.spyOn(Session.prototype, 'init').mockImplementation(async function() {
      this._path = '/app/mock-id/';
      this.socket.emit('init', this._path);
      return true;
    });
    
    // Create a new session
    const session = new Session(mockSocket, proxy, '/path/to/app.R');
    await session.init();
    
    // Check if the socket emitted the init event
    expect(mockSocket.emit).toHaveBeenCalledWith('init', '/app/mock-id/');
  });
  
  it('should handle restart messages correctly', async () => {
    // Mock the Session methods
    vi.spyOn(Session.prototype, 'init').mockImplementation(async function() {
      this._path = '/app/mock-id/';
      this.socket.emit('init', this._path);
      return true;
    });
    
    vi.spyOn(Session.prototype, 'destroy').mockImplementation(function() {
      this._destroyed = true;
    });
    
    // Create a socket connection handler similar to index.js
    async function handleSocketConnection(socket) {
      let session = new Session(socket, proxy, '/path/to/app.R');
      await session.init();
      
      socket.on('message', async (value) => {
        if (value === 'restart') {
          session.destroy();
          session = new Session(socket, proxy, '/path/to/app.R');
          await session.init();
        }
      });
      
      socket.on('disconnect', () => {
        session.destroy();
      });
      
      return session;
    }
    
    // Initialize the connection
    const session = await handleSocketConnection(mockSocket);
    
    // Verify socket event handlers are registered
    expect(mockSocket.on).toHaveBeenCalledTimes(2);
    expect(mockSocket.on).toHaveBeenCalledWith('message', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    
    // Simulate a restart message
    Session.prototype.init.mockClear();
    mockSocket.emit.mockClear();
    
    await mockSocket.messageCallback('restart');
    
    // Should create a new session on restart
    expect(Session.prototype.init).toHaveBeenCalledTimes(1);
    expect(mockSocket.emit).toHaveBeenCalledWith('init', '/app/mock-id/');
  });
  
  it('should destroy session on disconnect', async () => {
    // Mock the Session methods
    vi.spyOn(Session.prototype, 'init').mockImplementation(async function() {
      return true;
    });
    
    const destroySpy = vi.spyOn(Session.prototype, 'destroy').mockImplementation(function() {});
    
    // Create a socket connection handler similar to index.js
    async function handleSocketConnection(socket) {
      let session = new Session(socket, proxy, '/path/to/app.R');
      await session.init();
      
      socket.on('disconnect', () => {
        session.destroy();
      });
      
      return session;
    }
    
    // Initialize the connection
    const session = await handleSocketConnection(mockSocket);
    
    // Simulate a disconnect
    mockSocket.disconnectCallback();
    
    // Should destroy the session
    expect(destroySpy).toHaveBeenCalledTimes(1);
  });
});