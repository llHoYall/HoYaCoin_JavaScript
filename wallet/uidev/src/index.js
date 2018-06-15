import React from "react";
import ReactDOM from "react-dom";
import App from "./components/app";

const { remote } = window.require("electron");

const shared_port = remote.getGlobal("shared_port");

ReactDOM.render(
  <App shared_port={shared_port} />,
  document.getElementById("root")
);
