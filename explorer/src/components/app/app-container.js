import React, { Component } from "react";
import { injectGlobal } from "styled-components";
import reset from "styled-reset";
import typography from "../../typography";
import AppPresenter from "./app-presenter";

const baseStyles = () => injectGlobal`
    ${reset};
    ${typography};
    a {
      text-decoration: none!important;
    }
`;

class AppContainer extends Component {
  render() {
    baseStyles();
    return <AppPresenter />;
  }
}

export default AppContainer;
