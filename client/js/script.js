const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 900;
canvas.height = 600; 


//variables globales
const cellSize = 100;
const cellGap = 3;
let gameGrid = [];
const defenders = []; 
let numberOfResources = 600; //plata 
const enemyPositions = [];
const enemies = [];
let enemiesInterval = 600 // cambia la velocidad en la que aparecen enemigos
let frame = 0;
const defenderCost = 100;


// mouse 
const mouse ={
    x: 10,
    y: 10,
    width: 0.1,
    height: 0.1,
}
let canvasPosition = canvas.getBoundingClientRect();
canvas.addEventListener('mousemove', function(e){
    mouse.x = e.x - canvasPosition.left;
    mouse.y = e.y - canvasPosition.top;
});
canvas.addEventListener('mouseleave', function(){
    mouse.x = undefined;
    mouse.y = undefined;
});

//tablero juego
const controlsBar = {
    width: canvas.width,
    height: cellSize,
}
class Cell{
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = cellSize;
        this.height = cellSize;
    }
    draw(){
        if (mouse.x !== undefined && mouse.y !== undefined && collision(this, mouse)){ 
            ctx.strokeStyle = 'black';
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }
}
function createGrid(){
    for(let y = cellSize; y < canvas.height; y += cellSize){
        for(let x = 0; x < canvas.width; x += cellSize){
            gameGrid.push(new Cell(x, y));
        }
    }
}
function handleGameGrid(){
    for(let i = 0; i < gameGrid.length; i++){
        gameGrid[i].draw();
    }
}
createGrid();

//proyectiles

//defensores/towers
class Defender{
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = cellSize;
        this.height = cellSize;
        this.shooting = false;
        this.health = 100;
        this.projectiles = [];
        this.timer= 0;
    }
    draw(){
        ctx.fillStyle = 'grey';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'gold';
        ctx.font = '30px Arial';
        ctx.fillText(Math.floor(this.health), this.x +25 , this.y);
      }
    }
canvas.addEventListener('click', function(){ //logica de raton basica vaya.
        if (mouse.x === undefined || mouse.y === undefined) return;
        const gridPositionX = mouse.x - (mouse.x % cellSize);
        const gridPositionY = mouse.y - (mouse.y % cellSize);
        if (gridPositionY < cellSize) return; // el if no permite usar la barra como posicion de torres
        for(let i = 0; i < defenders.length; i++){ // este for es para evitar que se pongan dos torres en el mismo lugar.
            if(defenders[i].x === gridPositionX && defenders[i].y === gridPositionY) return;
        }

        if (numberOfResources >= defenderCost){
             defenders.push(new Defender(gridPositionX, gridPositionY));
             numberOfResources -= defenderCost;
        }
    });
    function handleDefenders(){
        for(let i = 0; i < defenders.length; i++){
            defenders[i].draw();
        }
    }
//enemigos
class Enemy{
    constructor(verticalPosition){
        this.x = canvas.width;
        this.y = verticalPosition;
        this.width = cellSize;
        this.height = cellSize;
        this.speed = Math.random() * 0.2 + 0.4;
        this.health = 100;
        this.maxHealth = this.health;
        }
    draw(){
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'black';
        ctx.font = '30px Arial';
        ctx.fillText(Math.floor(this.health), this.x +25 , this.y + 30);

    }
}
    function handleEnemies(){ //movimiento y spawn de enemigos
        for(let i = 0; i < enemies.length; i++){
            enemies[i].draw();
            enemies[i].x -= enemies[i].speed;
        }
        if (frame % enemiesInterval === 0){
            let verticalPosition = Math.floor(Math.random() * 5 + 1) * cellSize;
            enemies.push(new Enemy(verticalPosition));
            enemyPositions.push(verticalPosition);
        }

    }

//recursos / plata y loop de animate, status del juego cosas y eso 
function handleGameStatus(){
    ctx.fillStyle = 'black';
    ctx.font = '30px Arial';
    ctx.fillText('plata: ' + numberOfResources, 10, 40);
}
function animate(){  
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, controlsBar.width, controlsBar.height);
    handleGameGrid();
    handleDefenders();
    handleEnemies();
    handleGameStatus();
    frame++;
    requestAnimationFrame(animate);
}
animate();

function collision(first, second){ // Colision
if ( !(first.x > second.x + second.width ||
      first.x + first.width < second.x ||
      first.y > second.y + second.height ||
      first.y + first.height < second.y) 
    ){
        return true; 
    };
}
    
