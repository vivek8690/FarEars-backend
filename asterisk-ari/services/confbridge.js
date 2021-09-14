/*jshint node:true*/
"use strict";
var ari = require("ari-client");
const {
  sendNotificationByExt,
  getExtensionDetails,
  sendMissedPTTNotification,
  createRecording,
} = require("../services/notification");
var clientObj, holdingBridge;

// following details you can find from /etc/asterisk/ari.conf and /etc/asterisk/http.conf
try {
  ari.connect("http://localhost:8088", "asterisk", "asterisk", clientLoaded);
} catch (err) {
  console.log("throwed error::", err);
}

// handler for client being loaded
function clientLoaded(err, client) {
  if (err) {
    console.log("err in client loading", err);
  } // handler for StasisStart event
  function stasisStart(event, channel) {
    // ensure the channel is not a dialed channel
    var dialed = event.args[0] === "dialed";
    if (!dialed) {
      client.channels.list(function (err, channels) {
        const isThere = channels.find((channelObj) =>
          channelObj.name.includes(channel.dialplan.exten)
        );
        if (isThere) {
          console.log("Seems busy", isThere.name);
          channel.hangup({ reason: "busy" }, function (err, resp) {});
        } else {
          channel.answer(function (err) {
            if (err) {
              console.log("dialed err", err);
            }
            console.log("Channel %s has entered our application", channel.name);
            originate(channel);
          });
        }
      });
    }
  }
  async function originate(channel) {
    var dialed = client.Channel();
    channel.on("StasisEnd", function (event, channel) {
      hangupDialed(channel, dialed);
    });
    dialed.on("ChannelDestroyed", function (event, dialed) {
      hangupOriginal(channel, dialed);
    });
    dialed.on("ChannelStateChange", function (event, channel) {
      console.log("Channel %s is now: %s", channel.name, channel.state);
    });
    dialed.on("StasisStart", function (event, dialed) {
      joinMixingBridge(channel, dialed);
      dialed.mute({ direction: "in" });
    });
    const caller = await getExtensionDetails(channel.caller.number);
    const callee = await getExtensionDetails(channel.dialplan.exten);
    console.log(
      `*********${caller.first_name} ${caller.last_name}(${caller.extension}) => ${callee.first_name} ${callee.last_name}(${callee.extension})`
    );
    // console.log("dialed", dialed);
    dialed.originate(
      {
        endpoint: `PJSIP/${channel.dialplan.exten}`,
        app: "ari-test",
        appArgs: "dialed",
        callerId: `${caller.first_name} ${caller.last_name}@${caller.extension}@${caller.profile}`,
        context: "testing",
        timeout: 10,
      },
      async function (err, dialedObj) {
        if (err) {
          if (JSON.parse(err.message).error == "Allocation failed") {
            await sendMissedPTTNotification(channel.dialplan.exten, caller);
            channel.hangup({ reason: "congestion" }, function (err, resp) {
              console.log("hangup err congestion", err);
            });
            console.log(
              `${callee.first_name} ${callee.last_name}(${callee.extension}) seems to be offline`
            );
            // setTimeout(() => {
            //   dialed.originate(
            //     {
            //       endpoint: `PJSIP/${channel.dialplan.exten}`,
            //       app: "ari-test",
            //       appArgs: "dialed",
            //       callerId: `${caller.first_name} ${caller.last_name}@${caller.extension}@${caller.profile}`,
            //       context: "testing",
            //       timeout: 20,
            //     },
            //     async function (err, dialedObj) {
            //       if (err) {
            //         if (JSON.parse(err.message).error == "Allocation failed") {
            //           ("sending missed PTT message");
            //           await sendMissedPTTNotification(
            //             channel.dialplan.exten,
            //             caller
            //           );
            //           channel.hangup({ reason: "congestion" }, function (err, resp) {
            //             console.log("hangup err",err);
            //           });
            //           console.log(
            //             `${callee.first_name} ${callee.last_name}(${callee.extension}) seems to be offline`
            //           );
            //         } else {
            //           console.log("err", err);
            //         }
            //       }
            //     }
            //   );
            // }, 5000);
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
      if (err) {
        console.log("hangupOriginal err");
      }
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
        console.log("dialed answer", err);
      }
    });
    bridge.create({ type: "mixing" }, function (err, bridge) {
      if (err) {
        console.log("bridge create", err);
      }

      console.log("Created bridge %s", bridge.id);
      addChannelsToBridge(channel, dialed, bridge);
      recordBridge(bridge, channel);
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
        console.log("bridge destroy", err);
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
        console.log("bridge add channel", err);
      }
    });
  }
  function recordBridge(bridge, channel) {
    bridge.record(
      { bridgeId: bridge.id, format: "wav", name: bridge.id },
      function (err, liverecording) {
        createRecording(
          channel.caller.number,
          channel.dialplan.exten,
          bridge.id
        );
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
