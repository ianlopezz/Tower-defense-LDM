const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 900;
canvas.height = 600; 


//variables globales
const cellSize = 100;
const cellGap = 3;
let numberOfResources = 350; //plata 
let enemiesInterval = 600 // cambia la velocidad en la que aparecen enemigos
let frame = 0;
const defenderCost = 100; // precio de la torre brah
let gameOver = false;
let score = 0;

const projectiles = [];
let gameGrid = [];
const defenders = []; 
const enemies = [];
const enemyPositions = [];




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
class projectile{
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = 10;
        this.power = 20;
        this.speed = 5;
    } 
    update(){
        this.x += this.speed;
    }
    draw(){
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
        ctx.fill();
    }
}

    function handleProjectiles(){ // movimiento y colision de proyectiles con enemigos 
        for(let i = 0; i < projectiles.length; i++){
            projectiles[i].update();
            projectiles[i].draw();
            for(let j = 0; j < enemies.length; j++){
                if (enemies[j] && projectiles[i] && collision(projectiles[i], enemies[j])){
                    enemies[j].health -= projectiles[i].power;
                    projectiles.splice(i, 1);
                    i--;
                    break;
                }
            }
            if (projectiles[i] && projectiles[i].x > canvas.width - cellSize){
                projectiles.splice(i, 1);
                i--;
            }
  
    }
}
 
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
    draw(){ // torre y su vida
        ctx.fillStyle = 'grey';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'gold';
        ctx.font = '30px Arial';
        ctx.fillText(Math.floor(this.health), this.x +25 , this.y);
    }
    update(){
        if (this.shooting){
            this.timer++;
            if (this.timer % 100 === 0){
                projectiles.push(new projectile(this.x + 70, this.y + 50));
            }
        } else {
            this.timer = 0;
        }
    }
}

canvas.addEventListener('click', function(){ // click y pum aparecen torres
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
        defenders[i].shooting = enemyPositions.includes(defenders[i].y);
        defenders[i].update();
        for (let j = 0; j < enemies.length; j++){
            if (collision(defenders[i], enemies[j])){
                enemies[j].movement = 0;
                defenders[i].health -= 0.2;
            }
        }
        if (defenders[i] && defenders[i].health <= 0){
            defenders.splice(i, 1);
            i--;
        }
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
        this.movement = this.speed;
        this.health = 100;
        this.maxHealth = this.health;
        }
    draw(){ // que se vea el enemigo y su vida
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
            enemies[i].x -= enemies[i].movement;
            if (enemies[i].x + enemies[i].width < 0){
                gameOver = true; // si el enemigo llega al final de el cuadro se acabo papa
            }
            if (enemies[i].health <= 0){
                const gainedResources = enemies[i].maxHealth / 10;
                numberOfResources += gainedResources;
                score += gainedResources;
                const findThisIndex = enemyPositions.indexOf(enemies[i].y);
                enemyPositions.splice(findThisIndex, 1);
                enemies.splice(i, 1);
                i--;
            }
        }
        if (frame % enemiesInterval === 0){
            let verticalPosition = Math.floor(Math.random() * 5 + 1) * cellSize;
            enemies.push(new Enemy(verticalPosition));
            enemyPositions.push(verticalPosition);
            if (enemiesInterval > 10) enemiesInterval -= 10; // enemigos aparecer rapido con un minimo de 120 
        }

    }

//recursos / plata y loop de animate, status del juego cosas y eso 
function handleGameStatus(){
    ctx.fillStyle = 'black';
    ctx.font = '30px jersey 10 cursive';
    ctx.fillText('score: ' + score, 20, 40);
    ctx.fillText('plata: ' + numberOfResources, 20, 80);

        if (gameOver){ 
            ctx.fillStyle = 'black';
            ctx.font = '60px Jersey 10 cursive';
            ctx.fillText('GAME OVER', 250, 300);
        }
}
function animate(){   // loop del juego entero 
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, controlsBar.width, controlsBar.height);
    for (let i = 0; i < enemies.length; i++){
        enemies[i].movement = enemies[i].speed;
    }
    handleGameGrid();
    handleDefenders();
    handleProjectiles();
    handleEnemies();
    handleGameStatus();
    frame++;
   if(!gameOver) requestAnimationFrame(animate);
}
animate();

function collision(first, second){ // Colision del beta, no funciona al 100%
if ( !(first.x >= second.x + second.width ||
      first.x + first.width <= second.x ||
      first.y >= second.y + second.height ||
      first.y + first.height <= second.y) 
    ){
        return true; 
    };
}
    
