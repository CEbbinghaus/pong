class Ball{
  constructor(x = 0, y = 0, r = 20){
    this.m = false;
    this.x = x;
    this.y = y;
    this.r = r;
    this.vx = 0;
    this.vy = 0;
  }

  draw(ctx){
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
  }

  update(dt){
    if(!this.m)return;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
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
  // isColliding(player){
  //   let top = player.x + player.width;
  //   let bottom = player.x + player.height + player.width
  //   if(this.x < player.x + player.width)return false;
  //   if(this.y > player.y && this.y < player.y + player.height){
  //     return this.x;
  //   }else if(this.Math.hypot(this.x - top.x, this.y - player.y) < this.r){
    
  //   };
  //   return player.y > this.y && player.y + player.height > this.y && 
  // }
}