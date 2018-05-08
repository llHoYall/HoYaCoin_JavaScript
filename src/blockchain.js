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

let blockChain = [genesisBlocl];
