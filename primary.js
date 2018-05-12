class Process {
	constructor() {
		//average size of your screen
		this.size = (innerWidth + innerHeight) / 2;
		//references the HTML 5 Canvas to draw on
		this.canvas = document.getElementById("gameCanvas");
		this.ctx = this.canvas.getContext("2d")
		//Registers the Input Managers for Various things
		this.keyboard = new KeyManager();
		this.touch = new TouchManager(this.canvas);
		this.mouse = new MouseManager();
		this.state = "Menu";
		//calls resize to make sure the canvas is the same size as the screen
		this.resize();
		//lsitenes to the window resizing and ajusts the canvas accordingly
		window.addEventListener("resize", e => {this.resize(e); if(this.cresize)this.cresize(e)})
	}
	//resizes the canvas to the screen
	resize(e){
		this.canvas.height = innerHeight;
		this.canvas.width = innerWidth;
		this.update();
	}
	update(){}
}
//manages keypresses
class KeyManager {
	constructor() {
		//sets up a object of specific key events
		this.keyevent = {};
		window.addEventListener("keydown", e => {
			this[e.key] = true;
			if(this.keydown)this.keydown();
			this.keyevent[e.key] ? this.keyevent[e.key](e) : null;
			if(this.keydown)this.keydown(e);
		})
		window.addEventListener("keyup", e => {
			this[e.key] = false;
			if(this.keyup)this.keyup();
			this.keyevent[e.key] ? this.keyevent[e.key](e) : null;
			if(this.keyup)this.keyup(e);
		})
		window.addEventListener("keypress", e => {
			if(this.keypress)this.keypress();
			this.keyevent[e.key] ? this.keyevent[e.key](e) : null;
			if(this.keypress)this.keypress(e);
		})
	}
	on(t, f) {
		if (!this[t]) this[t] = f;
	}
}
//manages Touches
class TouchManager {
	constructor(e) {
		for (let i = 0; i < 10; i++) {
			this[i] = {}
		}
		let f = console.log
		this.touches = [];
		e.addEventListener("touchstart", e => {
			if(this.start)this.start(e);
			this.touches = e.touches;
			e.changedTouches.forEach(v => {
				this[v.identifier].state = true;
				if (this[v.identifier].press) this[v.identifier].press(v);
				this[v.identifier].x = v.clientX;
				this[v.identifier].y = v.clientY;
			})
		})
		e.addEventListener("touchmove", e => {
			e.preventDefault()
			if(this.move)this.move(e);
			this.touches = e.touches;
			e.changedTouches.forEach(v => {
				if (this[v.identifier].move) this[v.identifier].move(v);
				if(v.clientX == this[v.identifier].x && v.clientY == this[v.identifier].y){
					this[v.identifier].x = v.clientX;
					this[v.identifier].y = v.clientY;
					if(this[v.identifier].tap)this[v.identifier].tap(this[v.identifier]);
				}
			})
		})
		e.addEventListener("touchend", e => {
			if(this.end)this.end(e);
			this.touches = e.touches;
			e.changedTouches.forEach(v => {
				this[v.identifier].state = true;
				if (this[v.identifier].release) this[v.identifier].release(v);
				if(v.clientX == this[v.identifier].x && v.clientY == this[v.identifier].y){
					this[v.identifier].x = v.clientX;
					this[v.identifier].y = v.clientY;
					if(this.tap)this.tap(this[v.identifier]);
					if(this[v.identifier].tap)this[v.identifier].tap(this[v.identifier]);
				}
			})
		})
		e.addEventListener("touchcancel", e => {
			if(this.cancel)this.cancel(e);
		})
	}
	on(t, f) {
		if (!this[t]) this[t] = f;
	}
}
//manages Mouse Inpputs
class MouseManager{
	constructor(){
		window.addEventListener("mousedown", e => {this.pressed = true;if(this.click)this.click({x: e.clientX, y: e.clientY, originalObject: e})})
		window.addEventListener("mousemove", e => {this.x = e.clientX; this.y = e.clientY;if(this.move)this.move(e);})
		window.addEventListener("mouseup", e => {this.pressed = false; if(this.release)this.release(e)})
		window.addEventListener("wheel", e => {if(this.scroll)this.scroll(e);})
	}
	on(t, f){
		if(!this[t])this[t] = f;
	}
}

//generates a menu from an object
class Menu extends Process{
	constructor(m){
		super();
		this.menu = m;
		this.level = 0;
		this.completeMenu = [];
		this.currentMenu = [];
		this.history = [];
		this.submenu = null;
		this.back = {name: "<",x: 0, y: 0, width: 100, height: 100, data: () => {if(!this.history.length)return;this.currentMenu = this.history.shift(); this.draw()}};
		this.init();
	}
	init(){
		if(!this.menu)throw new Error("You need to Pass in a Object to build the menu from");
		this.completeMenu = this.flattenTemplate(this.menu);
		this.currentMenu = this.completeMenu.copy();
		this.ctx.textAlign = "center";
		this.resize();
		this.register();
		this.draw();
	}
	flattenTemplate(t, a){
		if(!t)return;
		let k = [];
		for(let i in t){
			if(trueType(t) == "array"){
				if(trueType(t[0]) == "string"){
					if(trueType(t[1]) == "function")
						k.push([t[0], t[1]]);
					else
					if(trueType(t[1]) == "array")
						k.push([t[0], this.flattenTemplate(t[1])]);
					else
					if(trueType(t[1]) == "object")
						k.push(t[0], this.flattenTemplate(t[1]))
					else
					throw new Error("An Array Template must be either a Function or a Array");
				}else
					throw new Error("The First Array part needs to be a String");
			}else
			switch(trueType(t[i])){
				case "function":
					k.push([i, t[i]])
				break;
				case "array":
				case "object":
					k.push([i, this.flattenTemplate(t[i])]);
				break;
				default:
					throw new Error(`Menu Template must be of type Funcation, Array or Object. It cannot be ${trueType(t[i])}`);
			};
		}
		k.map((v, i, a) => {
			let o = {};
			o.name = v[0];
			o.data = v[1];
			o.x = 0;
			o.y = 0;
			o.width = 0;
			o.height = 0;
			k[i] = o;
		})
		k = this.modifySize(k);
		return k;
	}
	modifySize(a){
		if(!a)
		console.log(a);
		a.map((v, i, a) => {
			v.x = innerWidth / 5;
			v.y = innerHeight / (a.length+2) * i + (innerHeight / (a.length+2)) + i * 5;
			v.width = innerWidth / 5 * 3;
			v.height = innerHeight / (a.length+2);
			if(trueType(v.data) == "array"){
				v.data = this.modifySize(v.data);
			}
			a[i] = v;
		})
		return a;
	}
	draw(){
		let objectsToDraw = this.currentMenu.copy();
		this.ctx.clearRect(0, 0, innerWidth, innerHeight)
		
		this.ctx.font = this.back.height + "px verdana";
		this.ctx.fillStyle = "Black";
		this.ctx.fillRect(this.back.x, this.back.y, this.back.width, this.back.height);
		this.ctx.fillStyle = "white";
		//this.ctx.fillText(this.back.name, this.back.x + this.back.width / 2, this.back.y + this.back.height / 1.3);
		this.ctx.fillText(this.back.name, this.back.x + this.back.width / 2 - (this.ctx.measureText(this.back.name).width / 2), this.back.y + (this.back.height / 2) + (this.back.height / 4))
		
		let text = "";
		objectsToDraw.forEach(v => {if(v.name.length > text.length)text = v.name});
		
		let fontsize=300;
		do{
			fontsize--;
			this.ctx.font=fontsize+"px verdana";
		}while(this.ctx.measureText(text).width>innerWidth / 5 * 3)
		let averageSize = objectsToDraw[objectsToDraw.length - 1].height / 2;
		fontsize = (fontsize > averageSize ? averageSize : fontsize);
		
		this.ctx.font= fontsize +"px verdana";
		objectsToDraw.forEach(v => {
			this.ctx.fillStyle = "black";
			this.ctx.fillRect(v.x, v.y, v.width, v.height);
			//this.ctx.font = v.height / 2 + "px Comic Sans MS";
			this.ctx.fillStyle = "white";
			// if(!this.notFirst){
			// 	this.ctx.fillText(v.name, v.x + v.width / 2, v.y + v.height / 1.6); 
			// }else{
				this.ctx.fillText(v.name, v.x + v.width / 2 - (this.ctx.measureText(v.name).width / 2), v.y + (v.height / 2) + (fontsize / 4))
			// }
		})
		this.notFirst = true;
	}
	update(){
		if(!this.currentMenu)return;
		this.currentMenu = this.modifySize(this.currentMenu);
		this.draw();
		this.register();
	}

	register(){
		this.mouse.click =  click => {
			if(click.x > this.back.x && click.x < this.back.x + this.back.width && click.y > this.back.y && click.y < this.back.y + this.back.height){
				this.back.data();
			}
			this.currentMenu.forEach(v => {
				if(click.x > v.x && click.x < v.x + v.width && click.y > v.y && click.y < v.y + v.height){
					if(trueType(v.data) == "array"){
						this.history.unshift(this.currentMenu);
						this.currentMenu = v.data;
						this.draw();
					}else if(trueType(v.data) == "function"){
						if(v.data()){this.mouse.click = null}
					}
				}
			})
		}
	}
}

//base game to build upon
class Game extends Process {
	constructor(){
		super();
		this.dt = 0;
		this.ct = 0;
		this.game = this
		this.score = {
			player1: 0,
			player2: 0,
			lastWinner: null
		}
		this.start();
		this.ctx.shadowColor = "#0003"
    this.ctx.shadowBlur = 20;
    this.ctx.shadowOffsetX = 10;
    this.ctx.shadowOffsetY = 10;
	}
	updateDT(t){
		this.dt = t - this.ct;
		this.ct = t
	}
	tick(t){
		this.updateDT(t);
		this.player1.update(this, ["w", "s"]);
		this.player2.update(this, ["ArrowUp", "ArrowDown"]);
		this.ball.update(this);
		if(this.ball.x < 0){
			this.score.player2++
			this.score.lastWinner = this.player2;
			this.ball.reset(this);
		}else if(this.ball.x > innerWidth){
			this.score.player1++;
			this.score.lastWinner = this.player1;
			this.ball.reset(this);
		}
		if(this.score.player1 >= 10 || this.score.player2 >= 10){
			alert(this.score.lastWinner.name + " Won");
			this.reset();
		}
		this.draw();
		requestAnimationFrame(this.tick.bind(this));
	}
	reset(){
		this.score.player2 = this.score.player1 = 0;
		this.ball.reset(this);
	}
	start(){
		requestAnimationFrame(this.tick.bind(this));
		this.touch.move = t => {
			t.touches.forEach(b => {
				console.log(this.clientX < innerWidth)
				if(b.clientX > 0 && b.clientX < this.player1.width * 3){
					this.player1.vy += b.clientY - (this.player1.y + this.player1.height / 2);
				}else if(b.clientX > this.player2.x - this.player2.width * 2 && this.clientX < innerWidth){// && this.player2.name != "AI"
					console.log("yep")
					this.player2.vy += b.clientY - (this.player2.y + this.player2.height / 2);
				}
			})
		}
	}
	cresize(){
		this.player2.x = innerWidth - this.player2.width;
	}
	draw(){
		this.ctx.clearRect(0, 0, innerWidth, innerHeight)
		this.player1.draw(this.ctx);
		this.player2.draw(this.ctx);
		this.ball.draw(this.ctx);
		this.ctx.font = "60px Arial";
		this.ctx.fillStyle = "white";
		this.ctx.fillText(this.score.player1 + " : " + this.score.player2, innerWidth / 2 - (this.ctx.measureText(this.score.player1 + " : " + this.score.player2).width / 2), 60)
	}
}

//singleplayer game
class singlePlayer extends Game {
	constructor(d){
		super();
		let player = {width: innerWidth / 50, height: innerHeight / 5}
		this.player1 = new Player({x: 0, width: player.width, height: player.height, d: 0.9, name: "Human"});
		this.player2 = new AI({x: innerWidth - player.width, width: player.width, height: player.height, name: "AI", diff: d});
		this.ball = new Ball({x: innerWidth / 2, y: innerHeight / 2});
		this.ctx.fillStyle = "white";
		this.init()
	}
	init(){
		setTimeout(() => this.ball.startMoving(this), 500)
	}
}
//multiplayer game
class multiPlayer extends Game {
	constructor(){
		super();
		let player = {width: innerWidth / 50, height: innerHeight / 5}
		this.player1 = new Player({x: 0, width: player.width, height: player.height, d: 0.8, name: "Player1"});
		this.player2 = new Player({x: innerWidth - player.width, width: player.width, height: player.height, d: 0.8, name: "Player2"});
		this.ball = new Ball({x: innerWidth / 2, y: innerHeight / 2});
		this.ctx.fillStyle = "white";
		this.init()
	}
	init(){
		setTimeout(() => this.ball.startMoving(this), 500)
	}
}

//creates a online multiplayer instance
class onlineGame{
	constructor(){

	}
}

//the ball class for interracting with the ball
class Ball{
  constructor(o){
    this.m = (o ? o.moving : false) || false;
    this.x = (o ? o.x : false) || 0;
    this.y = (o ? o.y : false) || 0;
		this.r = (o ? o.radius : false) || 20;
		this.s = 1.05;
    this.vx = 0;
    this.vy = 0;
  }

  draw(ctx){
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
  }

  update(g){
		// if(g.keyboard.t)this.vy -= 10;
		// if(g.keyboard.g)this.vy += 10;
		// if(g.keyboard.f)this.vx -= 10;
		// if(g.keyboard.h)this.vx += 10;
		if(!this.m)return;
		if(this.vx > 100)this.vx = 100;
		if(this.vy > 100)this.vy = 100;
    this.x += this.vx * (g.dt/60);
		this.y += this.vy * (g.dt/60);
		if(this.isColliding(g.player1) && this.vx < 0){
			this.vx = -this.vx * this.s;
			this.vy += g.player1.vy
		}
		if(this.isColliding(g.player2) && this.vx > 0){
			this.vx = -this.vx * this.s;
			this.vy += g.player2.vy
		}
		this.constrain(null, innerHeight);
  }

  isColliding(rect){
    var distX = Math.abs(this.x - rect.x-rect.width/2);
    var distY = Math.abs(this.y - rect.y-rect.height/2);

    if (distX > (rect.width/2 + this.r)) { return false; }
    if (distY > (rect.height/2 + this.r)) { return false; }

    if (distX <= (rect.width/2)) { return true; } 
    if (distY <= (rect.height/2)) { return true; }

    var dx=distX-rect.width/2;
    var dy=distY-rect.height/2;
    return (dx*dx+dy*dy<=(this.r*this.r));
  }

  reset(g){
		this.m = false;
    this.vx = this.vy = 0;
    this.x = innerWidth / 2;
		this.y = innerHeight / 2;
		setTimeout(() => this.startMoving(g), 1000)
	}
	
	startMoving(g){
		this.vx = 20 - (g.score.lastWinner && g.score.lastWinner == g.player1 ? 0 : 40)
		this.vy = Math.random() * 20 - 10
		this.m = true;
	}

	constrain(width, height){
		if(width){
			if(this.x - this.r < 0){this.x = this.r;this.vx = 0}
			if(this.x + this.r > width){this.x = width - this.r;this.vx = 0}
		}
		if(height){
			if(this.y - this.r < 0){this.y = this.r;this.vy = -this.vy;this.vx *= this.s}
			if(this.y + this.r > height){this.y = height - this.r;this.vy = -this.vy;this.vx *= this.s}
		}
	}
}

//the player class for a playable character
class Player {
  constructor(o){
    this.x = (o ? o.x : false) || 0;
    this.y = (o ? o.y : false) || 0;
    this.height = (o ? o.height : 0 < 50 ? 50 : o.height) || 50;
    this.width = (o ? o.width : 0 < 10 ? 10 : o.width) || 10;
    this.vx =  0;
    this.vy = 0;
		this.d = o  ? o.d : null || 0.4;
		this.name = o ? o.name : null || "Player";
  }
  draw(ctx){
    ctx.fillRect(this.x, this.y, this.width, this.height)
  }

  update(g, k){
		if(!k)throw new Error("You need to define the keys used");
		if(isNaN(this.vy))this.vy = 0;
		if(g.keyboard[k[0]]){
			this.vy -= 10;
		}
		if(g.keyboard[k[1]]){
			this.vy += 10;
		}
		if(this.vy > 100)this.vy = 100;
		this.y += this.vy * (g.dt / 60);
		this.vy *= this.d;
		this.constrain(null, innerHeight)
  }
  constrain(x, height){
		if(x)
		if(this.x != x)this.x = x;
		if(height){
			if(this.y < 0){this.y = 0;this.vy = 0}
			if(this.y + this.height > height){this.y = height - this.height;this.vy = 0}
		}
  }
}

//a ai class for a ai
class AI extends Player{
	constructor(o){
		super(o);
		this.diff = o ? o.diff : null | 0.8;
	}
	update(g){
		if(isNaN(this.vy))this.vy = 0;
		if(g.ball.x > innerWidth / 2){
			let d = (g.ball.x - innerWidth / 2) / (innerWidth / 2);
		 	this.vy = ((g.ball.y - (this.y + this.height * 0.5)) * this.diff) * d
		}
		this.y += this.vy * (g.dt/60);
		// this.vy *= this.d;
		this.constrain(null, innerHeight);
	}
}