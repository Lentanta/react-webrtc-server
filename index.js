const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const http = require("http");

const app = express();
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let device = {};

wss.on('connection', ws => {
  console.log("CONNECTING")
  ws.on('message', msg => {
    const data = JSON.parse(msg);
    data.time = new Date();
    console.log("Data: ", data)

    switch (data.actionType) {

      case "CONNECT":
        device[data.from] = ws;

        ws.send(JSON.stringify({
          from: "server",
          actionType: "OKAY",
          msg: device
        }))
        break;

      case "OFFER":
        if (device["mobile"]) {
          device["mobile"].send(JSON.stringify({
            from: "server",
            actionType: "OFFER",
            offer: data.offer
          }))
        }
        break;


      case "ANSWER":
        if (device["web"]) {
          device["web"].send(JSON.stringify({
            from: "server",
            actionType: "ANSWER",
            answer: data.answer
          }))
        }
        break;

      case "CANDIDATE":
        const sendTo = data.from === "web" ? "mobile" : "web";
        console.log("SEND TO: ", sendTo);
        device[sendTo].send(JSON.stringify({
          from: "server",
          actionType: "CANDIDATE",
          candidate: data.candidate
        }))
        break;
      default:


    }

  })

  ws.send(
    JSON.stringify({
      from: "server",
      msg: "Connect to server success"
    })
  )
})

server.listen(7000, () => {
  console.log('Server started on port 7000')
})