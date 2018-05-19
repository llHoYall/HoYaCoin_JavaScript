const CryptoJS = require("crypto-js");
const hexToBinary = require("hex-to-binary");
const _ = require("lodash");
const Wallet = require("./wallet");
const Transactions = require("./transactions");
const Mempool = require("./mempool");

const {
  getBalance,
  getPublicFromWallet,
  getPrivateFromWallet,
  createTx
} = Wallet;
const { createCoinbaseTx, processTxs } = Transactions;
const { addToMempool, getMempool, updateMempool } = Mempool;

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

const genesis_tx = {
  tx_ins: [{ signature: "", tx_out_id: "", tx_out_index: 0 }],
  tx_outs: [
    {
      address:
        "0441b62516da46622f9dcd9e4d716d882a11ab67b7d2c1779407e3b40f77ef4122e69f2b1e6509d4c6ce757f90fd3c495e450bdac230d6c65cf03b1e1d3777adbb",
      amount: 50
    }
  ],
  id: "70e56e0a1b60a19603a34a3ea54568c286da7b6ce3782c0a0a5181366787a3cd"
};

const genesis_block = new Block(
  0,
  "4e2b80dce69a41c3321fddd6661cb8b586af1cd3817a1926357b28554eb57d1d",
  "",
  1526043802,
  [genesis_tx],
  0,
  0
);

let blockchain = [genesis_block];

let utx_outs = processTxs(blockchain[0].data, [], 0);

const getNewestBlock = () => blockchain[blockchain.length - 1];

const getTimestamp = () => Math.round(new Date().getTime() / 1000);

const getBlockchain = () => blockchain;

const createHash = (index, prev_hash, timestamp, data, difficulty, nonce) =>
  CryptoJS.SHA256(
    index + prev_hash + timestamp + JSON.stringify(data) + difficulty + nonce
  ).toString();

const createNewBlock = () => {
  const coinbase_tx = createCoinbaseTx(
    getPublicFromWallet(),
    getNewestBlock().index + 1
  );
  const block_data = [coinbase_tx].concat(getMempool());
  return createNewRawBlock(block_data);
};

const createNewRawBlock = data => {
  const prev_block = getNewestBlock();
  const new_block_index = prev_block.index + 1;
  const new_timestamp = getTimestamp();
  const difficulty = findDifficulty();
  const new_block = findBlock(
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
    blockchain[blockchain.length - DIFFICULTY_ADJUSTMENT_INTERVAL];
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

const isTimeStampValid = (new_block, old_block) => {
  return (
    old_block.timestamp - 60 < new_block.timestamp &&
    new_block.timestamp - 60 < getTimestamp()
  );
};

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
  } else if (!isTimeStampValid(candidate_block, latest_block)) {
    console.log("The timestamp of this block is dodgy");
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
    typeof block.data === "object"
  );
};

const isChainValid = candidate_chain => {
  const isGenesisValid = block => {
    return JSON.stringify(block) === JSON.stringify(genesis_block);
  };
  if (!isGenesisValid(candidate_chain[0])) {
    console.log(
      "The candidate chain's genesis block is not the same as our genesis block"
    );
    return false;
  }

  let foreign_utx_outs = [];

  for (let i = 0; i < candidate_chain.length; i++) {
    const current_block = candidate_chain[i];
    if (i !== 0 && !isBlockValid(current_block, candidate_chain[i - 1])) {
      return null;
    }
    foreign_utx_outs = processTxs(
      current_block.data,
      foreign_utx_outs,
      current_block.index
    );
    if (foreign_utx_outs === null) {
      return null;
    }
  }
  return foreign_utx_outs;
};

const sumDifficulty = any_blockchain =>
  any_blockchain
    .map(block => block.difficulty)
    .map(difficulty => Math.pow(2, difficulty))
    .reduce((a, b) => a + b);

const replaceChain = candidate_chain => {
  const foreign_utx_outs = isChainValid(candidate_chain);
  const valid_chain = foreign_utx_outs !== null;
  if (
    valid_chain &&
    sumDifficulty(candidate_chain) > sumDifficulty(getBlockchain())
  ) {
    blockchain = candidate_chain;
    utx_outs = foreign_utx_outs;
    updateMempool(utx_outs);
    require("./p2p").broadcastNewBlock();
    return true;
  } else {
    return false;
  }
};

const addBlockToChain = candidate_block => {
  if (isBlockValid(candidate_block, getNewestBlock())) {
    const processed_txs = processTxs(
      candidate_block.data,
      utx_outs,
      candidate_block.index
    );
    if (processed_txs === null) {
      console.log("Couldn't process transactions");
      return false;
    } else {
      blockchain.push(candidate_block);
      utx_outs = processed_txs;
      updateMempool(utx_outs);
      return true;
    }
    return true;
  } else {
    return false;
  }
};

const getUTxOutList = () => _.cloneDeep(utx_outs);

const getAccountBalance = () => getBalance(getPublicFromWallet(), utx_outs);

const sendTx = (address, amount) => {
  const tx = createTx(
    address,
    amount,
    getPrivateFromWallet(),
    getUTxOutList(),
    getMempool()
  );
  addToMempool(tx, getUTxOutList());
  require("./p2p").broadcastMempool();
  return tx;
};

const handleIncomingTx = tx => {
  addToMempool(tx, getUTxOutList());
};

module.exports = {
  getBlockchain,
  getNewestBlock,
  createNewBlock,
  isBlockStructureValid,
  addBlockToChain,
  replaceChain,
  getAccountBalance,
  sendTx,
  handleIncomingTx,
  getUTxOutList
};
