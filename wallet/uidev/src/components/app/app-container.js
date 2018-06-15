import React, { Component } from "react";
import PropTypes from "prop-types";
import { injectGlobal } from "styled-components";
import reset from "styled-reset";
import axios from "axios";
import typography from "../../typography";
import AppPresenter from "./app-presenter";
import { MASTER_NODE, SELF_NODE, SELF_P2P_NODE } from "../../constants";

const baseStyles = () => injectGlobal`
  ${reset};
  ${typography};
  h1, h2, h3, h4 {
    margin-bottom: 0!important
  }
`;

class AppContainer extends Component {
  state = {
    is_loading: true,
    is_mining: false,
    to_address: "",
    amount: "0"
  };

  static propTypes = {
    shared_port: PropTypes.number.isRequired
  };

  componentDidMount = () => {
    const { shared_port } = this.props;
    this._registerOnMaster(shared_port);
    this._getBalance(shared_port);
    this._getAddress(shared_port);
    setInterval(this._getBalance(shared_port), 1000);
  };

  render() {
    baseStyles();
    return (
      <AppPresenter
        {...this.state}
        mineBlock={this._mineBlock}
        handleInput={this._handleInput}
        handleSubmit={this._handleSubmit}
      />
    );
  }

  _registerOnMaster = async port => {
    const request = await axios.post(`${MASTER_NODE}/peers`, {
      peer: SELF_P2P_NODE(port)
    });
  };

  _getAddress = async port => {
    const request = await axios.get(`${SELF_NODE(port)}/me/address`);
    this.setState({
      address: request.data,
      is_loading: false
    });
  };

  _getBalance = async port => {
    const request = await axios.get(`${SELF_NODE(port)}/me/balance`);
    const { balance } = request.data;
    this.setState({
      balance
    });
  };

  _mineBlock = async () => {
    const { shared_port } = this.props;
    this.setState({
      is_mining: true
    });
    const request = await axios.post(`${SELF_NODE(shared_port)}/blocks`);
    this.setState({
      is_mining: false
    });
  };

  _handleInput = e => {
    const {
      target: { name, value }
    } = e;
    this.setState({
      [name]: value
    });
  };

  _handleSubmit = async e => {
    e.preventDefault();
    const { shared_port } = this.props;
    const { amount, to_address } = this.state;
    const request = await axios.post(`${SELF_NODE(shared_port)}/transactions`, {
      amount: Number(amount),
      address: to_address
    });
    this.setState({
      amount: "",
      to_address: ""
    });
  };
}

export default AppContainer;
