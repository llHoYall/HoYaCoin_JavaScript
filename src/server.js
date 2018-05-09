const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const blockchain = require("./blockchain");

const { getBlockchain, createNewBlock } = blockchain;

const PORT = 3000;

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

app.listen(PORT, () => console.log(`HoYaCoin server running on ${PORT}`));