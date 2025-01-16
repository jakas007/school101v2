
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// Player object
let ship = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 50,
    height: 50,
    speed: 5, // Adjusted for smoother movement
    dx: 0,
    dy: 0,
    shield: false,
    health: 100 // Added health for the player
};

let bullets = [];
let enemies = [];
let score = 0;
let gameOver = false;
let shieldTimer = 0; // Timer for the shield

const enemyTypes = [
    { width: 40, height: 40, speed: 2, health: 50, color: 'green' },
    { width: 60, height: 60, speed: 1, health: 100, color: 'red' },
    { width: 30, height: 30, speed: 3, health: 30, color: 'yellow' }
];

// Draw the player's ship
function drawShip() {
    ctx.fillStyle = ship.shield ? 'cyan' : 'blue';
    ctx.fillRect(ship.x, ship.y, ship.width, ship.height);

    // Draw player health bar
    ctx.fillStyle = 'red';
    ctx.fillRect(ship.x, ship.y - 10, ship.width * (ship.health / 100), 5);
}

// Draw a bullet
function drawBullet(bullet) {
    ctx.fillStyle = 'red';
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
}

// Draw an enemy
function drawEnemy(enemy) {
    ctx.fillStyle = enemy.color;
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

    // Draw enemy health bar
    ctx.fillStyle = 'black';
    ctx.fillRect(enemy.x, enemy.y - 10, enemy.width * (enemy.health / 100), 5);
}

// Update the player's position
function updateShip() {
    ship.x += ship.dx;
    ship.y += ship.dy;

    // Boundary constraints
    if (ship.x < 0) ship.x = 0;
    if (ship.x + ship.width > canvas.width) ship.x = canvas.width - ship.width;
    if (ship.y < 0) ship.y = 0;
    if (ship.y + ship.height > canvas.height) ship.y = canvas.height - ship.height;
}

// Update bullets
function updateBullets() {
    bullets.forEach((bullet, index) => {
        bullet.y -= bullet.speed;
        if (bullet.y < 0) bullets.splice(index, 1);
    });
}

// Spawn enemies
function spawnEnemy() {
    const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    const enemy = {
        x: Math.random() * (canvas.width - type.width),
        y: -type.height,
        width: type.width,
        height: type.height,
        speed: type.speed,
        health: type.health,
        color: type.color
    };
    enemies.push(enemy);
}

// Update enemies
function updateEnemies() {
    enemies.forEach((enemy, index) => {
        enemy.y += enemy.speed;
        if (enemy.y > canvas.height) enemies.splice(index, 1); // Remove if off-screen

        // Check collision with the player
        if (
            ship.x < enemy.x + enemy.width &&
            ship.x + ship.width > enemy.x &&
            ship.y < enemy.y + enemy.height &&
            ship.y + ship.height > enemy.y
        ) {
            ship.health -= 10; // Player takes damage
            enemies.splice(index, 1); // Remove the enemy
            if (ship.health <= 0) gameOver = true; // End the game if health is 0
        }
    });
}

// Shoot a bullet
function shoot() {
    bullets.push({
        x: ship.x + ship.width / 2 - 2.5,
        y: ship.y,
        width: 5,
        height: 10,
        speed: 7 // Faster bullets
    });
}

// Handle bullet and enemy collision
function handleCollisions() {
    bullets.forEach((bullet, bIndex) => {
        enemies.forEach((enemy, eIndex) => {
            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y
            ) {
                enemy.health -= 20; // Reduce enemy health
                bullets.splice(bIndex, 1); // Remove bullet
                if (enemy.health <= 0) enemies.splice(eIndex, 1); // Remove enemy if health is 0
            }
        });
    });
}

// Draw the game
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height); // Draw background
    drawShip();
    bullets.forEach(drawBullet);
    enemies.forEach(drawEnemy);

    // Display shield timer if active
    if (ship.shield) {
        ctx.fillStyle = 'white';
        ctx.fillText(`Shield: ${Math.ceil(shieldTimer / 60)}s`, 10, 20);
    }

    // Display score
    ctx.fillStyle = 'white';
    ctx.fillText(`Score: ${score}`, canvas.width - 100, 20);
}

// Update game state
function update() {
    if (!gameOver) {
        updateShip();
        updateBullets();
        updateEnemies();
        handleCollisions();

        // Update shield timer
        if (ship.shield) {
            shieldTimer--;
            if (shieldTimer <= 0) ship.shield = false;
        }

        // Spawn enemies periodically
        if (Math.random() < 0.02) spawnEnemy();
    }
}

// Main game loop
function gameLoop() {
    draw();
    update();
    if (!gameOver) requestAnimationFrame(gameLoop);
    else alert('Game Over!');
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') ship.dx = -ship.speed;
    if (e.key === 'ArrowRight') ship.dx = ship.speed;
    if (e.key === 'ArrowUp') ship.dy = -ship.speed;
    if (e.key === 'ArrowDown') ship.dy = ship.speed;
    if (e.key === ' ') shoot();
});

document.addEventListener('keyup', (e) => {
    if (['ArrowLeft', 'ArrowRight'].includes(e.key)) ship.dx = 0;
    if (['ArrowUp', 'ArrowDown'].includes(e.key)) ship.dy = 0;
});

// Load assets and start the game
const background = new Image();
background.src = 'space-bg.jpg';
background.onload = () => {
    gameLoop();
};
