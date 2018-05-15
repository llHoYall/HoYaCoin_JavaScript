const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const blockchain = require("./blockchain");
const P2P = require("./p2p");
const Wallet = require("./wallet");

const { getBlockchain, createNewBlock, getAccountBalance } = blockchain;
const { startP2PServer, connectToPeers } = P2P;
const { initWallet } = Wallet;

// MAC, Linux
// $ export HTTP_PORT = 7000
// Windows (CMD)
// $ set HTTP_PORT=7000
// Windows (PowerShell)
// $ $env:HTTP_PORT = 7000
const PORT = process.env.HTTP_PORT || 3000;

const app = express();

app.use(bodyParser.json());
app.use(morgan("combined"));

app
  .route("/blocks")
  .get((req, res) => {
    res.send(getBlockchain());
  })
  .post((req, res) => {
    const new_block = createNewBlock();
    res.send(new_block);
  });

app.post("/peers", (req, res) => {
  const {
    body: { peer }
  } = req;
  connectToPeers(peer);
  res.send();
});

app.get("/me/balance", (req, res) => {
  const balance = getAccountBalance();
  res.send({ balance });
});

const server = app.listen(PORT, () =>
  console.log(`HoYaCoin HTTP server running on ${PORT}`)
);

initWallet();
startP2PServer(server);
