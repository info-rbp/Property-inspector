import { db, AUDIT_COLLECTION } from '../config/firebase';
import { AuditEventInput, AuditEventStored } from '../models/audit-schema';
import { hashPayload } from '../utils/crypto';
import { StorageService } from './storage.service';
import { v4 as uuidv4 } from 'uuid';
import { Buffer } from 'buffer';

const PAYLOAD_LIMIT = parseInt(process.env.PAYLOAD_SIZE_INLINE_LIMIT || '51200', 10);

export class AuditService {
  
  /**
   * Writes a new immutable audit event.
   * Handles hash chaining and payload offloading.
   */
  static async writeEvent(input: AuditEventInput): Promise<string> {
    const eventId = uuidv4();
    const timestamp = new Date().toISOString();
    
    // 1. Compute Hash
    const payloadHash = hashPayload(input.payload);
    
    // 2. Handle Payload Size
    const payloadString = JSON.stringify(input.payload);
    let finalPayload = input.payload;
    let payloadRef = undefined;

    if (Buffer.byteLength(payloadString) > PAYLOAD_LIMIT) {
      console.log(`Payload too large (${Buffer.byteLength(payloadString)} bytes), offloading to GCS...`);
      payloadRef = await StorageService.uploadPayload(input.tenantId, input.payload);
      finalPayload = undefined; // Do not store inline
    }

    // 3. Hash Chaining (Bonus Requirement)
    // We run this inside a transaction to ensure we link to the true latest event for this entity.
    await db.runTransaction(async (transaction) => {
      // Find the last event for this specific entity to link hash
      const lastEventQuery = db.collection(AUDIT_COLLECTION)
        .where('tenantId', '==', input.tenantId)
        .where('entityType', '==', input.entityType)
        .where('entityId', '==', input.entityId)
        .orderBy('timestamp', 'desc')
        .limit(1);

      const querySnapshot = await transaction.get(lastEventQuery);
      let previousHash = 'GENESIS_HASH'; // Default for first event

      if (!querySnapshot.empty) {
        const lastDoc = querySnapshot.docs[0].data() as AuditEventStored;
        // Chain: Previous Hash = Hash(Last Event's Payload Hash + Last Event's Meta)
        // For simplicity here, we chain the payloadHash of the previous record
        previousHash = lastDoc.payloadHash; 
      }

      const storedEvent: AuditEventStored = {
        auditEventId: eventId,
        tenantId: input.tenantId,
        entityType: input.entityType,
        entityId: input.entityId,
        eventType: input.eventType,
        actorType: input.actorType,
        actorId: input.actorId,
        sourceService: input.sourceService,
        correlationId: input.correlationId,
        timestamp,
        payloadHash,
        previousHash,
        payload: finalPayload, // Undefined if offloaded
        payloadRef,
        schemaVersion: 1,
        immutable: true
      };

      const docRef = db.collection(AUDIT_COLLECTION).doc(eventId);
      transaction.set(docRef, storedEvent);
    });

    return eventId;
  }

  /**
   * Reads history for a specific entity.
   */
  static async getEntityHistory(tenantId: string, entityType: string, entityId: string) {
    const snapshot = await db.collection(AUDIT_COLLECTION)
      .where('tenantId', '==', tenantId)
      .where('entityType', '==', entityType)
      .where('entityId', '==', entityId)
      .orderBy('timestamp', 'asc')
      .get();

    const events = await Promise.all(snapshot.docs.map(async doc => {
      const data = doc.data() as AuditEventStored;
      
      // If payload is offloaded, generate a signed URL (don't download automatically to keep list fast)
      if (data.payloadRef) {
        return {
          ...data,
          payloadDownloadUrl: await StorageService.getSignedUrl(data.payloadRef)
        };
      }
      return data;
    }));

    return events;
  }

  /**
   * Generates a summary for an inspection (Dispute Review).
   */
  static async getInspectionSummary(tenantId: string, inspectionId: string) {
    const snapshot = await db.collection(AUDIT_COLLECTION)
      .where('tenantId', '==', tenantId)
      .where('entityId', '==', inspectionId) // Assuming entityId is inspectionId or linked via correlation
      .orderBy('timestamp', 'asc')
      .get();

    const events = snapshot.docs.map(d => d.data() as AuditEventStored);

    const aiEvents = events.filter(e => e.actorType === 'ai');
    const humanOverrides = events.filter(e => 
      e.eventType === 'AI_SUGGESTION_EDITED' || e.eventType === 'AI_SUGGESTION_REJECTED'
    );
    const finalReport = events.find(e => e.eventType === 'REPORT_FINALIZED');

    return {
      inspectionId,
      totalEvents: events.length,
      firstSeen: events[0]?.timestamp,
      lastUpdate: events[events.length - 1]?.timestamp,
      aiStats: {
        analysisRequests: aiEvents.filter(e => e.eventType === 'AI_ANALYSIS_REQUESTED').length,
        modelsUsed: [...new Set(aiEvents.map(e => e.actorId))]
      },
      compliance: {
        humanOverridesCount: humanOverrides.length,
        isFinalized: !!finalReport,
        finalizedAt: finalReport?.timestamp
      }
    };
  }

  /**
   * Export Stream (Simplified for this example)
   */
  static async getExportQuery(tenantId: string, startDate?: string, endDate?: string) {
    let query = db.collection(AUDIT_COLLECTION).where('tenantId', '==', tenantId);

    if (startDate) query = query.where('timestamp', '>=', startDate);
    if (endDate) query = query.where('timestamp', '<=', endDate);

    return query.orderBy('timestamp', 'asc');
  }
}