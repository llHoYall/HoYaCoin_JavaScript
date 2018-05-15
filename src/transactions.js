const CryptoJS = require("crypto-js");
const EC = require("elliptic").ec;
const utils = require("./utils");

const COINBASE_AMOUNT = 50;

const ec = new EC("secp256k1");

class TxOut {
  constructor(address, amount) {
    this.address = address;
    this.amount = amount;
  }
}

class TxIn {}

class Transaction {}

class UTxOut {
  constructor(tx_out_id, tx_out_index, address, amount) {
    this.tx_out_id = tx_out_id;
    this.tx_out_index = tx_out_index;
    this.address = address;
    this.amount = amount;
  }
}

const getTxId = tx => {
  const tx_in_content = tx.tx_ins
    .map(tx_in => tx_in.utx_out_id + tx_in.utx_out_index)
    .reduce((a, b) => a + b, "");

  const tx_out_content = tx.tx_outs
    .map(tx_out => tx_out.address + tx_out.amount)
    .reduce((a, b) => a + b, "");

  return CryptoJS.SHA256(tx_in_content + tx_out_content).toString();
};

const findUTxOut = (tx_out_id, tx_out_index, utx_out_list) => {
  return utx_out_list.find(
    utx_o =>
      utx_o.tx_out_id === tx_out_id && utx_o.tx_out_index === tx_out_index
  );
};

const signTxIn = (tx, tx_in_index, private_key, utx_out_list) => {
  const tx_in = tx.txIns[tx_in_index];
  const data_to_sign = tx.id;
  const referenced_utx_out = findUTxOut(
    tx_in.tx_out_id,
    tx.tx_out_index,
    utx_out_list
  );
  if (referenced_utx_out === null) {
    return;
  }
  const referenced_address = referenced_utx_out.address;
  if (getPublicKey(private_key) !== referenced_address) {
    return false;
  }
  const key = ec.keyFromPrivate(private_key, "hex");
  const signature = utils.toHexString(key.sign(data_to_sign).toDER());
  return signature;
};

const getPublicKey = private_key => {
  return ec
    .keyFromPrivate(private_key, "hex")
    .getPublic()
    .encode("hex");
};

const updateUTxOuts = (new_txs, utx_out_list) => {
  const new_utx_outs = new_txs
    .map(tx => {
      tx.txOuts.map((tx_out, index) => {
        new UTxOut(tx.id, index, tx_out.address, tx_out.amount);
      });
    })
    .reduce((a, b) => a.concat(b), []);

  const spent_tx_outs = new_txs
    .map(tx => tx.txIns)
    .reduce((a, b) => a.concat(b), [])
    .map(txIn => new UTxOut(txIn.tx_out_id, txIn.tx_out_index, "", 0));

  const resulting_utx_outs = utx_out_list
    .filter(
      utx_o => !findUTxOut(utx_o.tx_out_id, utx_o.tx_out_index, spent_tx_outs)
    )
    .concat(new_utx_outs);

  return resulting_utx_outs;
};

const isTxInStructureValid = tx_in => {
  if (tx_in === null) {
    return false;
  } else if (typeof tx_in.tx_out_id !== "string") {
    return false;
  } else if (typeof tx_in.tx_out_index !== "number") {
    return false;
  } else if (typeof tx_in.signature !== "string") {
    return false;
  } else {
    return true;
  }
};

const isAddressValid = address => {
  if (address.length !== 130) {
    console.log("The address length is not the expected one");
    return false;
  } else if (address.match("^[0-9a-fA-F]+$") === null) {
    console.log("'The address doesn't match the hex patter");
    return false;
  } else if (!address.startsWith("04")) {
    console.log("The address doesn't start with 04");
    return false;
  } else {
    return true;
  }
};

const isTxOutStructureValid = tx_out => {
  if (tx_out === null) {
    return false;
  } else if (typeof tx_out.address !== "string") {
    console.log("The tx_out doesn't have a valid string as address");
    return false;
  } else if (!isAddressValid(tx_out.address)) {
    console.log("Ths tx_out doesn't have a valid address");
    return false;
  } else if (typeof tx_out.amount !== "number") {
    console.log("The tx_out doesn't have a valid amount");
    return false;
  } else {
    return true;
  }
};

const isTxStructureValid = () => {
  if (typeof tx.id !== "string") {
    console.log("Tx ID is not valid");
    return false;
  } else if (!(tx.tx_ins instanceof Array)) {
    console.log("The txIns are not an array");
    return false;
  } else if (
    !tx.tx_ins.map(isTxInStructureValid).reduce((a, b) => a && b, true)
  ) {
    console.log("The structure of one of the txIn is not valid");
    return false;
  } else if (!(tx.tx_outs instanceof Array)) {
    console.log("The txOuts are not an array");
    return false;
  } else if (
    !tx.tx_outs.map(isTxOutStructureValid).reduce((a, b) => a && b, true)
  ) {
    console.log("The structure of one of the txOut is not valid");
    return false;
  } else {
    return true;
  }
};

const validateTxIn = (tx_in, tx, utx_out_list) => {
  const wanted_tx_out = utx_out_list.find(
    utx_o =>
      utx_o.tx_out_id === tx_in.tx_out_id &&
      utx_o.tx_out_index === tx_in.tx_out_index
  );
  if (wanted_tx_out === null) {
    return false;
  } else {
    const address = wanted_tx_out.address;
    const key = ec.keyFromPublic(address, "hex");
    return key.verify(tx.id, tx_in.signature);
  }
};

const getAmountInTxIn = (tx_in, utx_out_list) =>
  findUTxOut(tx_in.tx_out_id, tx_in.tx_out_index, utx_out_list).amount;

const validateTx = (tx, utx_out_list) => {
  if (!isTxStructureValid(tx)) {
    return false;
  }

  if (getTxId(tx) !== tx.id) {
    return false;
  }

  const has_valid_tx_ins = tx.tx_ins.map(tx_in =>
    validateTxIn(tx_in, tx, utx_out_list)
  );

  if (!has_valid_tx_ins) {
    return false;
  }

  const amount_in_tx_ins = tx.tx_ins
    .map(tx_in => getAmountInTxIn(tx_in, utx_out_list))
    .reduce((a, b) => a + b, 0);

  const amount_in_tx_outs = tx.tx_outs
    .map(tx_out => tx_out.amount)
    .reduce((a, b) => a + b, 0);

  if (amount_in_tx_ins !== amount_in_tx_outs) {
    return false;
  } else {
    return true;
  }
};

const validateCoinbaseTx = (tx, block_index) => {
  if (getTxId(tx) !== tx.id) {
    console.log("Invalid coinbase tx id");
    return false;
  } else if (tx.tx_ins.length !== 1) {
    console.log("Coinbase tx should only have one input");
    return false;
  } else if (tx.tx_ins[0].tx_out_index !== block_index) {
    console.log(
      "The tx_out_index of the coinbase tx should be the same as the block_index"
    );
    return false;
  } else if (tx.tx_outs.length !== 1) {
    console.log("Coinbase tx should only have one output");
    return false;
  } else if (tx.tx_outs[0].amount !== COINBASE_AMOUNT) {
    console.log(
      `Coinbase tx should have an amount of only ${COINBASE_AMOUNT} and it has ${
        tx.tx_outs[0].amount
      }`
    );
    return false;
  } else {
    return true;
  }
};

const createCoinbaseTx = (address, block_index) => {
  const tx = new Transaction();
  const tx_in = new TxIn();
  tx_in.signature = "";
  tx_in.tx_out_id = block_index;
  tx.tx_ins = [tx_in];
  tx.tx_outs = [new TxOut(address, COINBASE_AMOUNT)];
  tx.id = getTxId(tx);
  return tx;
};

module.exports = {
  getPublicKey,
  getTxId,
  signTxIn,
  TxIn,
  Transaction,
  TxOut,
  createCoinbaseTx
};
