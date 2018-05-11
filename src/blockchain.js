const CryptoJS = require("crypto-js");
const hexToBinary = require("hex-to-binary");

const BLOCK_GENERATION_INTERVAL = 10;
const DIFFICULTY_ADJUSTMENT_INTERVAL = 10;

class Block {
  constructor(index, hash, prev_hash, timestamp, data, difficulty, nonce) {
    this.index = index;
    this.hash = hash;
    this.prev_hash = prev_hash;
    this.timestamp = timestamp;
    this.data = data;
    this.difficulty = difficulty;
    this.nonce = nonce;
  }
}

const genesisBlock = new Block(
  0,
  "4DF9140CE289EF9596AFA964C082633D1AC84F2C7EA83F2C8E70FDD6160B8FC1",
  null,
  1525783768553,
  "This is a genesis block.",
  0,
  0
);

let blockchain = [genesisBlock];

const getNewestBlock = () => blockchain[blockchain.length - 1];

const getBlockchain = () => blockchain;

const getTimestamp = () => new Date().getTime() / 1000;

const createHash = (index, prev_hash, timestamp, data, difficulty, nonce) =>
  CryptoJS.SHA256(
    index + prev_hash + timestamp + JSON.stringify(data) + difficulty + nonce
  ).toString();

const createNewBlock = data => {
  const prev_block = getNewestBlock();
  const new_block_index = prev_block.index + 1;
  const new_timestamp = getTimestamp();
  const difficulty = findDifficulty();
  const new_block = new Block(
    new_block_index,
    prev_block.hash,
    new_timestamp,
    data,
    difficulty
  );
  addBlockToChain(new_block);
  require("./p2p").broadcastNewBlock();
  return new_block;
};

const findDifficulty = () => {
  const newest_block = getNewestBlock();
  if (
    newest_block.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 &&
    newest_block.index !== 0
  ) {
    return calculateNewDifficulty(newest_block, getBlockchain());
  } else {
    return newest_block.difficulty;
  }
};

const calculateNewDifficulty = (newest_block, blockchain) => {
  const last_calculated_block =
    blockchain[blockchain.lenth - DIFFICULTY_ADJUSTMENT_INTERVAL];
  const timeExpected =
    BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;
  const timeTaken = newest_block.timestamp - last_calculated_block.timestamp;
  if (timeTaken < timeExpected / 2) {
    return last_calculated_block.difficulty + 1;
  } else if (timeTaken > timeExpected * 2) {
    return last_calculated_block.difficulty - 1;
  } else {
    return last_calculated_block.difficulty;
  }
};

const findBlock = (index, prev_hash, timestamp, data, difficulty) => {
  let nonce = 0;
  while (true) {
    const hash = createHash(
      index,
      prev_hash,
      timestamp,
      data,
      difficulty,
      nonce
    );
    if (hashMatchesDifficulty(hash, difficulty)) {
      return new Block(
        index,
        hash,
        prev_hash,
        timestamp,
        data,
        difficulty,
        nonce
      );
    } else {
      nonce++;
    }
  }
};

const hashMatchesDifficulty = (hash, difficulty) => {
  const hash_in_binary = hexToBinary(hash);
  const required_zeros = "0".repeat(difficulty);
  return hash_in_binary.startsWith(required_zeros);
};

const getBlockHash = block =>
  createHash(
    block.index,
    block.prev_hash,
    block.timestamp,
    block.data,
    block.difficulty,
    block.nonce
  );

const isBlockValid = (candidate_block, latest_block) => {
  if (!isBlockStructureValid(candidate_block)) {
    console.log("The candidate block structure is not valid");
    return false;
  } else if (candidate_block.index !== latest_block.index + 1) {
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

const isBlockStructureValid = block => {
  return (
    typeof block.index === "number" &&
    typeof block.hash === "string" &&
    typeof block.prev_hash === "string" &&
    typeof block.timestamp === "number" &&
    typeof block.data === "string"
  );
};

const isChainValid = candidate_chain => {
  const isGenesisValid = block => {
    return JSON.stringify(block) === JSON.stringify(genesisBlock);
  };
  if (!isGenesisValid(candidate_chain[0])) {
    console.log(
      "The candidate chain's genesis block is not the same as our genesis block"
    );
    return false;
  }
  for (let i = 1; i < candidate_chain.length; i++) {
    if (!isBlockValid(candidate_chain[i], candidate_chain[i - 1])) {
      return false;
    }
  }
  return true;
};

const replaceChain = candidate_chain => {
  if (
    isChainValid(candidate_chain) &&
    candidate_chain.length > getBlockchain().length
  ) {
    getBlockchain = candidate_chain;
    return true;
  }
  return false;
};

const addBlockToChain = candidate_block => {
  if (isBlockValid(candidate_block, getNewestBlock())) {
    getBlockchain().push(candidate_block);
    return true;
  }
  return false;
};

module.exports = {
  getBlockchain,
  getNewestBlock,
  createNewBlock,
  isBlockStructureValid,
  addBlockToChain,
  replaceChain
};
