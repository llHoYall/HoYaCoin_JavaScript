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

const SLink = styled.span`
  text-decoration: none;
  font-weight: 600;
  color: ${props => (props.isActive ? "black" : "#676767")};
`;

const HeaderPresenter = props => {
  return (
    <HeaderContainer>
      <HeaderWrapper>
        <Title>
          <TitleLink to="/">HoYa Coin</TitleLink>
        </Title>
        <Nav>
          <List>
            <ListItem>
              <Link to="/">
                <SLink isActive={window.location.pathname === "/"}>Home</SLink>
              </Link>
            </ListItem>
            <ListItem>
              <Link to="/blocks">
                <SLink isActive={window.location.pathname === "/blocks"}>
                  Blocks
                </SLink>
              </Link>
            </ListItem>
            <ListItem>
              <Link to="/transactions">
                <SLink isActive={window.location.pathname === "/transactions"}>
                  Transactions
                </SLink>
              </Link>
            </ListItem>
          </List>
        </Nav>
      </HeaderWrapper>
    </HeaderContainer>
  );
};

export default HeaderPresenter;
