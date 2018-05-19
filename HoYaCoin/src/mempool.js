const _ = require("lodash");
const Transactions = require("./transactions");

const { validateTx } = Transactions;

let mempool = [];

const getMempool = () => _.cloneDeep(mempool);

const getTxInsInPool = mempool => {
  return _(mempool)
    .map(tx => tx.tx_ins)
    .flatten()
    .value();
};

const isTxValidForPool = (tx, mempool) => {
  const tx_ins_in_pool = getTxInsInPool(mempool);

  const isTxInAlreadyInPool = (tx_ins, tx_in) => {
    return _.find(tx_ins, tx_in_in_pool => {
      return (
        tx_in.tx_out_id === tx_in_in_pool.tx_out_id &&
        tx_in.tx_out_index === tx_in_in_pool.tx_out_index
      );
    });
  };

  for (const tx_in of tx.tx_ins) {
    if (isTxInAlreadyInPool(tx_ins_in_pool, tx_in)) {
      return false;
    }
  }
  return true;
};

const hasTxIn = (tx_in, utx_out_list) => {
  const found_tx_in = utx_out_list.find(
    utx_o =>
      utx_o.tx_out_id === tx_in.tx_out_id &&
      utx_o.tx_out_index === tx_in.tx_out_index
  );
  return found_tx_in !== undefined;
};

const updateMempool = utx_out_list => {
  const invalid_txs = [];

  for (const tx of mempool) {
    for (const tx_in of tx.tx_ins) {
      if (!hasTxIn(tx_in, utx_out_list)) {
        invalid_txs.push(tx);
        break;
      }
    }
  }

  if (invalid_txs.length > 0) {
    mempool = _.without(mempool, ...invalid_txs);
  }
};

const addToMempool = (tx, utx_out_list) => {
  if (!validateTx(tx, utx_out_list)) {
    throw Error("This transaction is invalid. Will not add it to pool.");
  } else if (!isTxValidForPool(tx, mempool)) {
    throw Error("This transaction is not valid for the pool. Will not add it.");
  }
  mempool.push(tx);
};

module.exports = {
  addToMempool,
  getMempool,
  updateMempool
};
