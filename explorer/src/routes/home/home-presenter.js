import React, { Fragment } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import sum from "lodash.sum";
import { makeDateSexy } from "../../utils";
import {
  Card,
  BlocksHeader,
  BlocksRow,
  TxHeader,
  TxRow
} from "components/shared";

const TableContainer = styled.div`
  margin-top: 50px;
  margin-bottom: 100px;
`;

const HomePresenter = ({ blocks, transactions }) => (
  <Fragment>
    <TableContainer>
      <h2>Latest Blocks</h2>
      <Card>
        <BlocksHeader />
        {blocks.map((block, index) => (
          <BlocksRow
            index={block.index}
            hash={block.hash}
            timestamp={makeDateSexy(block.timestamp)}
            difficulty={block.difficulty}
            key={index}
          />
        ))}
      </Card>
    </TableContainer>
    <TableContainer>
      <h2>Latest Transactions</h2>
      <Card>
        <TxHeader />
        {transactions.map((transaction, index) => (
          <TxRow
            timestamp={makeDateSexy(transaction.timestamp)}
            id={transaction.id}
            ins_outs={`${transaction.tx_ins.length}/${
              transaction.tx_outs.length
            }`}
            amount={sum(transaction.tx_outs.map(tx_out => tx_out.amount))}
            key={index}
          />
        ))}
      </Card>
    </TableContainer>
  </Fragment>
);

HomePresenter.propTypes = {
  blocks: PropTypes.array.isRequired,
  transactions: PropTypes.array.isRequired
};

export default HomePresenter;
