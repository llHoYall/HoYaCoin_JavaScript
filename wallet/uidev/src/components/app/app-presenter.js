import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { Card, Key, KeyName, Title, Button } from "../shared";

const AppContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  height: 100vh;
  background-color: #f2f6fa;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 90%;
  margin: 50px 0;
`;

const SendTxForm = styled.form`
  margin-top: 25px;
`;

const Submit = Button.withComponent("input").extend`
  margin-right: 10px;
  border: 2px solid #305371;
  box-shadow: none;
  &:hover {
    box-shadow: none;
    transform: none;
  }
  &:disabled {
    color: #999;
    border: 2px solid #999;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const Input = Submit.extend`
  width: 200px;
  padding-left: 10px;
  color: ${props => (props.hasError ? "#e74c3c" : "inherit")};
  border-color: ${props => (props.hasError ? "#e74c3c" : "inherit")};
  &:active {
    background-color: transparent;
  }
`;

const AppPresenter = ({
  is_loading,
  address = "",
  balance = "",
  mineBlock,
  is_mining,
  to_address = "",
  amount = 0,
  handleInput,
  handleSubmit
}) => (
  <AppContainer>
    <Header>
      <Title>{is_loading ? "Loading..." : "HoYaCoin Wallet"}</Title>
      <Button disabled={is_mining} onClick={mineBlock}>
        {is_mining ? "Mining" : "Mine"}
      </Button>
    </Header>
    <Card>
      <Key>
        <KeyName>Your Address:</KeyName> {address}
      </Key>
      <Key>
        <KeyName>Your Balance:</KeyName> {balance} HYC
      </Key>
    </Card>
    <Card>
      <Key>Send HYC: </Key>
      <SendTxForm onSubmit={handleSubmit}>
        <Input
          placeholder={"Address"}
          required
          name="to_address"
          value={to_address}
          type={"text"}
          onChange={handleInput}
        />
        <Input
          placeholder={"Amount"}
          required
          name="amount"
          type={"number"}
          value={amount || ""}
          onChange={handleInput}
          max={balance}
        />
        <Submit
          value={"Send"}
          type={"submit"}
          readOnly
          disabled={!to_address || !amount}
        />
      </SendTxForm>
    </Card>
  </AppContainer>
);

AppPresenter.propTypes = {
  is_loading: PropTypes.bool.isRequired,
  address: PropTypes.string,
  balance: PropTypes.number,
  mineBlock: PropTypes.func.isRequired,
  is_mining: PropTypes.bool.isRequired,
  to_address: PropTypes.string.isRequired,
  amount: PropTypes.string.isRequired,
  handleInput: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired
};

export default AppPresenter;
