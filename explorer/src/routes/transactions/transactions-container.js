import React, { Component } from "react";
import PropTypes from "prop-types";
import TransactionsPresenter from "./transactions-presenter";

class TransactionsContainer extends Component {
  render() {
    return <TransactionsPresenter />;
  }
}

TransactionsContainer.propTypes = {
  transactions: PropTypes.array.isRequired
};

export default TransactionsContainer;
