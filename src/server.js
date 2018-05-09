const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const blockchain = require("./blockchain");
const P2P = require("./p2p");

const { getBlockchain, createNewBlock } = blockchain;
const { startP2PServer } = P2P;

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

app.get("/blocks", (req, res) => {
  res.send(getBlockchain());
});

app.post("/blocks", (req, res) => {
  const {
    body: { data }
  } = req;
  const new_block = createNewBlock(data);
  res.send(new_block);
});

const server = app.listen(PORT, () =>
  console.log(`HoYaCoin HTTP server running on ${PORT}`)
);

startP2PServer(server);
