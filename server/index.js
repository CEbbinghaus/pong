const {Server} = require('ws');
const {Game, Ball, Player, Client} = require("./classes.js")
const uid = require("uuid");

const eventChain = [
  "connect",
  "queryId",
  "assignId",
  "pairing",
  "paired",
  "begin",
  "update",
  "end"
]

const ws = new Server({port: 8080});
const clients = [];
const games = [];
let pairing = [];

ws.on("listening", (wbsct) => {
  console.log("Server is running on port: " + ws.options.port);

  setInterval(globalTick, 20);
});

async function findPair(){
  return new Promise((res, rej) => {
    if(pairing.length > 1){
      p1 = pairing.pop();
      p2 = pairing.pop();
      p1.emit("pair");
      p2.emit("pair");
      games.push(new Game(p1.player, p2.player));
    }
  });
}

ws.on('connection', wsc => {

  let c = new Client(wsc);

  c.send("connect");

  c.on("ping", o => {
    o.reply("pong");
  })

  c.on("assignId", o => {
    c.id = o.id;
    o.reply("pairing");
    pairing.push(c);
    findPair();
  })

  c.on("pair", o => {
    c.send("paired");
  })

  c.on("queryId", o => {
    let id = uid();
    c.id = id;
    o.reply("assignId", {id: id});
    pairing.push(c);
    findPair();
  })

  c.on("connected", o => {
    clients.push(c);
    //TODO Add to the Clients List
    //*possibly find a Match early on
    o.reply("queryId");
  })

});

function globalTick(t = 0){
  for(let game of games){
    game.update();
  }
}

class Instance {
  constructor(a){
    this.player1 = a[0]
    this.player2 = a[1];
    this.game = new Game();
    this.isActive = true;
  }
}