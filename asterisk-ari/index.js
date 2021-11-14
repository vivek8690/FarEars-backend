const express = require("express");
const cors = require("cors");
const Sentry = require("@sentry/node");
const routes = require("./routes");
const port = 4000;
const env = "development";
const https = require("https");
const http = require("http");

const fs = require("fs");
const path = require("path");

Sentry.init({
  dsn: "https://a8e7cab41b5840d19ab651c374f59978@o1068118.ingest.sentry.io/6062265",
  tracesSampleRate: 1.0,
});

const app = express();
app.use(Sentry.Handlers.requestHandler());
app.use(express.json()); //Used to parse JSON bodies
app.use(express.urlencoded({ extended: true })); //Parse URL-encoded bodies

app.use(cors());

app.use("/api", routes);

app.listen(port, () => console.log(`server started on port ${port} (${env})`));

// const certOptions = {
//   key: fs.readFileSync(path.resolve(__dirname, "./certs/private.key")),
//   cert: fs.readFileSync(path.resolve(__dirname, "./certs/certificate.crt")),
// };
// https.createServer(certOptions, app).listen(port, () => {
//   console.log("Listening on port %d for https", port);
// });

process.on('uncaughtException', err => {
    Sentry.captureException(err);
});
