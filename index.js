let game;
let m = new Menu({
  Play: {
    Singleplayer: {
      Easy: () => {game = new singlePlayer(0.4); return true},
      Medium: () => {game = new singlePlayer(0.5); return true},
      Hard: () => {game = new singlePlayer(0.8); return true}
    },
    Multiplayer: {
      Local: () => {game = new multiPlayer(); return true;},
      Online: () => console.log("Online Multiplayer")
    }
  },
  Options: {
    Fullscreen: () => {
      toggleFullScreen();
    }
  }
  //Google: () => location.href = "http://www.google.com"
})
m.draw();