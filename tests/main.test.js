const { greet, add, getVersion } = require('../src/main');

describe('Main Module', () => {
  describe('greet', () => {
    it('should greet a user by name', () => {
      expect(greet('World')).toBe('Hello, World!');
    });

    it('should greet with different names', () => {
      expect(greet('Alice')).toBe('Hello, Alice!');
      expect(greet('Bob')).toBe('Hello, Bob!');
    });

    it('should throw error for empty string', () => {
      expect(() => greet('')).toThrow('Name must be a non-empty string');
    });

    it('should throw error for null', () => {
      expect(() => greet(null)).toThrow('Name must be a non-empty string');
    });

    it('should throw error for undefined', () => {
      expect(() => greet(undefined)).toThrow('Name must be a non-empty string');
    });

    it('should throw error for non-string', () => {
      expect(() => greet(123)).toThrow('Name must be a non-empty string');
    });
  });

  describe('add', () => {
    it('should add two positive numbers', () => {
      expect(add(2, 3)).toBe(5);
    });

    it('should add negative numbers', () => {
      expect(add(-1, -2)).toBe(-3);
    });

    it('should add mixed numbers', () => {
      expect(add(-5, 10)).toBe(5);
    });

    it('should handle zero', () => {
      expect(add(0, 5)).toBe(5);
      expect(add(5, 0)).toBe(5);
    });

    it('should handle decimals', () => {
      expect(add(0.1, 0.2)).toBeCloseTo(0.3);
    });

    it('should throw error for non-numbers', () => {
      expect(() => add('1', 2)).toThrow('Both arguments must be numbers');
      expect(() => add(1, '2')).toThrow('Both arguments must be numbers');
    });
  });

  describe('getVersion', () => {
    it('should return version string', () => {
      expect(getVersion()).toBe('1.0.0');
    });

    it('should return a string', () => {
      expect(typeof getVersion()).toBe('string');
    });
  });
});
