class Player {
  constructor(width, height){
    this.x = 0;
    this.y = 0;
    this.height = height || 200;
    this.width = width || 30;
    this.vx = 0;
    this.vy = 0;
    this.d = 0.01;
  }
  draw(ctx){
    ctx.fillRect(this.x, this.y, this.width, this.height)
  }

  update(){
    this.x += this.vx;
    this.vx *= this.d;
    if(!(this.y + this.vy < 0) || !((this.y + this.vy) + this.height > innerHeight))
    this.y += this.vy;
    this.vy *= this.d;
  }
}