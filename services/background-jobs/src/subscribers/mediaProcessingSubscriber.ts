import { PubSub } from '@google-cloud/pubsub';
import { config } from '../config';
import { db } from '../lib/firestore';
import { jobService } from '../services/jobService';
import { AnalysisMode, JobType } from '../types';

interface MediaProcessingMessage {
  mediaId: string;
  tenantId: string;
  storagePath?: string;
}

const pubsub = new PubSub({ projectId: config.projectId });

const parseMessage = (data: Buffer): MediaProcessingMessage => {
  try {
    return JSON.parse(data.toString()) as MediaProcessingMessage;
  } catch (error) {
    throw new Error(`Invalid media-processing payload: ${error}`);
  }
};

export const startMediaProcessingSubscriber = async () => {
  const subscription = pubsub.subscription(config.pubsub.subscription);

  subscription.on('message', async (message) => {
    try {
      const payload = parseMessage(message.data);
      const mediaRef = db.collection(config.firestore.mediaCollection).doc(payload.mediaId);
      const mediaDoc = await mediaRef.get();

      if (!mediaDoc.exists) {
        console.error(`[MediaSubscriber] Media ${payload.mediaId} not found. Acking message.`);
        message.ack();
        return;
      }

      const media = mediaDoc.data() as any;
      const inspectionId = media?.inspectionId;

      if (!inspectionId) {
        console.error(`[MediaSubscriber] Media ${payload.mediaId} missing inspectionId. Acking message.`);
        message.ack();
        return;
      }

      const imageUrl = payload.storagePath || media.paths?.original;

      await jobService.createJob({
        tenantId: payload.tenantId || media.tenantId,
        inspectionId,
        type: JobType.ANALYZE_ROOM,
        input: {
          roomId: media.roomId,
          mediaIds: [payload.mediaId],
          imageUrls: imageUrl ? [imageUrl] : [],
          analysisMode: AnalysisMode.STANDARD,
        },
      });

      console.log(`[MediaSubscriber] Enqueued analysis job for media ${payload.mediaId}`);
      message.ack();
    } catch (error) {
      console.error('[MediaSubscriber] Failed to process message', error);
      message.nack();
    }
  });

  subscription.on('error', (error) => {
    console.error('[MediaSubscriber] Subscription error', error);
  });

  console.log(`[MediaSubscriber] Listening on subscription ${config.pubsub.subscription} for topic ${config.pubsub.topic}`);
};
