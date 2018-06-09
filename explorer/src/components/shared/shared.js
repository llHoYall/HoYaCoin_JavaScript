import React from "react";
import styled from "styled-components";

export const Card = styled.div`
  width: 100%;
  min-height: 50vh;
  margin-bottom: 50px;
  border-radius: 10px;
  padding: 10px;
  background-color: white;
  box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
  &:last-child {
    margin-bottom: 0;
  }
`;

export const Header = styled.div`
  font-weight: 600;
`;

export const RowContainer = styled.div`
  display: flex;
  justify-content: space-between;
  & * {
    width: 15%;
    text-align: center;
    margin-bottom: 15px;
  }
  & *:nth-child(2) {
    width: 40%;
  }
`;

export const Cell = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 10px 0;
  line-height: 2;
  white-space: nowrap;
`;

export const BlocksHeader = () => (
  <Header>
    <RowContainer>
      <Cell>Index</Cell>
      <Cell>Hash</Cell>
      <Cell>Timestamp</Cell>
      <Cell>Difficulty</Cell>
    </RowContainer>
  </Header>
);

export const TxHeader = () => (
  <Header>
    <RowContainer>
      <Cell>Amount</Cell>
      <Cell>ID</Cell>
      <Cell>Ins/Outs</Cell>
    </RowContainer>
  </Header>
);

export const BlocksRow = ({ index, hash, timestamp, difficulty }) => (
  <RowContainer>
    <Cell>{index}</Cell>
    <Cell>{hash}</Cell>
    <Cell>{timestamp}</Cell>
    <Cell>{difficulty}</Cell>
  </RowContainer>
);

export const TxRow = ({ timestamp, id, ins_outs, amount }) => (
  <RowContainer>
    <Cell>{amount}</Cell>
    <Cell>{id}</Cell>
    <Cell>{ins_outs}</Cell>
  </RowContainer>
);
