import { describe, it, expect } from 'vitest';
import { formatNumber, formatCurrency, formatPercentage, cn } from '../utils';

describe('utils', () => {
  describe('formatNumber', () => {
    it('should format numbers in millions', () => {
      expect(formatNumber(1000000)).toBe('1.0M');
      expect(formatNumber(1500000)).toBe('1.5M');
      expect(formatNumber(2000000)).toBe('2.0M');
      expect(formatNumber(10500000)).toBe('10.5M');
    });

    it('should format numbers in thousands', () => {
      expect(formatNumber(1000)).toBe('1.0K');
      expect(formatNumber(1500)).toBe('1.5K');
      expect(formatNumber(25000)).toBe('25.0K');
      expect(formatNumber(999999)).toBe('1000.0K');
    });

    it('should format small numbers with two decimals', () => {
      expect(formatNumber(999)).toBe('999.00');
      expect(formatNumber(500)).toBe('500.00');
      expect(formatNumber(0)).toBe('0.00');
      expect(formatNumber(123.456)).toBe('123.46');
    });

    it('should handle string inputs', () => {
      expect(formatNumber('1500000')).toBe('1.5M');
      expect(formatNumber('1500')).toBe('1.5K');
      expect(formatNumber('500')).toBe('500.00');
    });

    it('should handle invalid string inputs', () => {
      expect(formatNumber('invalid')).toBe('0');
      expect(formatNumber('not-a-number')).toBe('0');
      expect(formatNumber('')).toBe('0');
    });

    it('should handle edge cases', () => {
      expect(formatNumber(NaN)).toBe('0');
      expect(formatNumber(0)).toBe('0.00');
      // Negative numbers don't trigger the K/M formatting since they're < 1000
      expect(formatNumber(-1000)).toBe('-1000.00');
    });
  });

  describe('formatCurrency', () => {
    it('should format currency with dollar sign', () => {
      expect(formatCurrency(1500000)).toBe('$1.5M');
      expect(formatCurrency(1500)).toBe('$1.5K');
      expect(formatCurrency(500)).toBe('$500.00');
    });

    it('should handle string inputs', () => {
      expect(formatCurrency('1500000')).toBe('$1.5M');
      expect(formatCurrency('500')).toBe('$500.00');
    });

    it('should handle invalid inputs', () => {
      expect(formatCurrency('invalid')).toBe('$0');
      expect(formatCurrency(NaN)).toBe('$0');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });
  });

  describe('formatPercentage', () => {
    it('should convert decimal to percentage', () => {
      expect(formatPercentage(0.65)).toBe('65.0%');
      expect(formatPercentage(0.123)).toBe('12.3%');
      expect(formatPercentage(1)).toBe('100.0%');
      expect(formatPercentage(0)).toBe('0.0%');
    });

    it('should handle string inputs', () => {
      expect(formatPercentage('0.5')).toBe('50.0%');
      expect(formatPercentage('0.333')).toBe('33.3%');
    });

    it('should handle small decimals', () => {
      expect(formatPercentage(0.001)).toBe('0.1%');
      expect(formatPercentage(0.0001)).toBe('0.0%');
    });

    it('should handle invalid inputs', () => {
      expect(formatPercentage('invalid')).toBe('0%');
      expect(formatPercentage(NaN)).toBe('0%');
    });

    it('should handle values greater than 1', () => {
      expect(formatPercentage(1.5)).toBe('150.0%');
    });
  });

  describe('cn', () => {
    it('should merge class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('should handle conditional classes', () => {
      expect(cn('base', false && 'hidden', true && 'visible')).toBe('base visible');
    });

    it('should handle undefined and null', () => {
      expect(cn('base', undefined, null, 'end')).toBe('base end');
    });

    it('should merge Tailwind classes correctly (later wins)', () => {
      expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    });

    it('should handle arrays', () => {
      expect(cn(['foo', 'bar'])).toBe('foo bar');
    });

    it('should handle objects', () => {
      expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');
    });

    it('should handle empty input', () => {
      expect(cn()).toBe('');
      expect(cn('')).toBe('');
    });
  });
});
