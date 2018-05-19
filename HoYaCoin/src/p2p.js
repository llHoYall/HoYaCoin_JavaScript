const WebSockets = require("ws");
const Blokchain = require("./blockchain");
const Mempool = require("./mempool");

const {
  getNewestBlock,
  isBlockStructureValid,
  replaceChain,
  getBlockchain,
  addBlockToChain,
  handleIncomingTx
} = Blokchain;
const { getMempool } = Mempool;

// Message Types
const GET_LATEST = "GET_LATEST";
const GET_ALL = "GET_ALL";
const BLOCKCHAIN_RSP = "BLOCKCHAIN_RSP";
const REQUEST_MEMPOOL = "REQUEST_MEMPOOL";
const MEMPOOL_RESPONSE = "MEMPOOL_RESPONSE";

const sockets = [];

// Message Creators
const getLatest = () => {
  return {
    type: GET_LATEST,
    data: null
  };
};

const getAll = () => {
  return {
    type: GET_ALL,
    data: null
  };
};

const blockchainResponse = data => {
  return {
    type: BLOCKCHAIN_RSP,
    data
  };
};

const getAllMempool = () => {
  return {
    type: REQUEST_MEMPOOL,
    data: null
  };
};

const mempoolResponse = data => {
  return {
    type: MEMPOOL_RESPONSE,
    data
  };
};

const getSockets = () => sockets;

const startP2PServer = server => {
  const ws_server = new WebSockets.Server({ server });
  ws_server.on("connection", ws => {
    initSocketConnection(ws);
  });
  ws_server.on("error", () => {
    console.log("error");
  });
  console.log("HoYaCoin P2P server running");
};

const initSocketConnection = ws => {
  sockets.push(ws);
  handleSocketMessage(ws);
  handleSocketError(ws);
  sendMessage(ws, getLatest());
  setTimeout(() => {
    sendMessageToAll(ws, getAllMempool());
  }, 1000);
  setInterval(() => {
    if (sockets.includes(ws)) {
      sendMessage(ws, "");
    }
  }, 1000);
};

const parseData = data => {
  try {
    return JSON.parse(data);
  } catch (e) {
    console.log(e);
    return null;
  }
};

const handleSocketMessage = ws => {
  ws.on("message", data => {
    const message = parseData(data);
    if (message === null) {
      return;
    }
    switch (message.type) {
      case GET_LATEST:
        sendMessage(ws, responseLatest());
        break;
      case GET_ALL:
        sendMessage(ws, responseAll());
        break;
      case BLOCKCHAIN_RSP:
        const received_block = message.data;
        if (received_block === null) {
          break;
        }
        handleBlockchainResponse(received_block);
        break;
      case REQUEST_MEMPOOL:
        sendMessage(ws, returnMempool());
        break;
      case MEMPOOL_RESPONSE:
        const received_txs = message.data;
        if (received_txs === null) {
          return;
        }
        received_txs.forEach(tx => {
          try {
            handleIncomingTx(tx);
          } catch (e) {
            console.log(e);
          }
        });
        break;
    }
  });
};

const returnMempool = () => mempoolResponse(getMempool());

const sendMessage = (ws, message) => ws.send(JSON.stringify(message));

const sendMessageToAll = message => {
  sockets.forEach(ws => sendMessage(ws, message));
};

const handleBlockchainResponse = received_block => {
  if (received_block.length === 0) {
    console.log("Receive an empty block");
    return;
  }
  const latest_received_block = received_block[received_block.length - 1];
  if (!isBlockStructureValid(latest_received_block)) {
    console.log("The block structure of the received block is not valid");
    return;
  }
  const newest_block = getNewestBlock();
  if (latest_received_block.index > newest_block.index) {
    if (latest_received_block.prev_hash === newest_block.hash) {
      if (addBlockToChain(latest_received_block)) {
        broadcastNewBlock();
      }
    } else if (received_block.length === 1) {
      sendMessageToAll(getAll());
    } else {
      replaceChain(received_block);
    }
  }
};

const responseLatest = () => blockchainResponse([getNewestBlock()]);

const responseAll = () => blockchainResponse(getBlockchain());

const broadcastNewBlock = () => sendMessageToAll(responseLatest());

const broadcastMempool = () => sendMessageToAll(returnMempool());

const handleSocketError = ws => {
  const closeSocketConnection = ws => {
    ws.close();
    sockets.splice(sockets.indexOf(ws), 1);
  };
  ws.on("close", () => closeSocketConnection(ws));
  ws.on("error", () => closeSocketConnection(ws));
};

const connectToPeers = new_peer => {
  const ws = new WebSockets(new_peer);
  ws.on("open", () => {
    initSocketConnection(ws);
  });
  ws.on("close", () => console.log("Connection failed"));
  ws.on("error", () => console.log("Connection failed"));
};

module.exports = {
  startP2PServer,
  connectToPeers,
  broadcastNewBlock,
  broadcastMempool
};
