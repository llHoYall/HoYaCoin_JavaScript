const express = require("express"),
  bodyParser = require("body-parser"),
  morgan = require("morgan"),
  _ = require("lodash"),
  cors = require("cors"),
  blockchain = require("./blockchain"),
  P2P = require("./p2p"),
  Wallet = require("./wallet"),
  Mempool = require("./mempool");

const {
  getBlockchain,
  createNewBlock,
  getAccountBalance,
  sendTx,
  getUTxOutList
} = blockchain;
const { startP2PServer, connectToPeers } = P2P;
const { initWallet, getPublicFromWallet, getBalance } = Wallet;
const { getMempool } = Mempool;

// MAC, Linux
// $ export HTTP_PORT = 7000
// Windows (CMD)
// $ set HTTP_PORT=7000
// Windows (PowerShell)
// $ $env:HTTP_PORT = 7000
const PORT = process.env.HTTP_PORT || 3000;

const app = express();

app.use(bodyParser.json());
app.use(cors());
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

app.get("/blocks/:hash", (req, res) => {
  const {
    params: { hash }
  } = req;
  const block = _.find(getBlockchain(), { hash });
  if (block === undefined) {
    res.status(400).send("Block not found");
  } else {
    res.send(block);
  }
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

app.get("/me/address", (req, res) => {
  res.send(getPublicFromWallet());
});

app
  .route("/transactions")
  .get((req, res) => {
    res.send(getMempool());
  })
  .post((req, res) => {
    try {
      const {
        body: { address, amount }
      } = req;
      if (address === undefined || amount == undefined) {
        throw Error("Please specify address and an amount.");
      } else {
        const rsp = sendTx(address, amount);
        res.send(rsp);
      }
    } catch (e) {
      res.status(400).send(e.message);
    }
  });

app.get("transactions/:id", (req, res) => {
  const tx = _(getBlockchain())
    .map(blocks => blocks.data)
    .flatten()
    .find({
      id: req.params.id
    });
  if (tx === undefined) {
    res.status(400).send("Transaction not found");
  }
  res.send(tx);
});

app.get("/address/:address", (req, res) => {
  const {
    params: { address }
  } = req;
  const balance = getBalance(address, getUTxOutList());
  res.send({ balance });
});

const server = app.listen(PORT, () =>
  console.log(`HoYaCoin HTTP server running on ${PORT}`)
);

initWallet();
startP2PServer(server);
