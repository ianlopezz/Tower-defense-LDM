const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 900;
canvas.height = 600; 


//variables globales
const cellSize = 100;
const cellGap = 3;
let numberOfResources = 100; //plata 
let enemiesInterval = 100 // cambia la velocidad en la que aparecen enemigos
let frame = 0;
const defenderCost = 50; // precio de la torre brah
const towerTypes = [
    {
        name: 'BASICA',
        cost: defenderCost,
        color: 'grey',
        textColor: 'gold',
        shootEvery: 100,
        projectileCount: 1,
        projectilePower: 20,
    },
    {
        name: 'BANCO',
        cost: 100,
        color: 'gold',
        textColor: 'black',
        incomeEvery: 200,
        incomeAmount: 5,
    },
    {
        name: 'TRIPLE',
        cost: 300,
        color: 'purple',
        textColor: 'white',
        shootEvery: 100,
        projectileCount: 3,
        projectilePower: 14,
    },
];
let selectedTowerTypeIndex = 0;
let gameOver = false;
let gameWon = false;
let score = 0;
const enemyCoinValue = 25;
const gameFont = "'Jersey 10', cursive";
const upgradeSlotRects = [];
const nextRoundButton = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
};
const upgradeOptions = [];
const activeUpgrades = {
    autoCollect: false,
    extraHealth: 0,
    damageBoost: 0,
    towerRecycle: false,
    bombUnlocked: false,
};
let upgradeHudReady = false;
let bombPlacementMode = false;
let lastTowerRecycleFrame = -300;
const frozenRows = {};
let selectedBossType = null;
const upgradePool = [
    {
        id: 'autoCollect',
        name: 'IMAN',
        cost: 120,
        description: 'recoge monedas',
    },
    {
        id: 'extraHealth',
        name: 'VIDA+',
        cost: 130,
        description: '+30 vida torres',
    },
    {
        id: 'damageBoost',
        name: 'DANO+',
        cost: 170,
        description: '+dano / +banco',
    },
    {
        id: 'towerRecycle',
        name: 'RECICLAR',
        cost: 110,
        description: 'borra cada 5s',
    },
    {
        id: 'bombUnlocked',
        name: 'BOMBA',
        cost: 200,
        description: 'explosion cereza',
    },
];
const enemyTypes = {
    normal: {
        name: 'NORMAL',
        health: 100,
        speed: 0.12,
        speedRandom: 0.04,
        color: 'green',
        reward: 10,
    },
    fast: {
        name: 'RAPIDO',
        health: 200,
        speed: 0.32,
        speedRandom: 0.08,
        color: 'limegreen',
        reward: 25,
    },
    tank: {
        name: 'TANQUE',
        health: 350,
        speed: 0.05,
        speedRandom: 0.02,
        color: 'darkolivegreen',
        reward: 45,
        spawnOnDeath: 'normal',
    },
    explosive: {
        name: 'BOOM',
        health: 75,
        speed: 0.42,
        speedRandom: 0.1,
        color: 'crimson',
        reward: 35,
        explosionDamage: 50,
    },
    wizard: {
        name: 'MAGO',
        health: 500,
        speed: 0.1,
        speedRandom: 0.03,
        color: 'deepskyblue',
        reward: 60,
        freezeEvery: 300,
        freezeDuration: 60,
    },
    bossSpawner: {
        name: 'JEFE',
        health: 10000,
        speed: 0.025,
        speedRandom: 0,
        color: 'black',
        reward: 300,
        spawnBoomEvery: 300,
    },
    bossTank: {
        name: 'COLOSO',
        health: 10000,
        speed: 0.018,
        speedRandom: 0,
        color: 'dimgray',
        reward: 350,
        spawnBoomEvery: 420,
    },
    bossRush: {
        name: 'BRUJO',
        health: 10000,
        speed: 0.035,
        speedRandom: 0,
        color: 'indigo',
        reward: 325,
        spawnBoomEvery: 240,
    },
};
const rounds = [
    {
        name: 'RONDA 1',
        enemyTowerDamage: 0.2,
        healthMultiplier: 1,
        speedMultiplier: 1,
        waves: [
    {
        name: 'OLEADA 1',
        rows: [2, 3, 4],
        phases: [
            { count: 5, delay: 230, types: ['normal'] },
            { count: 5, delay: 170, types: ['normal', 'normal', 'fast'] },
            { count: 5, delay: 120, types: ['normal', 'fast'], message: 'MINI OLEADA' },
            { count: 5, delay: 80, types: ['normal', 'normal', 'fast', 'tank'], message: 'GRAN OLEADA' },
        ],
        healthBonus: 0,
        speedBonus: 0,
    },
    {
        name: 'OLEADA 2',
        rows: [1, 2, 3, 4, 5],
        phases: [
            { count: 4, delay: 210, types: ['normal', 'fast'] },
            { count: 6, delay: 145, types: ['normal', 'normal', 'fast'] },
            { count: 5, delay: 105, types: ['normal', 'fast', 'tank'], message: 'MINI OLEADA' },
            { count: 5, delay: 75, types: ['normal', 'fast', 'fast', 'tank'], message: 'GRAN OLEADA' },
        ],
        healthBonus: 15,
        speedBonus: 0.015,
    },
    {
        name: 'OLEADA 3',
        rows: [1, 2, 3, 4, 5],
        phases: [
            { count: 4, delay: 190, types: ['normal', 'fast'] },
            { count: 5, delay: 130, types: ['normal', 'fast', 'tank'] },
            { count: 5, delay: 90, types: ['normal', 'fast', 'fast', 'tank'], message: 'MINI OLEADA' },
            { count: 6, delay: 65, types: ['fast', 'normal', 'tank', 'tank'], message: 'GRAN OLEADA' },
        ],
        healthBonus: 30,
        speedBonus: 0.025,
    },
        ],
    },
    {
        name: 'RONDA 2',
        enemyTowerDamage: 0.35,
        healthMultiplier: 1.35,
        speedMultiplier: 1.2,
        waves: [
    {
        name: 'OLEADA 1',
        rows: [1, 2, 3, 4, 5],
        phases: [
            { count: 6, delay: 200, types: ['normal', 'fast'] },
            { count: 7, delay: 145, types: ['normal', 'fast', 'explosive'] },
            { count: 7, delay: 105, types: ['normal', 'fast', 'tank'], message: 'MINI OLEADA' },
            { count: 8, delay: 75, types: ['normal', 'fast', 'explosive', 'tank'], message: 'GRAN OLEADA' },
        ],
        healthBonus: 50,
        speedBonus: 0.02,
    },
    {
        name: 'OLEADA 2',
        rows: [1, 2, 3, 4, 5],
        phases: [
            { count: 7, delay: 185, types: ['normal', 'fast', 'explosive'] },
            { count: 8, delay: 130, types: ['normal', 'fast', 'fast', 'tank'] },
            { count: 8, delay: 95, types: ['fast', 'explosive', 'tank'], message: 'MINI OLEADA' },
            { count: 9, delay: 65, types: ['fast', 'explosive', 'normal', 'tank'], message: 'GRAN OLEADA' },
        ],
        healthBonus: 70,
        speedBonus: 0.04,
    },
    {
        name: 'OLEADA 3',
        rows: [1, 2, 3, 4, 5],
        phases: [
            { count: 8, delay: 165, types: ['normal', 'fast', 'explosive'] },
            { count: 9, delay: 115, types: ['fast', 'normal', 'tank'] },
            { count: 9, delay: 80, types: ['fast', 'explosive', 'tank'], message: 'MINI OLEADA' },
            { count: 10, delay: 55, types: ['fast', 'explosive', 'tank', 'tank'], message: 'GRAN OLEADA' },
        ],
        healthBonus: 90,
        speedBonus: 0.06,
    },
        ],
    },
    {
        name: 'RONDA 3',
        enemyTowerDamage: 0.5,
        healthMultiplier: 1.7,
        speedMultiplier: 1.35,
        explosiveDamage: 80,
        bossTypes: ['bossSpawner', 'bossTank', 'bossRush'],
        waves: [
    {
        name: 'JEFE FINAL',
        rows: [1, 2, 3, 4, 5],
        phases: [
            { count: 1, delay: 120, types: ['boss'], message: 'JEFE' },
        ],
        healthBonus: 0,
        speedBonus: 0,
    },
        ],
    },
];
let currentRoundIndex = 0;
let waves = rounds[currentRoundIndex].waves;
let currentWaveIndex = 0;
let waveEnemiesSpawned = 0;
let nextEnemySpawnFrame = 150;
const waveBreakFrames = 420;
let currentWaveSpawns = buildWaveSpawns(waves[currentWaveIndex]);
const recentSpawnRows = [];
const warnedSpawnIndexes = [];

const projectiles = [];
let gameGrid = [];
const defenders = []; 
const enemies = [];
const enemyPositions = [];
const resources = [];




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
    for (const rowY in frozenRows){
        if (frozenRows[rowY] > frame){
            ctx.fillStyle = 'rgba(0, 180, 255, 0.18)';
            ctx.fillRect(0, Number(rowY), canvas.width, cellSize);
        }
    }
}
createGrid();

//proyectiles
class projectile{
    constructor(x, y, power = 20){
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = 10;
        this.power = power;
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
    constructor(x, y, towerType){
        this.x = x;
        this.y = y;
        this.width = cellSize;
        this.height = cellSize;
        this.towerType = towerType;
        this.shooting = false;
        this.health = 100;
        this.projectiles = [];
        this.timer= 0;
    }
    draw(){ // torre y su vida
        ctx.fillStyle = this.towerType.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = this.towerType.textColor;
        ctx.font = `24px ${gameFont}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.towerType.name, this.x + this.width / 2, this.y + 32);
        ctx.fillText(Math.floor(this.health), this.x + this.width / 2, this.y + 68);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
    }
    update(){
        this.timer++;
        if (frozenRows[this.y] && frozenRows[this.y] > frame){
            return;
        }
        if (this.towerType.incomeEvery && this.timer % this.towerType.incomeEvery === 0){
            const incomeAmount = this.towerType.incomeAmount + activeUpgrades.damageBoost;
            const bankLimit = getBankLimit();
            if (enemies.length > 0 && numberOfResources < bankLimit){
                numberOfResources = Math.min(bankLimit, numberOfResources + incomeAmount);
                floatingMessages.push(new floatingMessage('+' + incomeAmount, this.x + 25, this.y + 25, 20, 'gold'));
            }
        }
        if (this.shooting && this.towerType.projectileCount){
            if (this.timer % this.towerType.shootEvery === 0){
                const middleProjectile = Math.floor(this.towerType.projectileCount / 2);
                for (let i = 0; i < this.towerType.projectileCount; i++){
                    const yOffset = (i - middleProjectile) * 18;
                    projectiles.push(new projectile(this.x + 70, this.y + 50 + yOffset, this.towerType.projectilePower + activeUpgrades.damageBoost));
                }
            }
        }
    }
}

function handleTowerSelector(){
    for(let i = 0; i < towerTypes.length; i++){
        const towerType = towerTypes[i];
        const x = i * cellSize;
        const y = 0;
        const isSelected = i === selectedTowerTypeIndex;

        ctx.fillStyle = isSelected ? 'white' : '#d33';
        ctx.fillRect(x + 4, y + 4, cellSize - 8, cellSize - 8);
        ctx.strokeStyle = isSelected ? 'black' : '#7a0000';
        ctx.lineWidth = isSelected ? 4 : 2;
        ctx.strokeRect(x + 4, y + 4, cellSize - 8, cellSize - 8);

        ctx.fillStyle = towerType.color;
        ctx.fillRect(x + 25, y + 12, 50, 35);
        ctx.fillStyle = 'black';
        ctx.font = `20px ${gameFont}`;
        ctx.textAlign = 'center';
        ctx.fillText(towerType.name, x + cellSize / 2, y + 68);
        ctx.fillText('$' + towerType.cost, x + cellSize / 2, y + 90);
    }
    ctx.textAlign = 'left';
}

canvas.addEventListener('click', function(){ // click y pum aparecen torres
        if (mouse.x === undefined || mouse.y === undefined) return;
        if (gameWon){
            handleUpgradeClick(mouse.x, mouse.y);
            return;
        }
        const gridPositionX = mouse.x - (mouse.x % cellSize);
        const gridPositionY = mouse.y - (mouse.y % cellSize);
        if (bombPlacementMode && activeUpgrades.bombUnlocked && gridPositionY >= cellSize){
            placeBomb(gridPositionX, gridPositionY);
            bombPlacementMode = false;
            return;
        }
        if (activeUpgrades.towerRecycle && frame - lastTowerRecycleFrame >= 300){
            for(let i = 0; i < defenders.length; i++){
                if(defenders[i].x === gridPositionX && defenders[i].y === gridPositionY){
                    defenders.splice(i, 1);
                    lastTowerRecycleFrame = frame;
                    floatingMessages.push(new floatingMessage('RECICLAR', gridPositionX + 5, gridPositionY + 40, 20, 'black'));
                    return;
                }
            }
        }
        if (gridPositionY < cellSize){
            const clickedTowerTypeIndex = Math.floor(mouse.x / cellSize);
            if (clickedTowerTypeIndex < towerTypes.length){
                selectedTowerTypeIndex = clickedTowerTypeIndex;
            }
            return;
        }
        for(let i = 0; i < defenders.length; i++){ // este for es para evitar que se pongan dos torres en el mismo lugar.
            if(defenders[i].x === gridPositionX && defenders[i].y === gridPositionY) return;
        }

        const towerType = towerTypes[selectedTowerTypeIndex];
        if (numberOfResources >= towerType.cost){
             defenders.push(new Defender(gridPositionX, gridPositionY, towerType));
             defenders[defenders.length - 1].health += activeUpgrades.extraHealth;
             numberOfResources -= towerType.cost;
        } else {
            floatingMessages.push(new floatingMessage('tas pelando bola', mouse.x, mouse.y, 20, 'red'));
        }
    });

function handleDefenders(){ 
    const currentRound = rounds[currentRoundIndex];
    for(let i = 0; i < defenders.length; i++){
        defenders[i].draw();
        defenders[i].shooting = enemyPositions.includes(defenders[i].y);
        defenders[i].update();
        for (let j = 0; j < enemies.length; j++){
            if (collision(defenders[i], enemies[j])){
                enemies[j].movement = 0;
                defenders[i].health -= currentRound.enemyTowerDamage;
            }
        }
        if (defenders[i] && defenders[i].health <= 0){
            defenders.splice(i, 1);
            i--;
        }
    }
}



//mensajes flotantes 
const floatingMessages = [];
class floatingMessage{
    constructor(value, x, y, size, color, maxLifeSpan = 60){
        this.value = value;
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.lifeSpan = 0;
        this.maxLifeSpan = maxLifeSpan;
        this.opacity = 1;
    }
    update(){
        this.y -= 0.3;
        this.lifeSpan += 1;
        if (this.opacity > 0.01){
            this.opacity -= 0.01;
        }
    }
    draw(){
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.font = this.size + 'px ' + gameFont;
        ctx.fillText(this.value, this.x, this.y);
        ctx.globalAlpha = 1;
    }
}
function handleFloatingMessages(){
    for(let i = 0; i < floatingMessages.length; i++){
        floatingMessages[i].update();
        floatingMessages[i].draw();
        if (floatingMessages[i].lifeSpan >= floatingMessages[i].maxLifeSpan){
            floatingMessages.splice(i, 1);
            i--;
        }
    }
}   

function buildWaveSpawns(wave){
    const spawns = [];
    for(let i = 0; i < wave.phases.length; i++){
        const phase = wave.phases[i];
        for(let j = 0; j < phase.count; j++){
            let spawnType = phase.types[Math.floor(Math.random() * phase.types.length)];
            if (spawnType === 'boss'){
                spawnType = selectedBossType || 'bossSpawner';
            }
            spawns.push({
                delay: phase.delay,
                type: spawnType,
                message: j === 0 ? phase.message : undefined,
            });
        }
    }
    return spawns;
}

function getDifficultyBalance(){
    if (defenders.length <= 3){
        return {
            healthMultiplier: 1,
            delayMultiplier: 1.2,
        };
    }
    if (defenders.length >= 8){
        return {
            healthMultiplier: 1.1,
            delayMultiplier: 0.85,
        };
    }
    return {
        healthMultiplier: 1,
        delayMultiplier: 1,
    };
}

function getBankLimit(){
    return 1000 * Math.pow(2, currentRoundIndex);
}

function chooseSpawnRow(rows){
    const rowCounts = rows.map(row => {
        return {
            row: row,
            count: recentSpawnRows.filter(recentRow => recentRow === row).length,
        };
    });
    const lowestCount = Math.min(...rowCounts.map(rowCount => rowCount.count));
    let availableRows = rowCounts
        .filter(rowCount => rowCount.count === lowestCount)
        .map(rowCount => rowCount.row);
    const lastRow = recentSpawnRows[recentSpawnRows.length - 1];
    if (availableRows.length > 1){
        availableRows = availableRows.filter(row => row !== lastRow);
    }
    const row = availableRows[Math.floor(Math.random() * availableRows.length)];
    recentSpawnRows.push(row);
    if (recentSpawnRows.length > 4){
        recentSpawnRows.shift();
    }
    return row;
}

function prepareUpgradeOptions(){
    upgradeOptions.length = 0;
    const shuffledUpgrades = [...upgradePool].sort(() => Math.random() - 0.5);
    for(let i = 0; i < 3; i++){
        upgradeOptions.push(shuffledUpgrades[i]);
    }
    upgradeHudReady = true;
}

function applyUpgrade(upgrade){
    if (score < upgrade.cost) return false;
    if (
        (upgrade.id === 'autoCollect' && activeUpgrades.autoCollect) ||
        (upgrade.id === 'towerRecycle' && activeUpgrades.towerRecycle) ||
        (upgrade.id === 'bombUnlocked' && activeUpgrades.bombUnlocked)
    ){
        return false;
    }
    score -= upgrade.cost;
    if (upgrade.id === 'autoCollect'){
        activeUpgrades.autoCollect = true;
    } else if (upgrade.id === 'extraHealth'){
        activeUpgrades.extraHealth += 30;
        for(let i = 0; i < defenders.length; i++){
            defenders[i].health += 30;
        }
    } else if (upgrade.id === 'damageBoost'){
        activeUpgrades.damageBoost += 5;
    } else if (upgrade.id === 'towerRecycle'){
        activeUpgrades.towerRecycle = true;
    } else if (upgrade.id === 'bombUnlocked'){
        activeUpgrades.bombUnlocked = true;
        bombPlacementMode = true;
    }
    floatingMessages.push(new floatingMessage(upgrade.name, 395, 120, 32, 'black', 90));
    return true;
}

function handleUpgradeClick(clickX, clickY){
    if (
        clickX >= nextRoundButton.x &&
        clickX <= nextRoundButton.x + nextRoundButton.width &&
        clickY >= nextRoundButton.y &&
        clickY <= nextRoundButton.y + nextRoundButton.height
    ){
        startNextRound();
        return;
    }
    for(let i = 0; i < upgradeSlotRects.length; i++){
        const slot = upgradeSlotRects[i];
        if (
            clickX >= slot.x &&
            clickX <= slot.x + slot.width &&
            clickY >= slot.y &&
            clickY <= slot.y + slot.height
        ){
            if (applyUpgrade(slot.upgrade)){
                upgradeOptions.splice(i, 1);
            }
            return;
        }
    }
}

function startNextRound(){
    if (currentRoundIndex >= rounds.length - 1) return;
    currentRoundIndex++;
    waves = rounds[currentRoundIndex].waves;
    if (rounds[currentRoundIndex].bossTypes){
        const bossTypes = rounds[currentRoundIndex].bossTypes;
        selectedBossType = bossTypes[Math.floor(Math.random() * bossTypes.length)];
    } else {
        selectedBossType = null;
    }
    currentWaveIndex = 0;
    waveEnemiesSpawned = 0;
    currentWaveSpawns = buildWaveSpawns(waves[currentWaveIndex]);
    recentSpawnRows.length = 0;
    warnedSpawnIndexes.length = 0;
    upgradeOptions.length = 0;
    upgradeSlotRects.length = 0;
    upgradeHudReady = false;
    gameWon = false;
    for (const rowY in frozenRows){
        delete frozenRows[rowY];
    }
    nextEnemySpawnFrame = frame + waveBreakFrames;
    floatingMessages.push(new floatingMessage(rounds[currentRoundIndex].name, 350, 260, 42, 'black', 120));
}

function placeBomb(x, y){
    floatingMessages.push(new floatingMessage('BOOM', x + 18, y + 55, 36, 'red', 80));
    for(let i = 0; i < enemies.length; i++){
        const enemyCenterX = enemies[i].x + enemies[i].width / 2;
        const enemyCenterY = enemies[i].y + enemies[i].height / 2;
        if (
            enemyCenterX >= x - cellSize &&
            enemyCenterX <= x + cellSize * 2 &&
            enemyCenterY >= y - cellSize &&
            enemyCenterY <= y + cellSize * 2
        ){
            enemies[i].health = 0;
        }
    }
}

function spawnBooms(amount){
    const currentWave = waves[currentWaveIndex];
    for(let i = 0; i < amount; i++){
        const row = chooseSpawnRow(currentWave.rows);
        const spawnedBoom = new Enemy(row * cellSize, createEnemyConfig('explosive', currentWave));
        spawnedBoom.x = canvas.width + i * 60;
        enemies.push(spawnedBoom);
        if (!enemyPositions.includes(spawnedBoom.y)){
            enemyPositions.push(spawnedBoom.y);
        }
    }
}

function createEnemyConfig(enemyTypeId, wave){
    const enemyType = enemyTypes[enemyTypeId];
    const balance = getDifficultyBalance();
    const currentRound = rounds[currentRoundIndex];
    return {
        name: enemyType.name,
        health: Math.floor((enemyType.health + wave.healthBonus) * balance.healthMultiplier * currentRound.healthMultiplier),
        speed: (enemyType.speed + wave.speedBonus) * currentRound.speedMultiplier,
        speedRandom: enemyType.speedRandom,
        color: enemyType.color,
        reward: enemyType.reward,
        spawnOnDeath: enemyType.spawnOnDeath,
        explosionDamage: enemyType.explosionDamage ? currentRound.explosiveDamage || enemyType.explosionDamage : undefined,
        freezeEvery: enemyType.freezeEvery,
        freezeDuration: enemyType.freezeDuration,
        spawnBoomEvery: enemyType.spawnBoomEvery,
    };
}

function freezeRandomRow(duration){
    const row = Math.floor(Math.random() * 5 + 1);
    const rowY = row * cellSize;
    frozenRows[rowY] = frame + duration;
    floatingMessages.push(new floatingMessage('CONGELADO', 360, rowY + 55, 28, 'deepskyblue', duration));
}

function damageTowersAround(x, y, damage){
    floatingMessages.push(new floatingMessage('-' + damage, x + 20, y + 45, 28, 'red', 80));
    for(let i = 0; i < defenders.length; i++){
        const defenderCenterX = defenders[i].x + defenders[i].width / 2;
        const defenderCenterY = defenders[i].y + defenders[i].height / 2;
        if (
            defenderCenterX >= x - cellSize &&
            defenderCenterX <= x + cellSize * 2 &&
            defenderCenterY >= y - cellSize &&
            defenderCenterY <= y + cellSize * 2
        ){
            defenders[i].health -= damage;
        }
    }
}

//enemigos
class Enemy{
    constructor(verticalPosition, enemyConfig){
        this.x = canvas.width;
        this.y = verticalPosition;
        this.width = cellSize;
        this.height = cellSize;
        this.speed = Math.random() * enemyConfig.speedRandom + enemyConfig.speed;
        this.movement = this.speed;
        this.health = enemyConfig.health;
        this.maxHealth = this.health;
        this.color = enemyConfig.color;
        this.reward = enemyConfig.reward;
        this.enemyName = enemyConfig.name;
        this.spawnOnDeath = enemyConfig.spawnOnDeath;
        this.explosionDamage = enemyConfig.explosionDamage;
        this.freezeEvery = enemyConfig.freezeEvery;
        this.freezeDuration = enemyConfig.freezeDuration;
        this.spawnBoomEvery = enemyConfig.spawnBoomEvery;
        this.timer = 0;
        }
    draw(){ // que se vea el enemigo y su vida
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'black';
        ctx.font = `24px ${gameFont}`;
        ctx.fillText(this.enemyName, this.x +18 , this.y + 28);
        ctx.fillText(Math.floor(this.health), this.x +25 , this.y + 58);

    }
}
    function handleEnemies(){ //movimiento y spawn de enemigos
        for(let i = 0; i < enemies.length; i++){
            enemies[i].timer++;
            if (enemies[i].freezeEvery && enemies[i].timer % enemies[i].freezeEvery === 0){
                freezeRandomRow(enemies[i].freezeDuration);
            }
            if (enemies[i].spawnBoomEvery && enemies[i].timer % enemies[i].spawnBoomEvery === 0){
                spawnBooms(3);
                floatingMessages.push(new floatingMessage('BOOMS', enemies[i].x, enemies[i].y, 30, 'crimson', 90));
            }
            enemies[i].draw();
            enemies[i].x -= enemies[i].movement;
            if (enemies[i].x + enemies[i].width < 0){
                gameOver = true; // si el enemigo llega al final de el cuadro se acabo papa
            }
            if (enemies[i].health <= 0){
                const deadEnemyY = enemies[i].y;
                const deadEnemyX = enemies[i].x;
                const spawnOnDeath = enemies[i].spawnOnDeath;
                const explosionDamage = enemies[i].explosionDamage;
                score += enemies[i].reward;
                floatingMessages.push(new floatingMessage('+' + enemies[i].reward, enemies[i].x, enemies[i].y, 20, 'black'));
                resources.push(new Resource(enemies[i].x, enemies[i].y, enemyCoinValue));
                enemies.splice(i, 1);
                if (explosionDamage){
                    damageTowersAround(deadEnemyX, deadEnemyY, explosionDamage);
                }
                if (spawnOnDeath){
                    const spawnedEnemy = new Enemy(deadEnemyY, createEnemyConfig(spawnOnDeath, waves[currentWaveIndex]));
                    spawnedEnemy.x = deadEnemyX;
                    enemies.push(spawnedEnemy);
                }
                i--;
                if (!enemies.some(enemy => enemy.y === deadEnemyY)){
                    const findThisIndex = enemyPositions.indexOf(deadEnemyY);
                    if (findThisIndex !== -1) enemyPositions.splice(findThisIndex, 1);
                }
            }
        }

        const currentWave = waves[currentWaveIndex];
        if (!currentWave) return;

        const upcomingSpawn = currentWaveSpawns[waveEnemiesSpawned];
        if (
            upcomingSpawn &&
            upcomingSpawn.message &&
            !warnedSpawnIndexes.includes(waveEnemiesSpawned) &&
            frame >= nextEnemySpawnFrame - 120
        ){
            floatingMessages.push(new floatingMessage(upcomingSpawn.message, 330, 280, 42, 'black', 120));
            warnedSpawnIndexes.push(waveEnemiesSpawned);
        }

        if (waveEnemiesSpawned < currentWaveSpawns.length && frame >= nextEnemySpawnFrame){
            const nextSpawn = currentWaveSpawns[waveEnemiesSpawned];
            const row = chooseSpawnRow(currentWave.rows);
            const verticalPosition = row * cellSize;
            const balance = getDifficultyBalance();
            const enemyConfig = createEnemyConfig(nextSpawn.type, currentWave);
            enemies.push(new Enemy(verticalPosition, enemyConfig));
            if (!enemyPositions.includes(verticalPosition)){
                enemyPositions.push(verticalPosition);
            }
            waveEnemiesSpawned++;
            nextEnemySpawnFrame = frame + Math.floor(nextSpawn.delay * balance.delayMultiplier);
        }

        if (waveEnemiesSpawned >= currentWaveSpawns.length && enemies.length === 0){
            if (currentWaveIndex >= waves.length - 1){
                if (!upgradeHudReady){
                    prepareUpgradeOptions();
                }
                gameWon = true;
            } else {
                currentWaveIndex++;
                waveEnemiesSpawned = 0;
                currentWaveSpawns = buildWaveSpawns(waves[currentWaveIndex]);
                recentSpawnRows.length = 0;
                warnedSpawnIndexes.length = 0;
                nextEnemySpawnFrame = frame + waveBreakFrames;
                floatingMessages.push(new floatingMessage('DESCANSO', 370, 260, 44, 'black', 120));
                floatingMessages.push(new floatingMessage(waves[currentWaveIndex].name, 365, 320, 36, 'black', 120));
            }
        }
    }
    //plata
    class Resource{
        constructor(x, y, amount){
            this.width = cellSize * 0.6;
            this.height = cellSize * 0.6;
            this.x = x + (cellSize - this.width) / 2;
            this.y = y + (cellSize - this.height) / 2;
            this.amount = amount;
        }
        draw(){
            ctx.fillStyle = 'gold';
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'orange';
            ctx.lineWidth = 4;
            ctx.stroke();
            ctx.fillStyle = 'yellow';
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'black';
            ctx.font = `30px ${gameFont}`;
            ctx.fillText(this.amount, this.x + 15, this.y + 40);
        }
    }
    function handleResources(){
        for(let i = 0; i < resources.length; i++){
            resources[i].draw();
            if (activeUpgrades.autoCollect || mouse.x !== undefined && mouse.y !== undefined && collision(resources[i],
                 mouse)){
                numberOfResources += resources[i].amount;
                floatingMessages.push(new floatingMessage('+' + resources[i].amount, resources[i].x, resources[i].y, 20, 'gold'));
                resources.splice(i, 1);
                i--;
            }
        }
    }

function drawUpgradeHud(){
    const panelX = 170;
    const panelY = 130;
    const panelWidth = 560;
    const panelHeight = 350;
    upgradeSlotRects.length = 0;

    ctx.fillStyle = 'rgba(245, 245, 245, 0.95)';
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 4;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

    ctx.fillStyle = 'black';
    ctx.font = `38px ${gameFont}`;
    ctx.textAlign = 'center';
    ctx.fillText('RONDA COMPLETA', panelX + panelWidth / 2, panelY + 55);
    ctx.font = `28px ${gameFont}`;
    ctx.fillText('puntos de mejora: ' + score, panelX + panelWidth / 2, panelY + 95);

    for(let i = 0; i < upgradeOptions.length; i++){
        const upgrade = upgradeOptions[i];
        const slotX = panelX + 55 + i * 155;
        const slotY = panelY + 135;
        const canBuy = score >= upgrade.cost;
        ctx.fillStyle = canBuy ? 'white' : '#ddd';
        ctx.fillRect(slotX, slotY, 120, 120);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.strokeRect(slotX, slotY, 120, 120);
        ctx.fillStyle = '#444';
        ctx.font = `22px ${gameFont}`;
        ctx.fillText(upgrade.name, slotX + 60, slotY + 32);
        ctx.font = `18px ${gameFont}`;
        ctx.fillText(upgrade.description, slotX + 60, slotY + 65);
        ctx.font = `22px ${gameFont}`;
        ctx.fillText('$' + upgrade.cost, slotX + 60, slotY + 100);
        upgradeSlotRects.push({
            x: slotX,
            y: slotY,
            width: 120,
            height: 120,
            upgrade: upgrade,
        });
    }

    ctx.font = `22px ${gameFont}`;
    ctx.fillStyle = 'black';
    ctx.fillText('opciones aleatorias', panelX + panelWidth / 2, panelY + 310);
    if (currentRoundIndex < rounds.length - 1){
        nextRoundButton.x = panelX + panelWidth - 190;
        nextRoundButton.y = panelY + panelHeight - 55;
        nextRoundButton.width = 160;
        nextRoundButton.height = 35;
        ctx.fillStyle = 'black';
        ctx.fillRect(nextRoundButton.x, nextRoundButton.y, nextRoundButton.width, nextRoundButton.height);
        ctx.fillStyle = 'white';
        ctx.font = `22px ${gameFont}`;
        ctx.fillText('SIGUIENTE', nextRoundButton.x + nextRoundButton.width / 2, nextRoundButton.y + 24);
    } else {
        nextRoundButton.x = 0;
        nextRoundButton.y = 0;
        nextRoundButton.width = 0;
        nextRoundButton.height = 0;
    }
    ctx.textAlign = 'left';
}

//recursos / plata y loop de animate, status del juego cosas y eso 
function handleGameStatus(){
    const currentWave = waves[currentWaveIndex];
    ctx.fillStyle = 'black';
    ctx.font = `30px ${gameFont}`;
    ctx.fillText('score: ' + score, 650, 40);
    ctx.fillText('plata: ' + numberOfResources, 650, 80);
    ctx.fillText('ronda: ' + (currentRoundIndex + 1) + '/' + rounds.length, 300, 40);
    if (currentWave){
        ctx.fillText('oleada: ' + (currentWaveIndex + 1) + '/' + waves.length, 420, 40);
        ctx.fillText('enemigos: ' + waveEnemiesSpawned + '/' + currentWaveSpawns.length, 420, 80);
    }

        if (gameOver){ 
            ctx.fillStyle = 'black';
            ctx.font = `60px ${gameFont}`;
            ctx.fillText('GAME OVER', 250, 300);
        }
        if (gameWon){
            ctx.fillStyle = 'black';
            ctx.font = `60px ${gameFont}`;
            ctx.fillText('GANASTE LA RONDA', 180, 300);
            drawUpgradeHud();
        }
    }
function animate(){   // loop del juego entero 
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, controlsBar.width, controlsBar.height);
    handleTowerSelector();
    for (let i = 0; i < enemies.length; i++){
        enemies[i].movement = enemies[i].speed;
    }
    handleGameGrid();
    handleDefenders();
    handleResources();
    handleProjectiles();
    handleEnemies();
    handleGameStatus();
    handleFloatingMessages();
    frame++;
   if(!gameOver) requestAnimationFrame(animate);
}
if (document.fonts){
    document.fonts.ready.then(animate);
} else {
    animate();
}

function collision(first, second){ // Colision del beta, no funciona al 100%
if ( !(first.x >= second.x + second.width ||
      first.x + first.width <= second.x ||
      first.y >= second.y + second.height ||
      first.y + first.height <= second.y) 
    ){
        return true; 
    };
}
    
