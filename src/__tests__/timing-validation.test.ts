/**
 * @jest-environment jsdom
 */

describe('Test Timing Validation', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should handle fake timers without timing out', () => {
    const callback = jest.fn();
    
    setTimeout(callback, 1000);
    
    expect(callback).not.toHaveBeenCalled();
    
    jest.advanceTimersByTime(1000);
    
    expect(callback).toHaveBeenCalled();
  });

  it('should complete simple async operations quickly', async () => {
    const promise = Promise.resolve('test');
    const result = await promise;
    
    expect(result).toBe('test');
  });

  it('should handle multiple timer operations', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    
    setTimeout(callback1, 500);
    setTimeout(callback2, 1000);
    
    jest.advanceTimersByTime(500);
    expect(callback1).toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();
    
    jest.advanceTimersByTime(500);
    expect(callback2).toHaveBeenCalled();
  });
});