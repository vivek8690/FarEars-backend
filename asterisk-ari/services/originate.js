const { getClientObj, holdingBridge } = require("./confbridge");

const inviteToBridge = async function (inviteTo, inviteIn, from) {
  const clientObj = getClientObj();
  try {
    console.log("inviteTo", inviteTo);
    console.log("inviteIn", inviteIn);
    // create a new channel
    var dialed = clientObj.Channel();
    const bridges = await clientObj.bridges.list();
    let mixingBridge = bridges.find(
      (obj) => obj.bridge_type === "mixing" && obj.id == inviteIn
    );
    if (mixingBridge) {
      await clientObj.bridges.destroy({ bridgeId: inviteIn });
    }

    dialed.on("StasisStart", function (event, dialed) {
      joinMixingBridge(inviteIn, dialed);
      dialed.on("ChannelDtmfReceived", dtmfReceived);
    });

    dialed.originate(
      {
        endpoint: `PJSIP/${inviteTo}`,
        app: "ari-test",
        appArgs: "dialed",
        callerId: "Walkie-talkie",
        context: "testing",
      },
      function (err, dialed) {
        if (err) {
          console.log("dialed extension is not registered in asterisk",err);
        }
      }
    );
  } catch (err) {
    console.log(err);
    throw err;
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

      if (inviteTo === from) {
        dialed.on("ChannelDestroyed", function (event, dialed) {
          dialedExit(dialed, mixingBridge);
        });
      }

      dialed.answer(function (err) {
        if (err) {
          throw err;
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
