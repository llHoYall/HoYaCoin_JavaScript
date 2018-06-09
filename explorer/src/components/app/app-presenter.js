import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import PropTypes from "prop-types";
import styled from "styled-components";
import Header from "components/header";
import Home from "routes/home";
import Blocks from "routes/blocks";
import Transactions from "routes/transactions";

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background-color: #fafafa;
`;

const Main = styled.main`
  max-width: 1000px;
  width: 100%;
  @media screen and (max-width: 600px) {
    width: 95%;
  }
`;

const AppPresenter = ({ is_loading, transactions, blocks }) => (
  <BrowserRouter>
    <AppContainer>
      <Header />
      {!is_loading && (
        <Main>
          <Switch>
            <Route
              exact
              path={`/`}
              render={() => (
                <Home
                  blocks={blocks.slice(0, 5)}
                  transactions={transactions.slice(0, 5)}
                />
              )}
            />
            <Route
              exact
              path={`/blocks`}
              render={() => <Blocks blocks={blocks} />}
            />
            <Route
              exact
              path={`/transactions`}
              render={() => <Transactions transactions={transactions} />}
            />
          </Switch>
        </Main>
      )}
    </AppContainer>
  </BrowserRouter>
);

AppPresenter.propTypes = {
  is_loading: PropTypes.bool.isRequired,
  transactions: PropTypes.array,
  blocks: PropTypes.array
};

export default AppPresenter;
