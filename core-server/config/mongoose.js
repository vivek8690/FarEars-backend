const mongoose = require("mongoose");
const logger = require("./../config/logger");
const { mongo, env } = require("./vars");
// Exit application on error
mongoose.connection.on("error", (err) => {
  logger.error(`MongoDB connection error: ${err}`);
  process.exit(-1);
});

// print mongoose logs in dev env
if (env === "development") {
  // mongoose.set('debug', true);
}
var MongoClient = require("mongodb").MongoClient;
MongoClient.connect(`${mongo.uri}`).then(function (client) {
  let db = client.db("asterisk");
  const { Users } = require("../api/models");
  let change_streams = db.collection("ps_contacts").watch();
  change_streams.on("change", async function (change) {
    const extension = change.documentKey._id.split(";")[0];
    const user = await Users.findOne({ extension });
    if (change.operationType === "delete") {
      setTimeout(async() => {
        const contact = await db
          .collection("ps_contacts")
          .findOne({ endpoint: parseInt(user.extension) });
          if(!contact){
            user.status = "offline";
            await user.save();
          }
      },500);
    } else {
      user.status = "online";
      await user.save();
    }
  });
});
/**
 * Connect to mongo db
 *
 * @returns {object} Mongoose connection
 * @public
 */
exports.connect = () => {
  mongoose.connect(mongo.uri, {
    keepAlive: 1,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  });
  return mongoose.connection;
};
