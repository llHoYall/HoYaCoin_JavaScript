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

const AppPresenter = () => (
  <BrowserRouter>
    <AppContainer>
      <Header />
      <Main>
        <Switch>
          <Route exact path={`/`} component={Home} />
          <Route exact path={`/blocks`} component={Blocks} />
          <Route exact path={`/transactions`} component={Transactions} />
        </Switch>
      </Main>
    </AppContainer>
  </BrowserRouter>
);

export default AppPresenter;
