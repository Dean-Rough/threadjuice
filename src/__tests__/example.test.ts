/**
 * @jest-environment jsdom
 */

describe('Example Test Suite with jest-extended', () => {
  it('should use basic matchers', () => {
    expect(2 + 2).toBe(4);
    expect('hello world').toContain('world');
  });

  it('should use jest-extended string matchers', () => {
    const email = 'test@example.com';
    expect(email).toIncludeRepeated('@', 1);
    expect('hello').toStartWith('he');
    expect('world').toEndWith('ld');
  });

  it('should use jest-extended array matchers', () => {
    const array = [1, 2, 3, 4, 5];
    expect(array).toIncludeAllMembers([2, 4]);
    expect(array).toHaveLength(5);
    expect([]).toBeEmpty();
  });

  it('should use jest-extended object matchers', () => {
    const user = { name: 'John', age: 30, active: true };
    expect(user).toContainKey('name');
    expect(user).toContainValue('John');
    expect(user).toContainEntries([
      ['name', 'John'],
      ['age', 30],
    ]);
  });

  it('should use jest-extended number matchers', () => {
    expect(5).toBePositive();
    expect(10).toBeEven();
    expect(Math.PI).toBeCloseTo(3.14, 2);
  });

  it('should use jest-extended promise matchers', async () => {
    const resolvedPromise = Promise.resolve('success');
    const rejectedPromise = Promise.reject(new Error('failed'));

    await expect(resolvedPromise).toResolve();
    await expect(rejectedPromise).toReject();
    await expect(resolvedPromise).resolves.toBe('success');
  });

  it('should test TypeScript types', () => {
    interface User {
      id: number;
      name: string;
      email?: string;
    }

    const user: User = { id: 1, name: 'Test User' };
    expect(user.id).toBeNumber();
    expect(user.name).toBeString();
    expect(user.email).toBeUndefined();
  });
});
