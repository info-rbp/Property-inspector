"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMediaRetention = exports.listRetentionPolicies = exports.getRetentionPolicy = exports.createRetentionPolicy = exports.setLegalHold = exports.findExpiredMedia = exports.listInspectionMedia = exports.getMediaRecord = exports.updateMediaStatus = exports.createMediaRecord = exports.db = void 0;
const admin = __importStar(require("firebase-admin"));
const types_2 = require("../types");
const config_1 = require("../config");
// Initialize Firebase only if not already initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}
exports.db = admin.firestore();
const collection = exports.db.collection(config_1.config.FIRESTORE_COLLECTION);
const retentionCollection = exports.db.collection(config_1.config.FIRESTORE_RETENTION_COLLECTION || 'retention_policies');
const createMediaRecord = async (data) => {
    await collection.doc(data.mediaId).set(data);
};
exports.createMediaRecord = createMediaRecord;
const updateMediaStatus = async (mediaId, status, updates) => {
    await collection.doc(mediaId).update({
        status,
        ...updates,
    });
};
exports.updateMediaStatus = updateMediaStatus;
const getMediaRecord = async (mediaId, tenantId) => {
    const doc = await collection.doc(mediaId).get();
    if (!doc.exists)
        return null;
    const data = doc.data();
    // Tenant isolation enforcement
    if (data.tenantId !== tenantId)
        return null;
    return data;
};
exports.getMediaRecord = getMediaRecord;
const listInspectionMedia = async (tenantId, inspectionId, filters) => {
    let query = collection
        .where('tenantId', '==', tenantId)
        .where('inspectionId', '==', inspectionId);
    // Exclude deleted by default unless specifically asked
    query = query.where('status', '!=', types_2.MediaStatus.DELETED);
    if (filters.roomId)
        query = query.where('roomId', '==', filters.roomId);
    if (filters.componentId)
        query = query.where('componentId', '==', filters.componentId);
    if (filters.status)
        query = query.where('status', '==', filters.status);
    const snapshot = await query.orderBy('uploadedAt', 'desc').limit(100).get();
    return snapshot.docs.map(doc => doc.data());
};
exports.listInspectionMedia = listInspectionMedia;
const findExpiredMedia = async () => {
    const now = new Date().toISOString();
    return collection
        .where('status', '==', types_2.MediaStatus.READY)
        .where('isLegalHold', '==', false)
        .where('expiresAt', '<', now)
        .limit(50)
        .get();
};
exports.findExpiredMedia = findExpiredMedia;
const setLegalHold = async (mediaId, tenantId, isHold) => {
    const docRef = collection.doc(mediaId);
    await exports.db.runTransaction(async (t) => {
        const doc = await t.get(docRef);
        if (!doc.exists)
            throw new Error("Media not found");
        const data = doc.data();
        if (data.tenantId !== tenantId)
            throw new Error("Unauthorized");
        t.update(docRef, { isLegalHold: isHold });
    });
};
exports.setLegalHold = setLegalHold;
// Retention Policies
const createRetentionPolicy = async (policy) => {
    await retentionCollection.doc(policy.policyId).set(policy);
};
exports.createRetentionPolicy = createRetentionPolicy;
const getRetentionPolicy = async (policyId, tenantId) => {
    const doc = await retentionCollection.doc(policyId).get();
    if (!doc.exists)
        return null;
    const data = doc.data();
    if (data.tenantId !== tenantId)
        return null;
    return data;
};
exports.getRetentionPolicy = getRetentionPolicy;
const listRetentionPolicies = async (tenantId) => {
    const snapshot = await retentionCollection
        .where('tenantId', '==', tenantId)
        .where('isActive', '==', true)
        .get();
    return snapshot.docs.map(doc => doc.data());
};
exports.listRetentionPolicies = listRetentionPolicies;
const updateMediaRetention = async (mediaId, tenantId, policyId, retentionUntil) => {
    const docRef = collection.doc(mediaId);
    await exports.db.runTransaction(async (t) => {
        const doc = await t.get(docRef);
        if (!doc.exists)
            throw new Error("Media not found");
        const data = doc.data();
        if (data.tenantId !== tenantId)
            throw new Error("Unauthorized");
        t.update(docRef, {
            appliedPolicyId: policyId,
            retentionUntil: retentionUntil
        });
    });
};
exports.updateMediaRetention = updateMediaRetention;
