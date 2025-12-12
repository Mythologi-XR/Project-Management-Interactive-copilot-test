const { capitalize, reverse, truncate, clamp, isEven, roundTo } = require('../src/utils');

describe('Utils Module', () => {
  describe('String Helpers', () => {
    describe('capitalize', () => {
      it('should capitalize first letter', () => {
        expect(capitalize('hello')).toBe('Hello');
      });

      it('should handle already capitalized', () => {
        expect(capitalize('Hello')).toBe('Hello');
      });

      it('should handle single character', () => {
        expect(capitalize('a')).toBe('A');
      });

      it('should handle empty string', () => {
        expect(capitalize('')).toBe('');
      });

      it('should throw error for non-string', () => {
        expect(() => capitalize(123)).toThrow('Input must be a string');
      });
    });

    describe('reverse', () => {
      it('should reverse a string', () => {
        expect(reverse('hello')).toBe('olleh');
      });

      it('should handle palindrome', () => {
        expect(reverse('radar')).toBe('radar');
      });

      it('should handle empty string', () => {
        expect(reverse('')).toBe('');
      });

      it('should handle single character', () => {
        expect(reverse('a')).toBe('a');
      });

      it('should throw error for non-string', () => {
        expect(() => reverse(123)).toThrow('Input must be a string');
      });
    });

    describe('truncate', () => {
      it('should truncate long strings', () => {
        expect(truncate('hello world', 5)).toBe('hello...');
      });

      it('should not truncate short strings', () => {
        expect(truncate('hi', 5)).toBe('hi');
      });

      it('should handle exact length', () => {
        expect(truncate('hello', 5)).toBe('hello');
      });

      it('should handle empty string', () => {
        expect(truncate('', 5)).toBe('');
      });

      it('should throw error for non-string input', () => {
        expect(() => truncate(123, 5)).toThrow('Input must be a string');
      });

      it('should throw error for negative maxLength', () => {
        expect(() => truncate('hello', -1)).toThrow('maxLength must be a positive number');
      });

      it('should throw error for non-number maxLength', () => {
        expect(() => truncate('hello', '5')).toThrow('maxLength must be a positive number');
      });
    });
  });

  describe('Number Helpers', () => {
    describe('clamp', () => {
      it('should clamp to min', () => {
        expect(clamp(-5, 0, 10)).toBe(0);
      });

      it('should clamp to max', () => {
        expect(clamp(15, 0, 10)).toBe(10);
      });

      it('should return value within range', () => {
        expect(clamp(5, 0, 10)).toBe(5);
      });

      it('should handle equal min and max', () => {
        expect(clamp(5, 3, 3)).toBe(3);
      });

      it('should throw error for non-numbers', () => {
        expect(() => clamp('5', 0, 10)).toThrow('All arguments must be numbers');
      });
    });

    describe('isEven', () => {
      it('should return true for even numbers', () => {
        expect(isEven(2)).toBe(true);
        expect(isEven(0)).toBe(true);
        expect(isEven(-4)).toBe(true);
      });

      it('should return false for odd numbers', () => {
        expect(isEven(1)).toBe(false);
        expect(isEven(3)).toBe(false);
        expect(isEven(-7)).toBe(false);
      });

      it('should throw error for non-number', () => {
        expect(() => isEven('2')).toThrow('Input must be a number');
      });
    });

    describe('roundTo', () => {
      it('should round to specified decimals', () => {
        expect(roundTo(3.14159, 2)).toBe(3.14);
      });

      it('should round up correctly', () => {
        expect(roundTo(3.145, 2)).toBe(3.15);
      });

      it('should handle zero decimals', () => {
        expect(roundTo(3.7, 0)).toBe(4);
      });

      it('should handle negative numbers', () => {
        expect(roundTo(-3.14159, 2)).toBe(-3.14);
      });

      it('should throw error for non-number inputs', () => {
        expect(() => roundTo('3.14', 2)).toThrow('Both arguments must be numbers');
        expect(() => roundTo(3.14, '2')).toThrow('Both arguments must be numbers');
      });
    });
  });
});
