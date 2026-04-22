import { getBackoffDelayMs } from './reconnect.strategy';

describe('getBackoffDelayMs', () => {
  it('returns exponential delay for early attempts', () => {
    expect(getBackoffDelayMs({ attempt: 0 })).toBe(1000);
    expect(getBackoffDelayMs({ attempt: 1 })).toBe(2000);
    expect(getBackoffDelayMs({ attempt: 2 })).toBe(4000);
  });

  it('caps delay growth at attempt 6', () => {
    expect(getBackoffDelayMs({ attempt: 6 })).toBe(64000);
    expect(getBackoffDelayMs({ attempt: 10 })).toBe(64000);
  });
});
