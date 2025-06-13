describe('Simple Test Suite', () => {
  it('should demonstrate jest-extended matchers', () => {
    const data = {
      id: 123,
      name: 'Test User',
      active: true,
      tags: ['javascript', 'testing'],
      score: 85.5,
    };

    // Basic Jest Extended matchers
    expect(data).toBeObject();
    expect(data.id).toBeNumber();
    expect(data.id).toBePositive();
    expect(data.name).toBeString();
    expect(data.name).toStartWith('Test');
    expect(data.active).toBeTrue();
    expect(data.tags).toBeArray();
    expect(data.tags).toBeArrayOfSize(2);
    expect(data.tags).toIncludeAllMembers(['javascript', 'testing']);
    expect(data.score).toBeWithin(80, 90);
    expect(data).toContainKeys(['id', 'name', 'active']);
  });

  it('should validate array operations', () => {
    const numbers = [1, 2, 3, 4, 5];
    const strings = ['hello', 'world', 'test'];

    expect(numbers).toBeArrayOfSize(5);
    expect(numbers).toSatisfyAll((num: number) => num > 0);
    expect(strings).toSatisfyAny((str: string) => str.includes('test'));
    expect(numbers).toIncludeAllMembers([1, 3, 5]);
  });

  it('should test console logging utility', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation();
    
    // Simulate console-log-level usage
    const logger = {
      info: (message: string) => console.log(`INFO: ${message}`),
      error: (message: string) => console.log(`ERROR: ${message}`),
    };

    logger.info('Test message');
    logger.error('Test error');

    expect(logSpy).toHaveBeenCalledTimes(2);
    expect(logSpy).toHaveBeenCalledWith('INFO: Test message');
    expect(logSpy).toHaveBeenCalledWith('ERROR: Test error');

    logSpy.mockRestore();
  });
});