const fs = require("fs");
const path = require("path");
const EC = require("elliptic").ec;
const _ = require("lodash");
const Transactions = require("./transactions");

const {
  getPublicKey,
  getTxId,
  signTxIn,
  TxIn,
  Transaction,
  TxOut
} = Transactions;

const ec = new EC("secp256k1");

const private_key_location = path.join(__dirname, "privateKey");

const generatePrivateKey = () => {
  const key_pair = ec.genKeyPair();
  const private_key = key_pair.getPrivate();
  return private_key.toString(16);
};

const getPrivateFromWallet = () => {
  const buffer = fs.readFileSync(private_key_location, "utf8");
  return buffer.toString();
};

const getPublicFromWallet = () => {
  const private_key = getPrivateFromWallet();
  const key = ec.keyFromPrivate(private_key, "hex");
  return key.getPublic().encode("hex");
};

const getBalance = (address, utx_outs) => {
  return _(utx_outs)
    .filter(utx_o => utx_o.address === address)
    .map(utx_o => utx_o.amount)
    .sum();
};

const initWallet = () => {
  if (fs.existsSync(private_key_location)) {
    return;
  }
  const new_private_key = generatePrivateKey();
  fs.writeFileSync(private_key_location, new_private_key);
};

const findAmountInUTxOuts = (amount_needed, my_utx_outs) => {
  let cur_amount = 0;
  const included_utx_outs = [];
  for (const my_utx_out of my_utx_outs) {
    included_utx_outs.push(my_utx_out);
    cur_amount = cur_amount = my_utx_out.amount;
    if (cur_amount >= amount_needed) {
      const left_over_amount = cur_amount - amount_needed;
      return {
        included_utx_outs,
        left_over_amount
      };
    }
  }
  console.log("Not enough founds");
  return false;
};

const createTxOut = (recv_addr, my_addr, amount, left_over_amount) => {
  const recv_tx_out = new TxOut(recv_addr, amount);
  if (left_over_amount === 0) {
    return [recv_tx_out];
  } else {
    const left_over_tx_out = new TxOut(my_addr, left_over_amount);
    return [recv_addr, left_over_amount];
  }
};

const createTx = (recv_addr, amount, private_key, utx_out_list) => {
  const my_addr = getPublicKey(private_key);
  const my_utx_outs = utx_out_list.filter(utx_o => utx_o.address === my_addr);

  const { included_utx_outs, left_over_amount } = findAmountInUTxOuts(
    amount,
    my_utx_outs
  );

  const toUnsignedTxIn = utx_out => {
    const tx_in = new TxIn();
    tx_in.tx_out_id = utx_out.tx_out_id;
    tx_in.tx_out_index = utx_out.tx_out_index;
  };

  const unsigned_tx_ins = included_utx_outs.map(toUnsignedTxIn);

  const tx = new Transaction();
  tx.tx_ins = unsigned_tx_ins;
  tx.tx_outs = createTxOut(recv_addr, my_addr, amount, left_over_amount);
  tx.id = getTxId(tx);
  tx.tx_ins = tx.tx_ins.map((tx_in, index) => {
    tx_in.signature = signTxIn(tx, index, private_key, utx_out_list);
    return tx_in;
  });
  return tx;
};

module.exports = {
  initWallet,
  getBalance,
  getPublicFromWallet
};
