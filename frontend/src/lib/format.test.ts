import { describe, expect, it } from 'vitest';
import { formatPrice, formatTimestamp } from './format';

describe('format utilities', () => {
  it('formats zero price as placeholder', () => {
    expect(formatPrice(0)).toBe('-');
  });

  it('formats crypto sub-unit values with 6 decimals', () => {
    expect(formatPrice(0.0301)).toBe('0.030100');
  });

  it('formats fiat-like values with 2 decimals', () => {
    const value = formatPrice(2354.5);
    expect(value).toContain('2');
    expect(value).toContain('354');
  });

  it('formats missing timestamp with explicit message', () => {
    expect(formatTimestamp(0)).toBe('No live tick yet');
  });

  it('formats non-zero timestamp to readable local time', () => {
    const value = formatTimestamp(1704067200000);
    expect(value).not.toBe('No live tick yet');
    expect(typeof value).toBe('string');
    expect(value.length).toBeGreaterThan(0);
  });
});
