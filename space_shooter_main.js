class Game {
  constructor() {
    this.gameContainer = document.getElementById('game-container');
    if (!this.gameContainer) {
      console.error('Game container not found');
      return;
    }

    this.player = document.createElement('img');
    this.player.src = 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/4615636f-9036-401e-8bc5-19a0412628d1/d3lg9lb-de0379f6-dc67-4ba7-9650-6482cb851a36.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzQ2MTU2MzZmLTkwMzYtNDAxZS04YmM1LTE5YTA0MTI2MjhkMVwvZDNsZzlsYi1kZTAzNzlmNi1kYzY3LTRiYTctOTY1MC02NDgyY2I4NTFhMzYucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.xqXSfj9reE1-oLYu6-b8lX5omMaKIrRFC4m0xCjcmDw';
    this.player.alt = 'Player';
    this.player.classList.add('player');
    this.gameContainer.appendChild(this.player);

    // Set initial player position for mobile
    this.player.style.left = '50%';
    this.player.style.top = '80%';

    this.enemies = [];
    this.lasers = [];
    this.rocks = [];
    this.bubbleStars = [];
    this.score = 0;
    this.health = 100;
    this.isPlaying = false;
    this.timeLeft = 60;
    this.timerInterval = null;

    this.bindEvents();
    this.createBubbleStars();
  }

  bindEvents() {
    this.gameContainer.addEventListener('mousemove', (e) => {
      const rect = this.gameContainer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      this.player.style.left = `${Math.min(
        this.gameContainer.offsetWidth - this.player.offsetWidth,
        Math.max(0, x - this.player.offsetWidth / 2)
      )}px`;

      this.player.style.top = `${Math.min(
        this.gameContainer.offsetHeight - this.player.offsetHeight,
        Math.max(0, y - this.player.offsetHeight / 2)
      )}px`;
    });

    this.gameContainer.addEventListener('click', () => {
      if (this.isPlaying) {
        this.createLaser();
      }
    });

    // Touch events for mobile
    this.gameContainer.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.gameContainer.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      this.player.style.left = `${Math.min(
        this.gameContainer.offsetWidth - this.player.offsetWidth,
        Math.max(0, x - this.player.offsetWidth / 2)
      )}px`;

      this.player.style.top = `${Math.min(
        this.gameContainer.offsetHeight - this.player.offsetHeight,
        Math.max(0, y - this.player.offsetHeight / 2)
      )}px`;
    });

    // Shoot button for mobile
    const shootBtn = document.getElementById('shoot-btn');
    if (shootBtn) {
      shootBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (this.isPlaying) {
          this.createLaser();
        }
      });
    }

    // Joystick functionality
    const joystickBase = document.getElementById('joystick-base');
    const joystickStick = document.getElementById('joystick-stick');
    let joystickActive = false;

    if (joystickBase && joystickStick) {
      joystickBase.addEventListener('touchstart', (e) => {
        e.preventDefault();
        joystickActive = true;
      });

      joystickBase.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (joystickActive) {
          const touch = e.touches[0];
          const rect = joystickBase.getBoundingClientRect();
          let x = touch.clientX - rect.left - rect.width / 2;
          let y = touch.clientY - rect.top - rect.height / 2;

          const maxDistance = rect.width / 2;
          const distance = Math.min(maxDistance, Math.sqrt(x * x + y * y));
          const angle = Math.atan2(y, x);

          x = Math.cos(angle) * distance;
          y = Math.sin(angle) * distance;

          joystickStick.style.transform = `translate(${x}px, ${y}px)`;

          // Move player based on joystick position
          const playerX = parseFloat(this.player.style.left) || this.gameContainer.offsetWidth / 2;
          const playerY = parseFloat(this.player.style.top) || this.gameContainer.offsetHeight / 2;

          this.player.style.left = `${Math.min(
            this.gameContainer.offsetWidth - this.player.offsetWidth,
            Math.max(0, playerX + x / 10)
          )}px`;

          this.player.style.top = `${Math.min(
            this.gameContainer.offsetHeight - this.player.offsetHeight,
            Math.max(0, playerY + y / 10)
          )}px`;
        }
      });

      joystickBase.addEventListener('touchend', () => {
        joystickActive = false;
        joystickStick.style.transform = 'translate(0px, 0px)';
      });
    }

    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        this.start();
      });
    }

    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        this.start();
      });
    }
  }

  start() {
    this.isPlaying = true;
    this.score = 0;
    this.health = 100;
    this.timeLeft = 60;
    this.enemies = [];
    this.lasers = [];
    this.rocks = [];
    const startScreen = document.getElementById('start-screen');
    const gameOverScreen = document.getElementById('game-over');
    if (startScreen) startScreen.classList.add('hidden');
    if (gameOverScreen) gameOverScreen.classList.add('hidden');
    this.updateHUD();
    this.timerInterval = setInterval(() => this.updateTimer(), 1000);
    this.spawnEnemies();
    this.spawnRocks();

    this.gameLoop();
  }

  updateTimer() {
    this.timeLeft--;
    const timerElement = document.getElementById('timer');
    if (timerElement) {
      timerElement.textContent = `Time: ${this.timeLeft}s`;
    }
    if (this.timeLeft <= 0) {
      this.gameOver();
    }
  }

  createBubbleStars() {
    for (let i = 0; i < 50; i++) {
      const star = document.createElement('div');
      star.classList.add('bubble-star');
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.animationDuration = `${Math.random() * 3 + 2}s`;
      this.gameContainer.appendChild(star);
      this.bubbleStars.push(star);
    }
  }

  updateBubbleStars() {
    this.bubbleStars.forEach(star => {
      const top = parseFloat(star.style.top);
      star.style.top = `${(top + 0.1) % 100}%`;
    });
  }
  createLaser() {
    const laser = document.createElement('div');
    laser.classList.add('laser');
    const playerRect = this.player.getBoundingClientRect();
    const gameRect = this.gameContainer.getBoundingClientRect();
  
    laser.style.left = `${playerRect.left + playerRect.width / 2 - gameRect.left - 5}px`; // Adjust laser to start at player's position
    laser.style.top = `${playerRect.top - gameRect.top - 20}px`; // Just above the player
    this.gameContainer.appendChild(laser);
  
    this.lasers.push(laser);
  }
  

  spawnEnemies() {
    this.enemySpawner = setInterval(() => {
      if (this.isPlaying) {
        const enemy = document.createElement('img');
        enemy.src = 'https://jerinrubaiya33.github.io/Pics/pngtree-starship-rocketship-kids-toy-picture-image_7824016-removebg-preview.png';
        enemy.alt = 'Enemy';
        enemy.classList.add('enemy');
        enemy.style.left = `${Math.random() * (this.gameContainer.offsetWidth - 30)}px`;
        enemy.style.top = `0px`;
        this.gameContainer.appendChild(enemy);
        this.enemies.push(enemy);

        // Increase enemy speed based on remaining time
        const speed = 2 + (60 - this.timeLeft) / 10;
        enemy.dataset.speed = speed;
      }
    }, Math.max(500, 1000 - (60 - this.timeLeft) * 10)); // Spawn enemies faster over time
  }

  spawnRocks() {
    this.rockSpawner = setInterval(() => {
      if (this.isPlaying) {
        const rock = document.createElement('img');
        rock.src = 'https://jerinrubaiya33.github.io/Pics/rock.png';
        rock.alt = 'Rock';
        rock.classList.add('rock');
        rock.style.left = `${Math.random() * (this.gameContainer.offsetWidth - 30)}px`;
        rock.style.top = `0px`;
        this.gameContainer.appendChild(rock);
        this.rocks.push(rock);

        // Increase rock speed based on remaining time
        const speed = 1 + (60 - this.timeLeft) / 15;
        rock.dataset.speed = speed;
      }
    }, Math.max(1000, 2000 - (60 - this.timeLeft) * 15)); // Spawn rocks faster over time
  }

  createFireEffect(x, y, size = 'medium') {
    const fire = document.createElement('div');
    fire.classList.add('fire', `fire-${size}`);
    fire.style.left = `${x}px`;
    fire.style.top = `${y}px`;
    this.gameContainer.appendChild(fire);

    setTimeout(() => fire.remove(), 1000);
  }

  createEnergyExplosion(x, y, size = 'medium') {
    // Create main explosion
    const explosion = document.createElement('div');
    explosion.classList.add('energy-explosion', `explosion-${size}`);
    explosion.style.left = `${x}px`;
    explosion.style.top = `${y}px`;
    this.gameContainer.appendChild(explosion);

    // Create particles
    for (let i = 0; i < 12; i++) {
      const particle = document.createElement('div');
      particle.classList.add('explosion-particle', `explosion-${size}`);
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.transform = `rotate(${i * 30}deg)`;
      this.gameContainer.appendChild(particle);

      setTimeout(() => particle.remove(), 800);
    }

    setTimeout(() => explosion.remove(), 800);
  }


  updateLasers() {
    this.lasers = this.lasers.filter((laser) => {
      const top = parseFloat(laser.style.top);
      laser.style.top = `${top - 10}px`;  // Move the laser upward by 10px per frame
  
      // Remove the laser if it goes off-screen
      if (top < 0) {
        laser.remove();
        return false;
      }
      return true;
    });
  }
  

  updateEnemies() {
    this.enemies = this.enemies.filter((enemy) => {
      const speed = parseFloat(enemy.dataset.speed) || 2;
      const top = parseFloat(enemy.style.top);
      enemy.style.top = `${top + speed}px`;

      const enemyRect = enemy.getBoundingClientRect();
      const playerRect = this.player.getBoundingClientRect();

      if (
        enemyRect.left < playerRect.right &&
        enemyRect.right > playerRect.left &&
        enemyRect.top < playerRect.bottom &&
        enemyRect.bottom > playerRect.top
      ) {
        this.health -= 10;
        this.updateHUD();
        this.createEnergyExplosion(enemyRect.left + enemyRect.width / 2, enemyRect.top + enemyRect.height / 2, 'small');
        enemy.remove();

        if (this.health <= 0) {
          this.gameOver();
        }
        return false;
      }

      if (top > this.gameContainer.offsetHeight) {
        enemy.remove();
        return false;
      }

      return true;
    });
  }

  updateRocks() {
    this.rocks = this.rocks.filter((rock) => {
      const speed = parseFloat(rock.dataset.speed) || 1;
      const top = parseFloat(rock.style.top);
      rock.style.top = `${top + speed}px`;

      const rockRect = rock.getBoundingClientRect();
      const playerRect = this.player.getBoundingClientRect();

      if (
        rockRect.left < playerRect.right &&
        rockRect.right > playerRect.left &&
        rockRect.top < playerRect.bottom &&
        rockRect.bottom > playerRect.top
      ) {
        this.createEnergyExplosion(playerRect.left + playerRect.width / 2, playerRect.top + playerRect.height / 2, 'large');
        this.gameOver();
        return false;
      }

      if (top > this.gameContainer.offsetHeight) {
        rock.remove();
        return false;
      }

      return true;
    });
  }

  checkCollisions() {
    for (let laserIndex = this.lasers.length - 1; laserIndex >= 0; laserIndex--) {
      const laser = this.lasers[laserIndex];
      const laserRect = laser.getBoundingClientRect();

      for (let enemyIndex = this.enemies.length - 1; enemyIndex >= 0; enemyIndex--) {
        const enemy = this.enemies[enemyIndex];
        const enemyRect = enemy.getBoundingClientRect();

        if (
          laserRect.left < enemyRect.right &&
          laserRect.right > enemyRect.left &&
          laserRect.top < enemyRect.bottom &&
          laserRect.bottom > enemyRect.top
        ) {
          this.score += 100;
          this.updateHUD();

          this.createEnergyExplosion(enemyRect.left + enemyRect.width / 2, enemyRect.top + enemyRect.height / 2, 'medium');
          enemy.remove();
          this.enemies.splice(enemyIndex, 1);

          laser.remove();
          this.lasers.splice(laserIndex, 1);
          break;
        }
      }

      for (let rockIndex = this.rocks.length - 1; rockIndex >= 0; rockIndex--) {
        const rock = this.rocks[rockIndex];
        const rockRect = rock.getBoundingClientRect();

        if (
          laserRect.left < rockRect.right &&
          laserRect.right > rockRect.left &&
          laserRect.top < rockRect.bottom &&
          laserRect.bottom > rockRect.top
        ) {
          this.score += 50;
          this.updateHUD();

          this.createFireEffect(rockRect.left, rockRect.top, 'small');
          rock.remove();
          this.rocks.splice(rockIndex, 1);

          laser.remove();
          this.lasers.splice(laserIndex, 1);
          break;
        }
      }
    }
  }

  updateHUD() {
    const scoreElement = document.getElementById('score');
    const healthElement = document.getElementById('health');
    const timerElement = document.getElementById('timer');
    if (scoreElement) scoreElement.textContent = `Score: ${this.score}`;
    if (healthElement) healthElement.textContent = `Health: ${this.health}%`;
    if (timerElement) timerElement.textContent = `Time: ${this.timeLeft}s`;
  }

  animateScore() {
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
      scoreElement.classList.add('score-updated');
      setTimeout(() => scoreElement.classList.remove('score-updated'), 300);
    }
  }

  gameOver() {
    this.isPlaying = false;
    clearInterval(this.enemySpawner);
    clearInterval(this.rockSpawner);
    clearInterval(this.timerInterval);

    this.enemies.forEach((enemy) => enemy.remove());
    this.enemies = [];

    this.lasers.forEach((laser) => laser.remove());
    this.lasers = [];

    this.rocks.forEach((rock) => rock.remove());
    this.rocks = [];

    const gameOverScreen = document.getElementById('game-over');
    if (gameOverScreen) {
      gameOverScreen.classList.remove('hidden');
      gameOverScreen.classList.add('game-over-animation');
    }

    const finalScoreElement = document.getElementById('final-score');
    if (finalScoreElement) {
      finalScoreElement.textContent = `Your final score is: ${this.score}`;
    }

    const joystickArea = document.getElementById('joystick-area');
    const shootBtn = document.getElementById('shoot-btn');
    if (joystickArea) joystickArea.style.display = 'none';
    if (shootBtn) shootBtn.style.display = 'none';

    this.createEnergyExplosion(
      this.gameContainer.offsetWidth / 2,
      this.gameContainer.offsetHeight / 2,
      'large'
    );
  }

  gameLoop() {
    if (!this.isPlaying) return;

    this.updateLasers();
    this.updateEnemies();
    this.updateRocks();
    this.checkCollisions();
    this.updateBubbleStars();

    requestAnimationFrame(() => this.gameLoop());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new Game();
});

