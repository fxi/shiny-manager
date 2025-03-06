import { describe, it, expect, vi } from 'vitest';
import { wait } from '../src/utils.js';
import * as net from 'net';

// NOTE: We're not testing getPort() thoroughly because it would require
// mocking a lot of Node's net module functionality which is complex.
// In a real scenario, we'd use a more comprehensive testing approach.

describe('Utility Functions', () => {
  it('wait should resolve with "timeout" after specified time', async () => {
    // Use a fast timeout for testing
    vi.useFakeTimers();
    
    const waitPromise = wait(1000);
    
    // Advance timers
    vi.advanceTimersByTime(1000);
    
    const result = await waitPromise;
    expect(result).toBe('timeout');
    
    vi.useRealTimers();
  });
  
  it('wait should use default 1000ms if no time specified', async () => {
    vi.useFakeTimers();
    
    const waitPromise = wait();
    
    // Advance timers by the default time
    vi.advanceTimersByTime(1000);
    
    const result = await waitPromise;
    expect(result).toBe('timeout');
    
    vi.useRealTimers();
  });
  
  it('wait should not resolve before the specified time', async () => {
    vi.useFakeTimers();
    
    const waitPromise = wait(2000);
    let resolved = false;
    
    // Create a promise that will set resolved to true when waitPromise resolves
    const testPromise = waitPromise.then(() => {
      resolved = true;
    });
    
    // Advance timers by less than the wait time
    vi.advanceTimersByTime(1000);
    
    // Allow any pending promises to resolve
    await Promise.resolve();
    
    // The wait promise should not have resolved yet
    expect(resolved).toBe(false);
    
    // Now advance to the full time
    vi.advanceTimersByTime(1000);
    
    // Allow any pending promises to resolve
    await testPromise;
    
    // Now the promise should have resolved
    expect(resolved).toBe(true);
    
    vi.useRealTimers();
  });
});