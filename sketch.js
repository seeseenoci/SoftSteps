// Add a variable to track which control scheme is being used
let controlScheme = "arrows"; // "arrows" or "wasd"


let gameState = "start"; // 'start' or 'playing' or 'gameOver' or 'paused'
let player;
let platforms = [];
let sensitivity = 0;
let maxSensitivity = 100;
let popupMessage = "";
let popupTimer = 0;
let collectibles = [];
let currentLevel = 1;
let maxLevel = 4; // Updated to 4 levels
let orbImage; // Variable to store the orb image
let checkpointImage; // Variable to store the checkpoint image
let flowerTile1; // First flower tile image
let flowerTiles4; // Second flower tile image
let regularTile3; // Regular tile image
let level1BG; // Level 1 background image
let level2BG; // Level 2 background image
let level3BG; // Level 3 background image
let level4BG; // Level 4 background image (Boss BG)
let rock3; // Rock image for rough surfaces
let spikes1; // Spikes image for sharp surfaces
let playerGif; // Idle player character GIF
let playerWalkingGif; // Walking player character GIF
let playerJumpingGif; // Jumping player character GIF
let playerSleepIdleGif; // Sleepy idle player character GIF
let playerSleepWalkingGif; // Sleepy walking player character GIF
let catIdleGif; // Cat idle animation for level 4 checkpoint

let startImage; // Image for the start screen
let instructionsPage;
let startButtonImg;
let restartImg;
let overwhelmedImg;

let customFont;
let endScreenBG; // Image for the end screen

let bgMusic;
let healSound;
let jumpSound;
let meowSound;
let meowPlayed = false;

let overwhelmed = false;

const popupMessages = [
 "Oh, this surface feels too overwhelming for me."
];


function preload() {
 // Load the orb image
 orbImage = loadImage('Orb.png');
 // Load the checkpoint image
 checkpointImage = loadImage('Checkpoint 1.png');
 // Load the tile images
 flowerTile1 = loadImage('Flower Tile 1.png');
 flowerTiles4 = loadImage('Flower Tiles 4.png');
 regularTile3 = loadImage('Regular Tile 3.png');
 // Load the background images
 level1BG = loadImage('Level 1 BG.png');
 level2BG = loadImage('Level 2 BG.png');
 level3BG = loadImage('Level 3 BG.png');
 level4BG = loadImage('Boss BG.png'); // Load level 4 background
 // Load the rock image
 rock3 = loadImage('Rock 3.png');
 // Load the spikes image
 spikes1 = loadImage('Spikes 1.png');
 // Load player character GIFs
 playerGif = loadImage('idle_GBDA.gif');
 playerWalkingGif = loadImage('walking_GBDA.gif');
 playerJumpingGif = loadImage('jumping_GBDA.gif');
 playerSleepIdleGif = loadImage('sleepidle_GBDA.gif');
 playerSleepWalkingGif = loadImage('sleepwalking_GBDA.gif');
 // Load cat idle GIF for level 4
 catIdleGif = loadImage('catidle.gif');


 startImage = loadImage('titlepage.png'); // Replace with your actual file name
 instructionsPage = loadImage('instructionspage.png');
 startButtonImg = loadImage('startbutton.png');
 restartImg = loadImage('restart.png');
 overwhelmedImg = loadImage('overwhelmed.png');


 customFont = loadFont('pixelsans.ttf');


 redbar = loadImage('redbar.png');
 endScreenBG = loadImage('endscreen.png');
 bgMusic = loadSound('Best Friend (8 Bits) - Lofi Hip Hop (8 Bits Music)  [HD] 1080p (1).mp3');
 healSound = loadSound('Heal Sound Effect.mp3');
 jumpSound = loadSound('jumpsound.mp3');
 meowSound = loadSound('meow.mp3')
}


function setup() {
 textFont(customFont);
 createCanvas(windowWidth, windowHeight);
 player = new Player();
 generateLevel(currentLevel);
}


function draw() {
 if (gameState === "start") {
   background(50);
   drawStartScreen();
 } else if (gameState === "instructions") {
   drawInstructionScreen();
 } else if (gameState === "overwhelmed") {
    drawOverwhelmedScreen();
 } else if (gameState === "playing") {
   // Use different backgrounds based on current level
   if (currentLevel === 1) {
     image(level1BG, 0, 0, width, height);
   } else if (currentLevel === 2) {
     image(level2BG, 0, 0, width, height);
   } else if (currentLevel === 3) {
     image(level3BG, 0, 0, width, height);
   } else if (currentLevel === 4) {
     image(level4BG, 0, 0, width, height); // Use Boss BG for level 4
   }
   playGame();
 } else if (gameState === "paused") {
   drawPausedScreen();
 } else if (gameState === "gameOver") {
   gameState = "start";
   sensitivity = 0; // Reset sensitivity to 0 when restarting from game over
   drawGameOverScreen();
 } else if (gameState === "levelComplete") {
   background(50, 150, 50);
   drawLevelCompleteScreen();
 }
}


class Collectible {
 constructor(x, y) {
   this.x = x;
   this.y = y;
   this.size = 50; // Increased from 30 to 50 to make orbs bigger
   this.rotationSpeed = random(0.02, 0.05); // Each orb rotates at a slightly different speed
   this.rotation = random(0, TWO_PI); // Random starting rotation
   this.bobHeight = random(3, 6); // How much the orb bobs up and down
   this.bobSpeed = random(0.05, 0.1); // Speed of bobbing animation
   this.bobOffset = random(0, TWO_PI); // Random starting point in bob cycle
 }
  display() {
   push(); // Save the current drawing state
  
   // Add a subtle glow effect
   noStroke();
   fill(255, 215, 0, 50); // Gold color with transparency
   ellipse(this.x, this.y + sin(frameCount * this.bobSpeed + this.bobOffset) * this.bobHeight, this.size * 1.3);
  
   // Bob up and down
   let yOffset = sin(frameCount * this.bobSpeed + this.bobOffset) * this.bobHeight;
  
   // Position at the center point
   translate(this.x, this.y + yOffset);
  
   // Rotate to simulate a spinning orb
   rotate(this.rotation);
   this.rotation += this.rotationSpeed;
  
   // Draw the orb image
   // Draw the image centered at the current position
   imageMode(CENTER);
   image(orbImage, 0, 0, this.size, this.size);
  
   pop(); // Restore the drawing state
 }
  checkCollision(player) {
   // Calculate distance between player's center and collectible
   let playerCenterX = player.x + player.w / 2;
   let playerCenterY = player.y + player.h / 2;
  
   // Check if player is close enough to collect
   if (dist(playerCenterX, playerCenterY, this.x, this.y) < this.size + player.w / 2) {
     // Visual feedback - gold sparkle effect
     for (let i = 0; i < 10; i++) {
       let angle = random(0, TWO_PI);
       let distance = random(10, 30);
       let x = this.x + cos(angle) * distance;
       let y = this.y + sin(angle) * distance;
      
       noStroke();
       fill(255, 215, 0, 150 - distance * 3);
       ellipse(x, y, random(3, 8));
     }
    
     // Show message
     popupMessage = "Ahh, that feels soothing...";
     popupTimer = 60;
     if (healSound && !healSound.isPlaying()) {
       healSound.setVolume(1); // Optional: adjust volume
       healSound.play();
     }
    
    
     return true;
   }
   return false;
 }
}

function drawStartScreen() {
 imageMode(CENTER);
 image(startImage, width / 2, height / 2, width, height); // Adjust size if needed
  // Draw the start button image
 imageMode(CENTER);
 image(startButtonImg, width / 2, height / 2 + 120, 300, 150); // Adjust size if needed
}


function drawInstructionScreen() {
 imageMode(CENTER);
 image(instructionsPage, width / 2, height / 2, width, height); // Adjust size if needed
  fill(255);
 textAlign(CENTER, TOP);
 textSize(22);
 stroke(95, 112, 50);
 strokeWeight(3.5);
 textLeading(30); // 👈 Add this line to increase line spacing
 text("Your character is SENSITIVE to different textures.\n" , width / 2, 220);
 textSize(30);
 text("Help them look for their cat.\n", width / 2, 245);


 stroke(132, 53, 94);
 textSize(22);
 text("WATCH your sensitivity bar & steer clear of rough, sharp platforms! \n" +
      "Collect soothing orbs to stay CALM & reach the checkpoint to complete the level!\n\n"
      , width / 2, 300);


 stroke(95, 112, 50);
 textSize(20);
  // Controls section
 let controlText;
 if (controlScheme === "arrows") {
   controlText = "Use the ARROW KEYS to move.\nPress SPACE to jump, P to pause";
 } else {
   controlText = "Use the W, A, D keys to move.\nPress W to jump, P to pause.";
 }
 text(controlText, width / 2, 390);
  // Add control scheme toggle buttons
 noStroke();
  // Arrows button
 if (controlScheme === "arrows") {
   fill(138, 161, 72); // Highlight selected control
 } else {
   fill(95, 112, 50);
 }
 rect(width / 2 - 150, height / 2 + 65, 130, 50, 10);
  // WASD button
 if (controlScheme === "wasd") {
   fill(138, 161, 72); // Highlight selected control
 } else {
   fill(95, 112, 50);
 }
 rect(width / 2 + 20, height / 2 + 65, 130, 50, 10);
  // Button labels
 fill(255);
 textAlign(CENTER, CENTER);
 text("ARROW KEYS", width / 2 - 85, height / 2 + 85);
 text("WASD", width / 2 + 85, height / 2 + 85);


 // Draw the start button image
 imageMode(CENTER);
 image(startButtonImg, width / 2, height / 2 + 200, 300, 150); // Adjust size if needed
}

function drawOverwhelmedScreen() {
  imageMode(CENTER);
  image(overwhelmedImg, width / 2, height / 2, width, height); // Adjust size if needed

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(40);
  text("Oh no! You Got Overwhelmed.", width / 2, height / 3);
  textSize(28);
  text("Take a breath, then try again from Level 1.", width / 2, height / 3 + 60);
  text("Don't forget you can take a break by pressing 'p'.", width / 2, height / 3 + 100)

  imageMode(CENTER);
  image(restartImg, width / 2, height / 2 + 80, 200, 180);
}

function drawGameOverScreen() {
 background(50);
 fill(255);
 textAlign(CENTER, CENTER);
 textSize(40);
 text("Ah the Sensations Were Too Distracting.", width / 2, height / 3);
 textSize(30);
 text("Let's Try to Put the Player at Ease Again.", width / 2, (height / 3) + 60);
 text("You reached level " + currentLevel + " of " + maxLevel, width / 2, (height / 3) + 120);


 textSize(20);
 imageMode(CENTER);
 image(restartImg, width / 2, height / 2 + 80, 200, 180);
}


function drawLevelCompleteScreen() {
 // Use the endscreen background image
 imageMode(CORNER);
 image(endScreenBG, 0, 0, width, height);
  fill(255);
 textAlign(CENTER, CENTER);
 textSize(40);
  if (currentLevel > maxLevel) {
   text("Congratulations! You Found Your Cat!", width / 2, height / 3);
   textSize(30);
   text("You've mastered your sensitivity & completed your journey.", width / 2, (height / 3) + 50);
   sensitivity = 0;
  
   // Play meow sound once
   if (!meowPlayed) {
       meowSound.setVolume(0.5);
       meowSound.play();
       meowPlayed = true;
   }
  
   // Draw player character and cat in the center of the screen
   // Calculate sizes that maintain aspect ratios - bigger size
   let playerWidth = 200;
   let playerHeight = playerWidth * (playerGif.height / playerGif.width);
  
   let catWidth = 140;
   let catHeight = catWidth * (catIdleGif.height / catIdleGif.width);
  
   // Position the characters more to the left
   let startX = width / 3 - playerWidth / 2;
  
   // Draw the player
   imageMode(CORNER);
   image(playerGif, startX, height / 2 + 40, playerWidth, playerHeight);
  
   // Draw the cat
   image(catIdleGif, startX + playerWidth - 10, height / 2 + 200, catWidth, catHeight);
 } else {
   text("Level " + (currentLevel - 1) + " Complete!", width / 2, height / 3);
   textSize(30);
   text("Get ready for Level " + currentLevel, width / 2, (height / 3) + 50);
 }


  fill(138, 161, 72);
 rect(width / 2 - 80, height / 2 - 50, 160, 60, 10);
 fill(255);
 text("CONTINUE", width / 2, height / 2 - 25);
}


function drawPausedScreen() {
 fill(0, 0, 0, 180);
 rect(0, 0, width, height);
 fill(255);
 textSize(30);
 textAlign(CENTER, CENTER);
 text("Paused", width / 2, height / 2);
 textSize(20);
 text("Press 'P' to continue", width / 2, height / 2 + 40);
}


function playGame() {
 player.update();
  // Keep player within screen bounds
 player.x = constrain(player.x, 0, width - player.w);
  // Draw level indicator
 fill(255);
 textSize(20);
 text("Level: " + currentLevel + "/" + maxLevel, width - 80, 30);
  platforms.forEach(platform => {
   platform.display();
   platform.checkCollision(player);
 });


 for (let i = collectibles.length - 1; i >= 0; i--) {
   collectibles[i].display();
   if (collectibles[i].checkCollision(player)) {
     collectibles.splice(i, 1);
     sensitivity = max(0, sensitivity - 5);
   }
 }


 player.display();
 drawSensitivityMeter();
  if (popupTimer > 0) {
   popupTimer--;
    // Draw the redbar image instead of the white rectangle
   let barWidth = 550;
   let barHeight = 90;
   let barX = width / 2 - barWidth / 2;
   let barY = height / 4 - barHeight / 2;


   imageMode(CORNER);
   image(redbar, barX, barY, barWidth, barHeight);


   // Draw popup text over the redbar
   fill(0); // black text
   textSize(16);
   textAlign(CENTER, CENTER);
   text(popupMessage, width / 2, height / 4);
 }
 }


function drawSensitivityMeter() {
 fill(255);
 noStroke();
 textSize(16);
 text(`Sensitivity: ${sensitivity}%`, 80, height - 20);
  // Background bar


 imageMode(CORNER);
 image(redbar, -5, height - 60, 270, 40);
  // Filled bar
 fill(255, 0, 0);
 let barWidth = map(sensitivity, 0, maxSensitivity, 0, 200);
 rect(20, height - 50, barWidth, 20);
}


function mousePressed() {
 if (gameState === "start") {
   if (
     mouseX > width / 2 - 70 && mouseX < width / 2 + 70 &&
     mouseY > height / 2 + 70 && mouseY < height / 2 + 170
   ) {
     gameState = "instructions"; // <- go to instructions first
   }
  } else if (gameState === "overwhelmed") {
    if (
      mouseX > width / 2 - 120 && mouseX < width / 2 + 120 &&
      mouseY > height / 2 + 80 - 90 && mouseY < height / 2 + 80 + 90
    ) {
      gameState = "playing";
      sensitivity = 0;
      currentLevel = 1;
      overwhelmed = false;
      player.reset();
      generateLevel(currentLevel);
    }
 } else if (gameState === "instructions") {
   // Check if control scheme buttons were clicked
   if (mouseX > width / 2 - 150 && mouseX < width / 2 - 20 &&
       mouseY > height / 2 + 60 && mouseY < height / 2 + 100) {
     // Arrow keys button clicked
     controlScheme = "arrows";
   } else if (mouseX > width / 2 + 20 && mouseX < width / 2 + 150 &&
        mouseY > height / 2 + 60 && mouseY < height / 2 + 100) {
     // WASD button clicked
     controlScheme = "wasd";
   }
  
  
  
   // Check if start button was clicked
   if (
     mouseX > width / 2 - 70 && mouseX < width / 2 + 70 &&
     mouseY > height / 2 + 150 && mouseY < height / 2 + 240
   ) {
     gameState = "playing"; // Start the actual game now
      // 🔊 Start background music here
      if (!bgMusic.isPlaying()) {
       bgMusic.setVolume(0.1); // Low volume
       bgMusic.loop();
     }
   }     
  
 } else if (gameState === "gameOver") {
   gameState = "start";
   sensitivity = 0; // Reset sensitivity to 0 when restarting from game over
   currentLevel = 1;
   player.reset();
   generateLevel(currentLevel);
 } else if (gameState === "levelComplete") {
   if (mouseX > width / 2 - 80 && mouseX < width / 2 + 80 &&
       mouseY > height / 2 - 50 && mouseY < height / 2 + 10) {
     if (currentLevel > maxLevel) {
       // Game complete, restart from beginning
       currentLevel = 1;
       gameState = "start";
     } else {
       gameState = "playing";
     }
     // Reset player position to bottom of screen before generating new level
     player.reset();
     generateLevel(currentLevel);
   }
 }
}


function generateLevel(level) {
 platforms = [];
 collectibles = [];
  let numSoft, numRough, numSharp, numCollectibles;
  // Define level parameters
 switch(level) {
   case 1:
     numSoft = 18;
     numRough = 0;
     numSharp = 0;
     numCollectibles = 0;
     break;
   case 2:
     numSoft = 7;
     numRough = 11;
     numSharp = 0;
     numCollectibles = 6;
     break;
   case 3:
     numSoft = 4;
     numRough = 9;
     numSharp = 5;
     numCollectibles = 12;
     break;
   case 4: // Level 4 - same parameters as level 3 but with boss background and cat on checkpoint
     numSoft = 2;
     numRough = 8;
     numSharp = 8;
     numCollectibles = 12;
     break;
   default:
     numSoft = 10;
     numRough = 6;
     numSharp = 0;
     numCollectibles = 3;
 }
  // Always add one checkpoint platform
 let numCheckpoint = 1;
  // Create a grid system to ensure platforms are within jumping range
 let gridSize = 190;
 let rows = floor(height / gridSize);
 let cols = floor(width / gridSize);
  // Create starting platform (always soft) at the bottom where player starts
 let startPlatform = new Platform(width / 3, height - 100, "soft");
 platforms.push(startPlatform);
  // Ensure player is positioned at the bottom above the starting platform
 player.reset();
  // Create grid to track occupied cells
 let grid = Array(rows).fill().map(() => Array(cols).fill(false));
 let platformCount = numSoft + numRough + numSharp;  // Not including checkpoint yet
 let startRow = floor((height - 100) / gridSize);
 let startCol = floor((width / 3) / gridSize);
 grid[startRow][startCol] = true;
  // Function to check if a platform can be placed with proper jumping distance
 function canPlace(row, col, grid) {
   if (row < 0 || row >= rows || col < 0 || col >= cols || grid[row][col]) {
     return false;
   }
  
   // Check if there's any adjacent platform (diagonal counts too)
   for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
     for (let c = Math.max(0, col - 1); c <= Math.min(cols - 1, col + 1); c++) {
       if (grid[r][c]) {
         return true;
       }
     }
   }
  
   return false;
 }
  // Place regular platforms
 let placedCount = 1; // Start with 1 because we already placed the starting platform
  while (placedCount < platformCount + 1) {  // +1 to account for the start platform
   let attempts = 0;
   let validPlacement = false;
  
   while (!validPlacement && attempts < 100) {
     let row = floor(random(rows));
     let col = floor(random(cols));
    
     if (canPlace(row, col, grid)) {
       grid[row][col] = true;
       validPlacement = true;
      
       let x = col * gridSize + random(20, gridSize - 90);
       let y = row * gridSize + random(20, gridSize - 40);
      
       let type;
       if (placedCount <= numSoft) {
         type = "soft";
       } else if (placedCount <= numSoft + numRough) {
         type = "rough";
       } else {
         type = "sharp";
       }
      
       platforms.push(new Platform(x, y, type));
       placedCount++;
     }
    
     attempts++;
   }
  
   // If we can't place a platform after too many attempts, break to avoid infinite loop
   if (attempts >= 100) {
     break;
   }
 }
  // Now place the checkpoint platform based on level difficulty
 placeCheckpoint(level, grid, gridSize, rows, cols);
  // Generate collectibles
 for (let i = 0; i < numCollectibles; i++) {
   let validPosition = false;
   let x, y;
  
   while (!validPosition) {
     x = random(100, width - 100);
     y = random(100, height - 200);
    
     // Make sure collectibles aren't too close to each other
     let tooClose = collectibles.some(c => dist(x, y, c.x, c.y) < 80);
    
     // Make sure collectibles are near platforms (within reach)
     let nearPlatform = platforms.some(p =>
       x > p.x - 100 && x < p.x + p.w + 100 &&
       y > p.y - 150 && y < p.y + 50
     );
    
     if (!tooClose && nearPlatform) {
       validPosition = true;
     }
   }
  
   collectibles.push(new Collectible(x, y));
 }
}


function placeCheckpoint(level, grid, gridSize, rows, cols) {
 // Place checkpoint based on level difficulty
 // For higher levels, place the checkpoint in harder-to-reach locations
  let checkpointX, checkpointY;
 let checkpointPlaced = false;
  if (level === 1) {
   // Level 1: Place checkpoint in a relatively easy-to-reach location
   // Try to place it on the right side of the screen at medium height
   for (let attempt = 0; attempt < 100 && !checkpointPlaced; attempt++) {
     let col = floor(random(cols * 0.65, cols * 0.95));  // Right side of screen
     let row = floor(random(rows * 0.40, rows * 0.80));  // Medium height
    
     if (!grid[row][col] && canReach(row, col, grid)) {
       checkpointX = col * gridSize + random(20, gridSize - 100);
       checkpointY = row * gridSize + random(20, gridSize - 40);
       platforms.push(new Platform(checkpointX, checkpointY, "checkpoint", level === 4)); // Pass boolean flag for level 4
       checkpointPlaced = true;
     }
   }
 } else if (level === 2) {
   // Level 2: Place checkpoint in a moderately difficult location
   // Try to place it on the upper right corner
   for (let attempt = 0; attempt < 100 && !checkpointPlaced; attempt++) {
     let col = floor(random(cols * 0.55, cols * 0.95));  // Far right
     let row = floor(random(rows * 0.3, rows * 0.60));   // High up
    
     if (!grid[row][col] && canReach(row, col, grid)) {
       checkpointX = col * gridSize + random(20, gridSize - 100);
       checkpointY = row * gridSize + random(20, gridSize - 40);
       platforms.push(new Platform(checkpointX, checkpointY, "checkpoint", level === 4)); // Pass boolean flag for level 4
       checkpointPlaced = true;
     }
   }
 } else if (level === 3 || level === 4) { // Level 3 and 4 have similar placement
   // Place checkpoint in a very difficult location
   // Try to place it at the very top of the screen
   for (let attempt = 0; attempt < 100 && !checkpointPlaced; attempt++) {
     let col = floor(random(1, cols - 0.95));             // Anywhere horizontally
     let row = floor(random(0, rows * 0.20));             // Very top of screen
    
     if (!grid[row][col] && canReach(row, col, grid)) {
       checkpointX = col * gridSize + random(20, gridSize - 100);
       checkpointY = row * gridSize + random(20, gridSize - 40);
       platforms.push(new Platform(checkpointX, checkpointY, "checkpoint", level === 4)); // Pass boolean flag for level 4
       checkpointPlaced = true;
     }
   }
 }
  // Fallback: If we couldn't place a checkpoint in the desired location, place it somewhere reachable
 if (!checkpointPlaced) {
   for (let row = 0; row < rows && !checkpointPlaced; row++) {
     for (let col = 0; col < cols && !checkpointPlaced; col++) {
       if (!grid[row][col] && canReach(row, col, grid)) {
         checkpointX = col * gridSize + random(20, gridSize - 100);
         checkpointY = row * gridSize + random(20, gridSize - 40);
         platforms.push(new Platform(checkpointX, checkpointY, "checkpoint", level === 4)); // Pass boolean flag for level 4
         checkpointPlaced = true;
       }
     }
   }
 }
  // Last resort: Place checkpoint anywhere valid
 if (!checkpointPlaced) {
   checkpointX = random(100, width - 200);
   checkpointY = random(100, height - 100);
   platforms.push(new Platform(checkpointX, checkpointY, "checkpoint", level === 4)); // Pass boolean flag for level 4
 }
}


function canReach(row, col, grid) {
 // Check if this position is within jumping range of any existing platform
 // More sophisticated than canPlace - ensures platforms are actually reachable by the player
  // Check nearby positions (within jumping range)
 for (let r = Math.max(0, row - 2); r <= Math.min(row + 2, grid.length - 1); r++) {
   for (let c = Math.max(0, col - 2); c <= Math.min(col + 2, grid[0].length - 1); c++) {
     if (grid[r][c]) {
       // Calculate approximate distance
       let distance = Math.sqrt(Math.pow(r - row, 2) + Math.pow(c - col, 2));
       if (distance <= 2) {  // Within jumping range
         return true;
       }
     }
   }
 }
  return false;
}


class Player {
 constructor() {
   this.x = width / 3;
   this.y = height - 80;
   this.w = 30;      // Original collision box width
   this.h = 60;      // Original collision box height
   this.displayW = 100;  // Wider display for visual only
   this.displayH = 120;  // Taller display for visual only
   this.velY = 0;
   this.velX = 0;
   this.speed = 5;
   this.jumpPower = 17;
   this.onGround = false;
   this.facingRight = true;  // New property to track facing direction
 }


 update() {
   // Horizontal movement with slight acceleration/deceleration
   if ((controlScheme === "arrows" && keyIsDown(LEFT_ARROW)) ||
       (controlScheme === "wasd" && keyIsDown(65))) { // LEFT_ARROW or 'A' key
     this.velX = -this.speed;
     this.facingRight = false;  // Facing left when moving left
   } else if ((controlScheme === "arrows" && keyIsDown(RIGHT_ARROW)) ||
              (controlScheme === "wasd" && keyIsDown(68))) { // RIGHT_ARROW or 'D' key
     this.velX = this.speed;
     this.facingRight = true;  // Facing right when moving right
   } else {
     // Deceleration
     this.velX *= 0.8;
   }
  
   this.x += this.velX;
  
   // Vertical movement (gravity)
   this.y += this.velY;
   this.velY += 0.8;
  
   // Floor collision
   if (this.y > height - this.h) {
     this.y = height - this.h;
     this.velY = 0;
     this.onGround = true;
   }
  
   // Make sure player doesn't get stuck in walls
   if (this.x < 0) this.x = 0;
   if (this.x > width - this.w) this.x = width - this.w;
 }


 display() {
   // Determine which GIF to use based on player state and sensitivity level
   let currentGif;
  
   const isSensitive = sensitivity > 50;
  
   if (this.velY < -0.1) {
     // Jumping (moving upwards) - we'll keep using the jumping GIF regardless of sensitivity
     currentGif = playerJumpingGif;
   } else if (Math.abs(this.velX) > 0.1) {
     // Walking - use normal or sleepy version based on sensitivity
     currentGif = isSensitive ? playerSleepWalkingGif : playerWalkingGif;
   } else {
     // Idle - use normal or sleepy version based on sensitivity
     currentGif = isSensitive ? playerSleepIdleGif : playerGif;
   }
  
   // Calculate aspect ratio to avoid stretching
   let aspectRatio = currentGif.width / currentGif.height;
   let displayHeight = this.displayH;
   let displayWidth = displayHeight * aspectRatio;
  
   // Position player so feet touch the bottom of the screen
   let visualX = this.x + (this.w / 2) - (displayWidth / 2);
   let visualY = this.y + this.h - displayHeight;
  
   // Draw player character using the appropriate GIF
   imageMode(CORNER);
  
   push(); // Save the current transformation state
  
   // Translate to the center of the image
   translate(visualX + displayWidth / 2, visualY);
  
   // Scale horizontally based on facing direction
   scale(this.facingRight ? 1 : -1, 1);
  
   // Draw the image centered around the translation point
   image(currentGif, -displayWidth / 2, 0, displayWidth, displayHeight);
  
   pop(); // Restore the transformation state
 }


 jump() {
   if (this.onGround) {
     this.velY = -this.jumpPower;
     this.onGround = false;
    
     // Play jump sound - much quieter with no delay
     if (jumpSound) {
       jumpSound.stop(); // Stop any currently playing instance
       jumpSound.setVolume(0.07); 
       jumpSound.play();
     }
   }
 }
  reset() {
   this.x = width / 3;
   this.y = height - this.h;  // Place collision box at the bottom of the screen
   this.velY = 0;
   this.velX = 0;
   this.onGround = false;
   this.facingRight = true;
 }
}


function keyPressed() {
 // Jump controls
 if ((controlScheme === "arrows" && key === ' ') || // Spacebar for arrows scheme
     (controlScheme === "wasd" && (key === 'w' || key === 'W'))) { // 'W' for WASD scheme
   player.jump();
 }
  // Pause controls (same for both schemes)
 else if (key === 'p' || key === 'P' || keyCode === 27) { // 'P' or ESC
   if (gameState === "playing") {
     gameState = "paused";
   } else if (gameState === "paused") {
     gameState = "playing";
   }
 }
}


class Platform {
 constructor(x, y, type, isFinalCheckpoint = false) {
   this.x = x;
   this.y = y;
   this.w = 180;
   this.h = 25;
   this.type = type;
   this.isFinalCheckpoint = isFinalCheckpoint; // Whether this is the level 4 checkpoint with cat
  
   // For soft platforms, randomly choose which tile image to use
   if (this.type === "soft") {
     // Generate a random number 0, 1, or 2 to select the image
     this.tileImageIndex = floor(random(3));
   }
  
   // Add animation timer for cat if this is the final checkpoint
   if (this.isFinalCheckpoint) {
     this.catBobTimer = 0;
     this.catBobHeight = 5;
     this.catBobSpeed = 0.05;
   }
 }


 display() {
   // Set fill color based on platform type
   if (this.type === "soft") {
     // Use the selected image instead of filling with color
     imageMode(CORNER);
    
     // Select the appropriate image based on the random index
     if (this.tileImageIndex === 0) {
       // Maintain aspect ratio while ensuring the width is correct
       let aspectRatio = flowerTile1.width / flowerTile1.height;
       let displayHeight = this.w / aspectRatio;
       // Center the image vertically on the platform
       let yOffset = (this.h - displayHeight) / 2;
       image(flowerTile1, this.x, this.y + yOffset, this.w, displayHeight);
      
       // Adjustment for collision detection - lower landing by 10px for this specific tile
       if (player.velY > 0 &&
           player.x + player.w > this.x &&
           player.x < this.x + this.w &&
           player.y + player.h > this.y + 10 &&
           player.y + player.h < this.y + this.h + 4) {  // Shorter collision box from below
        
         player.y = this.y + 10 - player.h;
         player.velY = 0;
         player.onGround = true;
       }
     } else if (this.tileImageIndex === 1) {
       // Maintain aspect ratio while ensuring the width is correct
       let aspectRatio = flowerTiles4.width / flowerTiles4.height;
       // Scale down the size to match regular tiles - use 80% of original calculated height
       let displayHeight = (this.w / aspectRatio) * 0.8;
       // Center the image vertically on the platform
       let yOffset = (this.h - displayHeight) / 2;
       image(flowerTiles4, this.x, this.y + yOffset, this.w * 0.8, displayHeight);
      
       // Adjustment for collision detection - lower landing by 10px for this flower tile
       if (player.velY > 0 &&
           player.x + player.w > this.x &&
           player.x < this.x + this.w &&
           player.y + player.h > this.y + 10 &&
           player.y + player.h < this.y + this.h + 4) {  // Shorter collision box from below
        
         player.y = this.y + 10 - player.h;
         player.velY = 0;
         player.onGround = true;
       }
     } else if (this.tileImageIndex === 2) {
       // Maintain aspect ratio while ensuring the width is correct
       let aspectRatio = regularTile3.width / regularTile3.height;
       let displayHeight = this.w / aspectRatio;
       // Center the image vertically on the platform
       let yOffset = (this.h - displayHeight) / 2;
       image(regularTile3, this.x, this.y + yOffset, this.w, displayHeight);
     }
   } else if (this.type === "rough") {
     // Maintain aspect ratio while ensuring the width is correct
     let aspectRatio = rock3.width / rock3.height;
     let displayHeight = this.w / aspectRatio;
     // Center the image vertically on the platform
     let yOffset = (this.h - displayHeight) / 2;
     image(rock3, this.x, this.y + yOffset, this.w, displayHeight);
   } else if (this.type === "sharp") {
     // Maintain aspect ratio while ensuring the width is correct
     let aspectRatio = spikes1.width / spikes1.height;
     let displayHeight = this.w / aspectRatio;
     // Center the image vertically on the platform
     let yOffset = (this.h - displayHeight) / 2;
     image(spikes1, this.x, this.y + yOffset, this.w, displayHeight);
   } else if (this.type === "checkpoint") {
     // Maintain aspect ratio while ensuring the width is correct (same as soft tiles)
     let aspectRatio = checkpointImage.width / checkpointImage.height;
     // Scale down the size to match regular tiles - use 80% of original calculated height
     let displayHeight = (this.w / aspectRatio) * 0.7;
     // Center the image vertically on the platform
     let yOffset = (this.h - displayHeight) / 2;
    
     imageMode(CORNER);
     image(checkpointImage, this.x, this.y + yOffset, this.w * 0.7, displayHeight);
    
     // Add cat animation for level 4 checkpoint
     if (this.isFinalCheckpoint && catIdleGif) {
       // Bob animation for cat
       this.catBobTimer += this.catBobSpeed;
       let bobOffset = sin(this.catBobTimer) * this.catBobHeight;
      
       // Calculate appropriate size for the cat (about 30% of platform width - very small cat)
       let catWidth = this.w * 0.3;
       let catHeight = catWidth * (catIdleGif.height / catIdleGif.width);
      
       // Position cat directly on top of the checkpoint platform (not floating)
       let catX = this.x + this.w / 2 - catWidth / 2;
       let catY = this.y - catHeight; // Position exactly at the top of platform
      
       // Draw the cat without any glow effect
       image(catIdleGif, catX - 50, catY + 30, catWidth, catHeight);
     }
   }
 }
  checkCollision(player) {
   // For flower tiles, collision is handled in the display method
   if (this.type === "soft" && (this.tileImageIndex === 0 || this.tileImageIndex === 1)) {
     return;
   }
  
   if (player.velY > 0 &&
       player.x + player.w > this.x &&
       player.x < this.x + this.w &&
       player.y + player.h > this.y &&
       player.y + player.h < this.y + this.h + 10) {
    
     player.y = this.y - player.h;
     player.velY = 0;
     player.onGround = true;
    
     if (this.type === "rough") {
       sensitivity += 1; // Reduced increase rate
       popupMessage = random(popupMessages);
       popupTimer = 60;
     } else if (this.type === "sharp") {
       sensitivity += 3; // Sharp increases sensitivity more quickly
       popupMessage = "Ouch! That really hurts!";
       popupTimer = 60;
     } else if (this.type === "checkpoint") {
       // Special message for the final checkpoint with cat
       if (this.isFinalCheckpoint) {
         popupMessage = "You found your cat! Reunited at last!";
         popupTimer = 120; // Display message longer for this special moment
       }
       // Move to next level
       currentLevel++;
       gameState = "levelComplete";
     }
    
     if (this.type === "sharp" && sensitivity >= maxSensitivity) {
       gameState = "overwhelmed";
       overwhelmed = true;
       sensitivity = 0; // Reset sensitivity to 0 when player dies
       currentLevel = 1;
       player.reset();
     }
    
     if (sensitivity >= maxSensitivity) {
      gameState = "overwhelmed";
      overwhelmed = true;
       sensitivity = 0; // Reset sensitivity to 0 when player dies
       currentLevel = 1; // Reset to level 1 when player dies
       player.reset(); // Reset player position
     }
   }
 }
}



