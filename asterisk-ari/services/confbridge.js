/*jshint node:true*/
"use strict";
var ari = require("ari-client");
var clientObj, holdingBridge;

// following details you can find from /etc/asterisk/ari.conf and /etc/asterisk/http.conf
ari.connect("http://localhost:8088", "asterisk", "asterisk", clientLoaded);

// handler for client being loaded
function clientLoaded(err, client) {
  if (err) {
    throw err;
  }
  client.start("ari-test");
  clientObj = client;
}

function getClientObj() {
  return clientObj;
}

module.exports = {
  holdingBridge,
  getClientObj
};
