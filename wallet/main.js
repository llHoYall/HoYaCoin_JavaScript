const electron = require("electron"),
  path = require("path"),
  url = require("url");

const { app, BrowserWindow } = electron;

let main_window;

const createWindow = () => {
  main_window = new BrowserWindow({
    title: "HoYaCoin Wallet",
    width: 800,
    height: 600,
    resizable: false
  });

  main_window.loadURL(
    url.format({
      pathname: path.join(__dirname, "index.html"),
      protocol: "file",
      slashes: true
    })
  );

  main_window.on("closed", () => {
    main_window = null;
  });
};

app.on("activate", () => {
  if (main_window === null) {
    createWindow();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("ready", createWindow);
