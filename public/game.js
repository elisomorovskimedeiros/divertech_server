console.log("Script iniciado");

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const backgroundMusic = document.getElementById('backgroundMusic');
const pauseButton = document.getElementById('pauseButton');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const GRAVITY = 0.45;
const JUMP_STRENGTH = -15;
let OBSTACLE_FREQUENCY = 2000; // em milissegundos
let lastObstacleTime = 0;
let score = 0;
let gamePaused = false;
let gameRunning = true; // Novo estado para controlar o jogo
let obstacleSpeed = 5;

const player = {
    x: 50,
    y: canvas.height - 300 - 10, // Ajustar a posição inicial do jogador
    width: 118,  // Nova largura
    height: 300, // Nova altura
    dy: 0,
    jumping: false,
    sprite: 'player.png', // Substitua pelo caminho da sua imagem de personagem
    image: new Image()
};
player.image.src = player.sprite;

const obstacles = [];

function drawPlayer() {
    ctx.drawImage(player.image, player.x, player.y, player.width, player.height);
}

function drawObstacle(obstacle) {
    ctx.fillStyle = 'red';
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
}

function updatePlayer() {
    if (player.jumping) {
        player.dy += GRAVITY;
        player.y += player.dy;

        if (player.y >= canvas.height - player.height - 10) { // Ajustar a posição final do jogador
            player.y = canvas.height - player.height - 10;
            player.jumping = false;
            player.dy = 0;
        }
    }
}

function createObstacle() {
    console.log("Criando obstáculo");
    const height = 108;
    const width = 30; // Nova largura ajustada
    const x = canvas.width;
    const y = canvas.height - height - 10;

    obstacles.push({ x, y, width, height, passed: false });
    console.log("Obstáculo criado:", { x, y, width, height });
}

function updateObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= obstacleSpeed;

        if (obstacles[i].x + obstacles[i].width < 0) {
            // Remove o obstáculo que saiu da tela
            obstacles.splice(i, 1);
        } else {
            // Incrementa a pontuação se o jogador passar pelo obstáculo
            if (!obstacles[i].passed && obstacles[i].x + obstacles[i].width < player.x) {
                score++;
                obstacles[i].passed = true;
                scoreElement.textContent = `Score: ${score}`;

                // Aumenta a velocidade dos obstáculos a cada 5 pontos
                if (score % 5 === 0) {
                    obstacleSpeed += 1;
                    OBSTACLE_FREQUENCY = Math.max(500, OBSTACLE_FREQUENCY - 200); // Limita a frequência mínima a 500ms
                }
            }
        }
    }
}


function detectCollision() {
    for (let i = 0; i < obstacles.length; i++) {
        let obstacle = obstacles[i];
        if (!gamePaused && player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y) {
            gamePaused = true; // Pausar o jogo
            alert('Game Over');
            resetGame();
        }
    }
}

function resetGame() {
    obstacles.splice(0, obstacles.length); // Limpar todos os obstáculos
    score = 0; // Resetar o score
    scoreElement.textContent = `Score: ${score}`;
    gamePaused = false; // Retomar o jogo
    obstacleSpeed = 5; // Resetar a velocidade dos obstáculos
    OBSTACLE_FREQUENCY = 2000; // Resetar a frequência dos obstáculos
}

function gameLoop(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameRunning) {
        if (!gamePaused && timestamp - lastObstacleTime > OBSTACLE_FREQUENCY) {
            createObstacle();
            lastObstacleTime = timestamp;
        }

        if (!gamePaused) {
            updatePlayer();
            updateObstacles();
            detectCollision();
        }

        drawPlayer();
        obstacles.forEach(drawObstacle);
    }

    requestAnimationFrame(gameLoop);
}

canvas.addEventListener('touchstart', (event) => {
    event.preventDefault(); // Evita o comportamento padrão do toque (como scroll)
    console.log('teste');

    const touch = event.touches[0];
    const touchX = touch.clientX;
    const touchY = touch.clientY;

    // Verifica se o toque ocorreu dentro da área do jogador
    //if (touchX >= player.x && touchX <= player.x + player.width &&
        //touchY >= player.y && touchY <= player.y + player.height) {
        if (!player.jumping) {
            player.dy = JUMP_STRENGTH;
            player.jumping = true;
        }
    //}
});

// Função para pausar e retomar o jogo
function togglePause() {
    if (gamePaused) {
        gamePaused = false;
        pauseButton.textContent = 'Pause';
        backgroundMusic.play();
    } else {
        gamePaused = true;
        pauseButton.textContent = 'Resume';
        backgroundMusic.pause();
    }
}

pauseButton.addEventListener('click', togglePause);

backgroundMusic.play().then(() => {
    console.log("Música de fundo tocando");
}).catch((error) => {
    console.error("Erro ao tocar a música de fundo:", error);
});

requestAnimationFrame(gameLoop);

console.log("Script finalizado");
