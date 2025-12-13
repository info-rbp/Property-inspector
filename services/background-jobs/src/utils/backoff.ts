import { Timestamp } from '../lib/firestore';
import { addSeconds, addMinutes } from 'date-fns';

export const calculateBackoff = (attempt: number): Timestamp => {
  const now = new Date();
  let nextRun: Date;

  // Exponential backoff strategy
  // 1: 10s, 2: 30s, 3: 2m, 4: 10m, 5: 30m
  switch (attempt) {
    case 1:
      nextRun = addSeconds(now, 10);
      break;
    case 2:
      nextRun = addSeconds(now, 30);
      break;
    case 3:
      nextRun = addMinutes(now, 2);
      break;
    case 4:
      nextRun = addMinutes(now, 10);
      break;
    case 5:
      nextRun = addMinutes(now, 30);
      break;
    default:
      // Cap at 60 mins for attempts > 5 (if maxAttempts allows)
      nextRun = addMinutes(now, 60);
      break;
  }

  return Timestamp.fromDate(nextRun);
};
