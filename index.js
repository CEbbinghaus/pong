var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");
/////////////////////////////////////////////////////////////////////////////////
window.addEventListener("keydown", function(evt) {onKeyDown(event);}, false); 
window.addEventListener("keyup", function(evt) {onKeyUp(event);}, false);
canvas.addEventListener("touchmove", onTouch)
window.addEventListener("resize", () => {canvas.width = innerWidth; canvas.height = innerHeight;})
window.addEventListener("DOMContentLoaded", function(evt) {onLoad(evt);}, false);
///////////////////////////////////////////////////////////////////////////////////
var height = canvas.height = innerHeight;
var width = canvas.width = innerWidth;

var prevTime
var dt;

var speed = 15;

var Player1 = new Player(innerWidth / 80, innerHeight / 5);
Player1.d = 0.5
var Player2 = new Player(innerWidth / 80, innerHeight / 5);
Player2.d = 0.5
var ball = new Ball(innerWidth / 2, innerHeight / 2, innerHeight / 70);

var keymap = {};
var Keyup = 38;
var KeyDown = 40;
var KeyW = 87;
var KeyS = 83;
var KeyEsc = 27;
var KeySpace = 32

var gameState = 
{
    Menu: 0,
    Game: 1,
    Pause: 2,
    End: 3,
};
var currentState = gameState.Game;

var score = {Player1: 0, Player2: 0, lastwinner: Player1}
//////////////////////////////////////////////////////////////////////
function updateDT(t)
{
    var currentTime = t;
    var dt = currentTime - prevTime;
    prevTime = currentTime;
    return isNaN(dt) ? 1 : dt / 100;
}
//------------------------------------------------------------------
function onLoad(event)
{
    requestAnimationFrame(tick)
    setTimeout(ResetBall, 1000)
}
//------------------------------------------------------------------
function onKeyDown(event)
{
    keymap[event.keyCode] = true;
}


function onKeyUp(event)
{
    keymap[event.keyCode] = false;
}

function onTouch(event){
    event.preventDefault()
    let a = [];
    for(let k in event.touches){
        a.push(event.touches[k])
    }
    let l = a.filter(v => v.clientX < innerWidth / 8)
    let r = a.filter(v => v.clientX > innerWidth - innerWidth / 8)
    if(l.length)Player1.vy = (l[0].clientY - Player1.height / 2) - Player1.y;
    if(r.length)Player2.vy = (r[0].clientY - Player2.height / 2) - Player2.y;
}
//-------------------------------------------------------------------Collisions
function IsColliding(p1, p2)
{
    return p1.x > p2.x && p1.y > p2.y && p1.x < p2.x + p2.width && p2.y > p2.y + p2.height;
}
//--------------------------------------------------------------------Ball
function CenterBall()
{
    ball.vx = ball.vy = 0;
    ball.x = innerWidth / 2
    ball.y = innerHeight / 2
    if(score.Player1 >= 5 || score.Player2 >= 5){
        score.Player1 = 0;
        score.Player2 = 0;
        let n = "";
        for(o in window){if(window[o] == score.lastwinner)n = o;}
        drawGame();
        return alert(n + " Wins"); 
    };
}
function GO()
{
    ball.m = true;
    ball.vx = score.lastwinner == Player1 ? -40 : 40;
    ball.vy = Math.random() * 50 - 25;
}

function ResetBall()
{
    CenterBall()
    GO()
}
function BallUpdate(dt){
    if(ball.isColliding(Player1) && ball.vx < 0){
        ball.vx = -ball.vx * 1.01
        ball.vy += Player1.vy ** 2
    }else if(ball.isColliding(Player2) && ball.vx > 0){
        ball.vx = -ball.vx * 1.01;
        ball.vy += Player2.vy ** 2
    }
    ball.update(dt)
}
function BallBox()
{
    if(ball.vy > 100)ball.vy = 100;
    if (ball.y - ball.r <= 0  && ball.vy < 0){
        ball.vy = -ball.vy;
        ball.vx *= 1.01
    }else if(ball.y >= canvas.height - ball.r && ball.vy > 0){
        ball.vy = -ball.vy;
        ball.vx *= 1.01
    }

    if (ball.x < 0)
    {
        score.Player2++
        score.lastwinner = Player2;
        CenterBall()
        ball.m = false
        window.setTimeout(ResetBall, 1200)
    }
    if (ball.x >= canvas.width)
    {
        score.Player1++
        score.lastwinner = Player1;
        CenterBall()
        ball.m = false
        window.setTimeout(ResetBall, 1200)
    }
}
//--------------------------------------------------------------------P1
function P1Movement()
{
    if (keymap[KeyW] == true)
    {
        if(Player1.y == 0)return;
        Player1.vy = -speed
    }
    if (keymap[KeyS] == true)
    {
        if(Player1.y == innerHeight - Player1.height)return;
        Player1.vy = speed;
    }
}
function P1Box()
{
    if (Player1.y < 0){
        Player1.y = 0;
        Player1.vy = 0;
    }

    if (Player1.y + Player1.height > canvas.height){
        Player1.y = canvas.height - Player1.height
        Player1.vy = 0;
    }

    if (Player1.x != 0)
    Player1.x = 0
}
//---------------------------------------------------------------------P2
function P2Movement()
{
    if (keymap[Keyup] == true)
    {
        if(Player2.y == 0)return;
        Player2.vy += -speed / 2;
    }
    if (keymap[KeyDown] == true)
    {
        if(Player2.y == innerHeight - Player2.height)return;
        Player2.vy += speed / 2;
    }
}
function P2Box()
{
    if (Player2.y < 0){
        Player2.y = 0;
        Player2.vy = 0;
    }

    if (Player2.y + Player2.height > canvas.height){
        Player2.y = canvas.height - Player2.height;
        Player2.vy = 0;
    }

    if (Player2.x != canvas.width - Player2.width)
    Player2.x = canvas.width - Player2.width
}
//----------------------------------------
function updateMenu()
{

}
function drawMenu()
{

}
//--------------------------------------------
function updateGame(t)
{
    BallBox()
    BallUpdate(t)
    P1Movement()
    Player1.update(t)
    P1Box()
    P2Movement()
    Player2.update(t)
    P2Box()
    // if (keymap[KeySpace])
    // ball.m = true;
}
function drawGame()
{
    context.clearRect(0, 0, window.innerWidth, window.innerHeight)
    context.fillStyle = "white";
    ball.draw(context)
    Player1.draw(context);
    Player2.draw(context)
    context.font = "60px Arial";
    context.fillText(score.Player1 + ":" + score.Player2, canvas.width/2 - 60, 60);
}
///////////////////////////////////////////////////////////////////////
const tick = (t) => {
    let time = updateDT(t);
    if (currentState == gameState.Menu)
    {
        updateMenu(time)
        drawMenu(time)
    }
    if (currentState == gameState.Game)
    {
        updateGame(time)
        drawGame(time)
    }
    if (currentState == gameState.End)
    {
        updateEnd(time)
        drawEnd(time)
    }
    if (currentState == gameState.Pause)
    {

    }
    requestAnimationFrame(tick)
}



// function isColliding(x1, y1, x2, y2, width2, height2)
// {

// }
















// var currentTime = Date.now();
// var dt = currentTime - prevTime

// window.setInterval (function()
// {
// var currentTime = Date.now();
// var dt = currentTime - prevTime
// prevTime = currentTime
// },1000 * 1.0 / 100)