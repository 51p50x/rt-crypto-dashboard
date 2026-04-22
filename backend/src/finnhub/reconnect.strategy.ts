export interface ReconnectState {
  attempt: number;
}

export function getBackoffDelayMs(state: ReconnectState): number {
  const cappedAttempt = Math.min(state.attempt, 6);
  return 1000 * 2 ** cappedAttempt;
}
