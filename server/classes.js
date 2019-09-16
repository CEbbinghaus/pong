const EventEmitter = require('events');
const {OPEN} = require("ws")

const paddleHeight = 0.025;

//base game to build upon
class Game {
	constructor(p1, p2) {
		this.dt = 0;
		this.ct = 0;
		this.game = this;
		this.score = {
			player1: 0,
			player2: 0,
			lastWinner: null
		}
		this.player1 = p1;
		this.player2 = p2;
		this.ball = new Ball();

		this.ball.reset(this);
	}
	updateDT(t) {
		this.dt = t - this.ct;
		this.ct = t
	}
	tick(t) {
		this.updateDT(t);
		// this.player1.update(this, ["w", "s"]);
		// this.player2.update(this, ["ArrowUp", "ArrowDown"]);
		this.ball.update(this);

		if (this.ball.x < 0) {
			this.score.player2++
				this.score.lastWinner = this.player2;
			this.ball.reset(this);
		} else if (this.ball.x > 1) {
			this.score.player1++;
			this.score.lastWinner = this.player1;
			this.ball.reset(this);
		}

		if (this.score.player1 >= 10 || this.score.player2 >= 10) {
			//alert(this.score.lastWinner.name + " Won");
		}
	}
	reset() {
		this.score.player2 = this.score.player1 = 0;
		this.ball.reset(this);
	}

	update(){
		this.tick(Date.now());

		let object = {
			data: {
				b: this.ball,
				p1: this.player1,
				p2: this.player2,
				s: this.score
			}
		}
		console.log(object);
		this.player1.send("update", object);
		this.player2.send("update", object);
	}
}


//the ball class for interracting with the ball
class Ball {
	constructor(o) {
		this.m = (o ? o.moving : false) || false;
		this.x = (o ? o.x : false) || 0;
		this.y = (o ? o.y : false) || 0;
		this.r = (o ? o.radius : false) || 0.028;
		this.s = 1.05;
		this.vx = 0;
		this.vy = 0;
	}

	update(g) {
		if (!this.m) return;
		if (this.vx > 10) this.vx = 10;
		if (this.vy > 10) this.vy = 10;
		this.x += this.vx * (g.dt / 60);
		this.y += this.vy * (g.dt / 60);
		if (this.isColliding(g.player1) && this.vx < 0) {
			this.vx = -this.vx * this.s;
			this.vy += g.player1.vy
		}
		if (this.isColliding(g.player2) && this.vx > 0) {
			this.vx = -this.vx * this.s;
			this.vy += g.player2.vy
		}
		this.constrain(null, 1);
	}

	isColliding(rect) {
		var distX = Math.abs(this.x - rect.x - rect.width / 2);
		var distY = Math.abs(this.y - rect.y - rect.height / 2);

		if (distX > (rect.width / 2 + this.r)) {
			return false;
		}
		if (distY > (rect.height / 2 + this.r)) {
			return false;
		}

		if (distX <= (rect.width / 2)) {
			return true;
		}
		if (distY <= (rect.height / 2)) {
			return true;
		}

		var dx = distX - rect.width / 2;
		var dy = distY - rect.height / 2;
		return (dx * dx + dy * dy <= (this.r * this.r));
	}

	reset(g) {
		this.m = false;
		this.vx = this.vy = 0;
		this.x = 1 / 2;
		this.y = 1 / 2;
		setTimeout(() => this.startMoving(g), 1000)
	}

	startMoving(g) {
		this.vx = 20 - (g.score.lastWinner && g.score.lastWinner == g.player1 ? 0 : 40)
		this.vy = Math.random() * 20 - 10
		this.m = true;
	}

	constrain(width, height) {
		if (width) {
			if (this.x - this.r < 0) {
				this.x = this.r;
				this.vx = 0
			}
			if (this.x + this.r > width) {
				this.x = width - this.r;
				this.vx = 0
			}
		}
		if (height) {
			if (this.y - this.r < 0) {
				this.y = this.r;
				this.vy = -this.vy;
				this.vx *= this.s
			}
			if (this.y + this.r > height) {
				this.y = height - this.r;
				this.vy = -this.vy;
				this.vx *= this.s
			}
		}
	}
}

//the player class for a playable character
class Player {
	constructor() {
		this.y = 0.5;
		this.height = paddleHeight;
		this.vy = 0;
		this.name = "Player";
	}

	update(positionData) {
		if(!positionData || !positionData.y || !positionData.vy)return;
		this.y = positionData.y;
		this.vy = positionData.vy;
	}

	constrain(height = 1) {
		if (height) {
			if (this.y < 0) {
				this.y = 0;
				this.vy = 0
			}
			if (this.y + this.height > height) {
				this.y = height - this.height;
				this.vy = 0
			}
		}
	}
}



class Client extends EventEmitter{
	constructor(ws) {
		super();
		if (!ws) throw new Error("You need to supply a connection");
		this.player = new Player();
		this.ws = ws;
		this.isAlive = true;
		this.id = null;
		this.player.send = this.send.bind(this);
		ws.on("message", this._handleMessage.bind(this));
		this.on("update", o => {
			this.player.update(o.data);
		})
	}

	send(n, o = {}) {
		if (this.ws.readyState != OPEN){
			return this.emit("close");
		}
		o.command = n;
		this.ws.send(JSON.stringify(o));
	}

	message(m) {
		this.isAlive = true;
		let o = JSON.parse(m);
	}

	_handleMessage(m) {
		let o = JSON.parse(m);
		o.reply = (c, b) => {
			this.send(c, b)
		};
		this.emit(o.command, o);
	}
}


module.exports.Game = Game;  
module.exports.Ball = Ball;
module.exports.Player = Player;
module.exports.Client = Client;