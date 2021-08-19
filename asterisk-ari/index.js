const express = require("express");
const cors = require("cors");
const Sentry = require("@sentry/node");
const routes = require("./routes");
const port = 4000;
const env = "development";

Sentry.init({
  dsn: "https://258165721b0840fca3da006373770b58@o966022.ingest.sentry.io/5916896",
  tracesSampleRate: 1.0,
});

const app = express();

app.use(express.json()); //Used to parse JSON bodies
app.use(express.urlencoded({ extended: true })); //Parse URL-encoded bodies

app.use(cors());

app.use("/api", routes);

app.listen(port, () => console.log(`server started on port ${port} (${env})`));

process.on('uncaughtException', err => {
    Sentry.captureException(err);
});
