const { getClientObj, holdingBridge } = require("./confbridge");
const { sendPushNotification } = require("../services/notification");

const inviteToBridge = async function (inviteTo, inviteIn, fromUser) {
  console.log(inviteTo);
  const clientObj = getClientObj();
  try {
    console.log("callerId", `${fromUser.first_name} ${fromUser.last_name}`);
    console.log("inviteTo", inviteTo.extension);
    // create a new channel
    var dialed = clientObj.Channel();
    const bridges = await clientObj.bridges.list();
    let mixingBridge = bridges.find(
      (obj) => obj.bridge_type === "mixing" && obj.id == inviteIn
    );
    if (mixingBridge) {
      await clientObj.bridges.destroy({ bridgeId: inviteIn });
    }
    dialed.on("ChannelStateChange", function (event, channel) {
      console.log("Channel %s is now: %s", channel.name, channel.state);
    });

    dialed.on("StasisStart", function (event, dialed) {
      joinMixingBridge(inviteIn, dialed);
      dialed.on("ChannelDtmfReceived", dtmfReceived);
    });

    dialed.originate(
      {
        endpoint: `PJSIP/${inviteTo.extension}(${fromUser.extension})`,
        app: "ari-test",
        appArgs: "dialed",
        context: "testing",
        callerId: `${fromUser.first_name} ${fromUser.last_name}@${fromUser.extension}@${fromUser.profile}`,
        variables: { profile: fromUser.profile },
        timeout: 10,
      },
      function (err, dialedObj) {
        if (err) {
          if (JSON.parse(err.message).error == "Allocation failed") {
            sendPushNotification(inviteTo, fromUser);
            setTimeout(() => {
              dialed.originate(
                {
                  endpoint: `PJSIP/${inviteTo.extension}`,
                  app: "ari-test",
                  appArgs: "dialed",
                  context: "testing",
                  callerId: `${fromUser.first_name} ${fromUser.last_name}@${fromUser.extension}@${fromUser.profile}`,
                  variables: { profile: fromUser.profile },
                  timeout: 10,
                },
                function (err, dialedObj) {
                  console.log(`${inviteTo.email}(${inviteTo.extension}) seems to be offline`);
                }
              );
            }, 2000);
          }
        }
      }
    );
  } catch (err) {
    console.log(err);
  }

  async function dtmfReceived(event, channel) {
    var digit = parseInt(event.digit);
    console.log("digit pressed:::", digit);
    if (digit == "1") {
      await channel.mute({ direction: "in" });
      console.log(`${channel.name} has muted his self`);
    }
    if (digit == "2") {
      await channel.unmute({ direction: "in" });
      console.log(`${channel.name} has unmuted his self`);
    }
  }
  async function joinMixingBridge(inviteIn, dialed) {
    try {
      // dialed.on("StasisEnd", function (event, dialed) {
      //   dialedExit(dialed, mixingBridge);
      // });

      if (inviteTo.extension === fromUser.extension) {
        dialed.on("ChannelDestroyed", function (event, dialed) {
          dialedExit(dialed, mixingBridge);
        });
      }

      dialed.answer(function (err) {
        if (err) {
          console.log('dialed', err);
        }
      });
      console.log("dialed", dialed.name);
      const bridges = await clientObj.bridges.list();
      let mixingBridge = bridges.find(
        (obj) => obj.bridge_type === "mixing" && obj.id == inviteIn
      );
      if (!mixingBridge) {
        const mixingBridgeObj = clientObj.bridges;
        mixingBridge = await mixingBridgeObj.createWithId({
          type: "mixing,dtmf_events",
          bridgeId: inviteIn,
        });
        clientObj.bridges
          .record({
            maxDurationSeconds: 5,
            maxSilenceSeconds: 2,
            format: "gsm",
            ifExists: "overwrite",
            bridgeId: mixingBridge.id,
            name: mixingBridge.id,
          })
          .then(function (liverecording) {})
          .catch(function (err) {});

        console.log("new bridge created::", mixingBridge.id);
      }
      console.log("initially", mixingBridge.channels);
      await moveToMixingBridge(dialed, mixingBridge);
    } catch (err) {
      console.log(err);
    }
  }

  // handler for new mixing bridge ready for channels to be added to it
  async function moveToMixingBridge(dialed, mixingBridge) {
    try {
      console.log(
        "dialed channel %s added to bridge %s",
        dialed.name,
        mixingBridge.id
      );
      await mixingBridge.addChannel({ channel: dialed.id, absorbDTMF: false });
      console.log("after", mixingBridge.channels);
    } catch (err) {
      console.log("Err:::::::::::::", err);
    }
  }

  // handler for the dialed channel leaving Stasis
  async function dialedExit(dialed, mixingBridge) {
    const bridges = await clientObj.bridges.list();
    let mixingBridgeObj = bridges.find(
      (obj) => obj.bridge_type === "mixing" && obj.id == mixingBridge.id
    );

    if (mixingBridgeObj) {
      mixingBridgeObj.channels.map((val) => {
        clientObj.channels.hangup({ channelId: val }, function (err) {
          console.log(err);
        });
      });
      console.log("channels inside bridge", mixingBridgeObj.channels);
      console.log("destroying bridge");
      mixingBridge.destroy(function (err) {
        if (err) {
          throw err;
        }
      });
    }
  }
};

module.exports = { inviteToBridge };
