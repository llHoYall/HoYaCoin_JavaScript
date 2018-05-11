const WebSockets = require("ws");
const Blokchain = require("./blockchain");

const {
  getBlockchain,
  getNewestBlock,
  isBlockStructureValid,
  addBlockToChain,
  replaceChain
} = Blokchain;

// Message Types
const GET_LATEST = "GET_LATEST";
const GET_ALL = "GET_ALL";
const BLOCKCHAIN_RSP = "BLOCKCHAIN_RSP";

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

const sockets = [];

const getSockets = () => sockets;

const startP2PServer = server => {
  const ws_server = new WebSockets.Server({ server });
  ws_server.on("connection", ws => {
    initSocketConnection(ws);
  });
  console.log("HoYaCoin P2P server running");
};

const initSocketConnection = ws => {
  sockets.push(ws);
  handleSocketMessage(ws);
  handleSocketError(ws);
  sendMessage(ws, getLatest());
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
    }
  });
};

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
};

module.exports = {
  startP2PServer,
  connectToPeers,
  broadcastNewBlock
};
