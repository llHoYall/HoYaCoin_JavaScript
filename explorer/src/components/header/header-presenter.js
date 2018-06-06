import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

const TitleLink = styled(Link)`
  color: inherit;
`;

const Title = styled.h1`
  margin: 0;
`;

const HeaderContainer = styled.header`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 50px 20px;
`;

const HeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  max-width: 1000px;
  width: 100%;
`;

const Nav = styled.nav`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex-wrap: wrap;
  width: 70%;
`;

const List = styled.ul`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin: 0;
`;

const ListItem = styled.li`
  margin-right: 50px;
  margin-bottom: 0;
`;

const SLink = styled(Link)`
  text-decoration: none;
  font-weight: 600;
  color: ${props => (props.isActive ? "black" : "#676767")};
`;

const HeaderPresenter = props => {
  console.log(props);
  return (
    <HeaderContainer>
      <HeaderWrapper>
        <Title>
          <TitleLink to="/">HoYa Coin</TitleLink>
        </Title>
        <Nav>
          <List>
            <ListItem>
              <SLink isActive={window.location.pathname === "/"} to="/">
                Home
              </SLink>
            </ListItem>
            <ListItem>
              <SLink
                isActive={window.location.pathname === "/blocks"}
                to="/blocks"
              >
                Blocks
              </SLink>
            </ListItem>
            <ListItem>
              <SLink
                isActive={window.location.pathname === "/transactions"}
                to="/transactions"
              >
                Transactions
              </SLink>
            </ListItem>
          </List>
        </Nav>
      </HeaderWrapper>
    </HeaderContainer>
  );
};

export default HeaderPresenter;
