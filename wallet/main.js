const electron = require("electron"),
  path = require("path"),
  url = require("url"),
  get_port = require("get-port"),
  hoyacoin = require("./HoYaCoin/src/server");

get_port().then(port => {
  const server = hoyacoin.app.listen(port, () => {
    console.log(`Running HoYaCoin node on: http://localhost:${port}`);
  });
  hoyacoin.startP2PServer(server);
  global.shared_port = port;
});

const { app, BrowserWindow, Menu } = electron;

let main_window;

const createWindow = () => {
  main_window = new BrowserWindow({
    title: "HoYaCoin Wallet",
    width: 800,
    height: 600,
    resizable: false
  });

  const template = [
    {
      label: "HoYaCoin Wallet",
      submenu: [
        { label: "About HoYaCoin Wallet", role: "about" },
        { type: "separator" },
        { label: "Services", role: "services", submenu: [] },
        { type: "separator" },
        {
          label: "Hide Nomadcoin Wallet",
          accelerator: "Command+H",
          role: "hide"
        },
        {
          label: "Hide Others",
          accelerator: "Command+Shift+H",
          role: "hideothers"
        },
        { label: "Show All", role: "unhide" },
        { type: "separator" },
        {
          label: "Quit",
          accelerator: "Command+Q",
          click: function() {
            app.quit();
          }
        }
      ]
    },
    {
      label: "Edit",
      submenu: [
        { label: "Undo", accelerator: "CmdOrCtrl+Z", role: "undo" },
        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", role: "redo" },
        { type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", role: "cut" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", role: "copy" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", role: "paste" },
        { label: "Select All", accelerator: "CmdOrCtrl+A", role: "selectall" }
      ]
    }
  ];

  const ENV = process.env.ENV;
  if (ENV === "dev") {
    main_window.loadURL("http://localhost:3000");
    main_window.webContents.openDevTools();
  } else {
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
    main_window.loadURL(
      url.format({
        pathname: path.join(__dirname, "build/index.html"),
        protocol: "file",
        slashes: true
      })
    );
  }

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
