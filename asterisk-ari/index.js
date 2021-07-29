const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const port = 4000;
const env = "development";

const app = express();

app.use(express.json()); //Used to parse JSON bodies
app.use(express.urlencoded({ extended: true })); //Parse URL-encoded bodies

app.use(cors());

app.use("/api", routes);

app.listen(port, () => console.log(`server started on port ${port} (${env})`));
