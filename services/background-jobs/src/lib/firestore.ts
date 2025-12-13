import { Firestore, Timestamp } from '@google-cloud/firestore';
import { config } from '../config';

const firestore = new Firestore({
  projectId: config.projectId,
  ignoreUndefinedProperties: true,
});

export const db = firestore;
export const jobsCollection = firestore.collection(config.firestore.collection);
export { Timestamp };
