import { toHourBucket } from './rates.utils';

describe('toHourBucket', () => {
  it('normalizes timestamp to UTC hour bucket', () => {
    const timestamp = Date.parse('2026-04-21T10:37:45.000Z');

    expect(toHourBucket(timestamp)).toBe('2026-04-21T10:00:00.000Z');
  });
});
