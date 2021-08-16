/*jshint node:true*/
"use strict";
var ari = require("ari-client");
const {
  sendNotificationByExt,
  getExtensionDetails,
  sendMissedPTTNotification,
  incomingPTTNotification
} = require("../services/notification");
var clientObj, holdingBridge;
console.log("loaded");

// following details you can find from /etc/asterisk/ari.conf and /etc/asterisk/http.conf
ari.connect("http://localhost:8088", "asterisk", "asterisk", clientLoaded);

// handler for client being loaded
function clientLoaded(err, client) {
  if (err) {
    throw err;
  } // handler for StasisStart event
  function stasisStart(event, channel) {
    // ensure the channel is not a dialed channel
    var dialed = event.args[0] === "dialed";
    if (!dialed) {
      channel.answer(function (err) {
        if (err) {
          throw err;
        }
        console.log("Channel %s has entered our application", channel.name);
        // client.recordings
        //   .listStored()
        //   .then(function (storedrecordings) {
        //     // console.log("storedrecordings",storedrecordings.map(x => x.name));
        //   })
        //   .catch(function (err) {});

        // var playback = client.Playback();
        // channel.play(
        //   { media: "sound:pls-wait-connect-call" },
        //   playback,
        //   function (err, playback) {
        //     if (err) {
        //       throw err;
        //     }
        //   }
        // );
        originate(channel);
      });
    }
  }
  async function originate(channel) {
    console.log(channel.dialplan);
    var dialed = client.Channel();
    channel.on("StasisEnd", function (event, channel) {
      hangupDialed(channel, dialed);
    });
    dialed.on("ChannelDestroyed", function (event, dialed) {
      hangupOriginal(channel, dialed);
    });
    dialed.on("StasisStart", function (event, dialed) {
      joinMixingBridge(channel, dialed);
      dialed.mute({ direction: "in" });
    });
    const caller = await getExtensionDetails(channel.caller.number);
    const callee = await getExtensionDetails(channel.dialplan.exten);
    console.log(`dial to :::${callee.first_name} ${callee.last_name}`);
    incomingPTTNotification(callee.extension,caller);
    dialed.originate(
      {
        endpoint: `PJSIP/${channel.dialplan.exten}`,
        app: "ari-test",
        appArgs: "dialed",
        callerId: `${caller.first_name} ${caller.last_name}@${caller.extension}@${caller.profile}`,
        context: "testing",
        timeout: 20,
      },
      function (err, dialedObj) {
        if (err) {
          if (JSON.parse(err.message).error == "Allocation failed") {
            sendNotificationByExt(channel.dialplan.exten);
            setTimeout(() => {
              dialed.originate(
                {
                  endpoint: `PJSIP/${channel.dialplan.exten}`,
                  app: "ari-test",
                  appArgs: "dialed",
                  callerId: `${caller.first_name} ${caller.last_name}@${caller.extension}@${caller.profile}`,
                  context: "testing",
                  timeout: 20,
                },
                function (err, dialedObj) {
                  sendMissedPTTNotification(channel.dialplan.exten,caller);
                  console.log(
                    `${callee.first_name} ${callee.last_name} seems to be offline`
                  );
                }
              );
            }, 2000);
          }
        }
      }
    );
  } // handler for original channel hanging up so we can gracefully hangup the // other end
  function hangupDialed(channel, dialed) {
    console.log(
      "Channel %s left our application, hanging up dialed channel %s",
      channel.name,
      dialed.name
    ); // hangup the other end
    dialed.hangup(function (err) {
      // ignore error since dialed channel could have hung up, causing the
      // original channel to exit Stasis
    });
  } // handler for the dialed channel hanging up so we can gracefully hangup the // other end
  function hangupOriginal(channel, dialed) {
    console.log(
      "Dialed channel %s has been hung up, hanging up channel %s",
      dialed.name,
      channel.name
    ); // hangup the other end
    channel.hangup(function (err) {
      // ignore error since original channel could have hung up, causing the
      // dialed channel to exit Stasis
    });
  } // handler for dialed channel entering Stasis
  function joinMixingBridge(channel, dialed) {
    var bridge = client.Bridge();
    dialed.on("StasisEnd", function (event, dialed) {
      dialedExit(dialed, bridge);
    });
    dialed.answer(function (err) {
      if (err) {
        throw err;
      }
    });
    bridge.create({ type: "mixing" }, function (err, bridge) {
      if (err) {
        throw err;
      }

      console.log("Created bridge %s", bridge.id);
      addChannelsToBridge(channel, dialed, bridge);
      recordBridge(bridge);
    });
  } // handler for the dialed channel leaving Stasis
  function dialedExit(dialed, bridge) {
    console.log(
      "Dialed channel %s has left our application, destroying bridge %s",
      dialed.name,
      bridge.id
    );
    bridge.destroy(function (err) {
      if (err) {
        throw err;
      }
    });
  } // handler for new mixing bridge ready for channels to be added to it
  function addChannelsToBridge(channel, dialed, bridge) {
    console.log(
      "Adding channel %s and dialed channel %s to bridge %s",
      channel.name,
      dialed.name,
      bridge.id
    );
    bridge.addChannel({ channel: [channel.id, dialed.id] }, function (err) {
      if (err) {
        throw err;
      }
    });
  }
  function recordBridge(bridge) {
    bridge.record(
      { bridgeId: bridge.id, format: "wav", name: bridge.id },
      function (err, liverecording) {
        // console.log("liverecording", liverecording);
        if (err) {
          console.log(err);
        }
      }
    );
  }

  client.on("StasisStart", stasisStart);
  client.start("ari-test");
  clientObj = client;
}

function getClientObj() {
  return clientObj;
}

module.exports = {
  holdingBridge,
  getClientObj,
};
