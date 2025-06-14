import { describe, it, expect } from '@jest/globals';

describe('Simple Test Without MSW', () => {
  it('should work with basic jest-extended matchers', () => {
    expect(2 + 2).toBe(4);
    expect('hello').toBeString();
    expect(42).toBeNumber();
    expect(true).toBeBoolean();
  });

  it('should test arrays with jest-extended', () => {
    const numbers = [1, 2, 3, 4, 5];
    expect(numbers).toIncludeAllMembers([2, 4]);
    expect(numbers).toHaveLength(5);
    expect([]).toBeEmpty();
  });

  it('should test objects with jest-extended', () => {
    const user = { name: 'Alice', age: 25 };
    expect(user).toContainKey('name');
    expect(user).toContainValue('Alice');
  });
});
