export function formatPrice(value: number): string {
  if (value === 0) {
    return '-';
  }

  if (value < 1) {
    return value.toFixed(6);
  }

  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export function formatTimestamp(timestamp: number): string {
  if (!timestamp) {
    return 'No live tick yet';
  }

  return new Date(timestamp).toLocaleTimeString();
}
