"use strict";
const { port, env } = require("./config/vars");
const logger = require("./config/logger");
const app = require("./config/express");
const mongoose = require("./config/mongoose");
const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const Sentry = require("@sentry/node");


Sentry.init({
  dsn: "https://a8e7cab41b5840d19ab651c374f59978@o1068118.ingest.sentry.io/6062265",
  tracesSampleRate: 1.0,
});

// open mongoose connection
mongoose.connect();

// listen to requests
app.listen(port, () => logger.info(`server started on port ${port} (${env})`));
// const certOptions = {
//   key: fs.readFileSync(path.resolve(__dirname, "./certs/private.key")),
//   cert: fs.readFileSync(path.resolve(__dirname, "./certs/certificate.crt")),
// };
//
// https.createServer(certOptions, app).listen(port, () => {
//   console.log("Listening on port %d for https", port);
// });
/**
 * Exports express
 * @public
 */

 process.on('uncaughtException', err => {
     Sentry.captureException(err);
 });

module.exports = app;
