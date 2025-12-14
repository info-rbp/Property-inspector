const {onRequest} = require("firebase-functions/v2/https");
const server = require("./dist/server.js");

exports.gateway = onRequest(server);
