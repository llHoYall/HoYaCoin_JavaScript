const CryptoJS = require("crypto-js");

class Block {
  constructor(index, hash, prev_hash, timestamp, data) {
    this.index = index;
    this.hash = hash;
    this.prev_hash = prev_hash;
    this.timestamp = timestamp;
    this.data = data;
  }
}

const genesisBlock = new Block(
  0,
  "4DF9140CE289EF9596AFA964C082633D1AC84F2C7EA83F2C8E70FDD6160B8FC1",
  null,
  1525783768553,
  "This is a genesis block."
);

let blockchain = [genesisBlocl];

const getLastBlock = () => blockchain[blockchain.length - 1];

const getTimestamp = () => new Date().getTime() / 1000;

const createHash = (index, prev_hash, timestamp, data) =>
  CryptoJS.SHA256(index + prev_hash + timestamp + JSON.stringify(data).toString();

const createNewBlock = data => {
  const prev_block = getLastBlock();
  const new_block_index = prev_block.index + 1;
  const new_timestamp = getTimestamp();
  const new_hash = createHash(
    new_block_index,
    prev_block.hash,
    new_timestamp,
    data
  );
  const new_block = new Block(
    new_block_index,
    new_hash,
    prev_block.hash,
    new_timestamp,
    data
  );
  return new_block;
};

const getBlockHash = block =>
  createHash(block.index, block.prev_hash, block.timestamp, block.data);

const isNewBlockValid = (candidate_block, latest_block) => {
  if (candidate_block.index !== latest_block.index + 1) {
    console.log("The candidate block doesn't have a valid index");
    return false;
  } else if (candidate_block.prev_hash !== latest_block.hash) {
    console.log(
      "The previous hash of the candidate block isn't the hash of the latest block"
    );
    return false;
  } else if (candidate_block.hash !== getBlockHash(candidate_block)) {
    console.log("The hash of this block is invalid");
    return false;
  }
  return true;
};

const isNewStructureValid = block => {
  return (
    typeof block.index === "number" &&
    typeof block.hash === "string" &&
    typeof block.prev_hash === "string" &&
    typeof block.timestamp === "number" &&
    typeof block.data === "string"
  );
};
