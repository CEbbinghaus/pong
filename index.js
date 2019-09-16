let game;
let Options = {
  Fullscreen: () => {
    toggleFullScreen();
  }
}
let MainMenu = {
  Play: {
    Singleplayer: {
      Easy: () => {game = new singlePlayer(0.4); return true},
      Medium: () => {game = new singlePlayer(0.5); return true},
      Hard: () => {game = new singlePlayer(0.8); return true}
    },
    Multiplayer: {
      Local: () => {game = new multiPlayer(); return true;},
       Online: () => {
        game = new onlineGame();
        return true;
      }
    }
  },
  Options: Options
}

let GameMenu = {
  Resume: () => {
    game.start();
  },
  Options: Options,
  MainMenu: () => {
    game = null;
    m = new Menu(MainMenu);
  }
}

let m = new Menu(MainMenu);
m.draw();