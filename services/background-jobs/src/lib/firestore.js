"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timestamp = exports.jobsCollection = exports.db = void 0;
const firestore_1 = require("@google-cloud/firestore");
Object.defineProperty(exports, "Timestamp", { enumerable: true, get: function () { return firestore_1.Timestamp; } });
const config_1 = require("../config");
const firestore = new firestore_1.Firestore({
    projectId: config_1.config.projectId,
    ignoreUndefinedProperties: true,
});
exports.db = firestore;
exports.jobsCollection = firestore.collection(config_1.config.firestore.collection);
