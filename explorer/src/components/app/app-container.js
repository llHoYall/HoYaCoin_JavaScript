import React, { Component } from "react";
import { injectGlobal } from "styled-components";
import reset from "styled-reset";
import typography from "../../typography";
import axios from "axios";
import flatten from "lodash.flatten";
import AppPresenter from "./app-presenter";
import { API_URL, WS_URL } from "../../constants";
import { parseMessage } from "../../utils";

const baseStyles = () => injectGlobal`
    ${reset};
    ${typography};
    a {
      text-decoration: none!important;
    }
`;

class AppContainer extends Component {
  state = {
    is_loading: true
  };

  componentDidMount = () => {
    this._getData();
    this._connectToWS();
  };

  render() {
    baseStyles();
    return <AppPresenter {...this.state} />;
  }

  _getData = async () => {
    const request = await axios.get(`${API_URL}/blocks`);
    const blocks = request.data;
    const reversed_blocks = blocks.reverse();
    const txs = flatten(reversed_blocks.map(block => block.data));
    this.setState({
      blocks: reversed_blocks,
      transactions: txs,
      is_loading: false
    });
  };

  _connectToWS = () => {
    const ws = new WebSocket(WS_URL);
    ws.addEventListener("message", message => {
      const parsed_message = parseMessage(message);
      if (parsed_message !== null && parsed_message !== undefined) {
        this.setState(prev_state => {
          return {
            ...prev_state,
            blocks: [...parsed_message, ...prev_state.blocks],
            transactions: [
              ...parsed_message[0].data,
              ...prev_state.transactions
            ]
          };
        });
      }
    });
  };
}

export default AppContainer;
