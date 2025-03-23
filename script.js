const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

ctx.imageSmoothingEnabled = false;

// Load all images
const backgroundImage = new Image();
const roomImage = new Image();
const characterImage = new Image();

backgroundImage.src = "img/background-image.png";
roomImage.src = "img/room-background.png";
characterImage.src = "img/character.png";

// Track how many images have loaded
let imagesLoaded = 0;

function checkAllImagesLoaded() {
    imagesLoaded++;
    if (imagesLoaded === 3) {
        gameLoop(); // Start once all 3 are ready
    }
}

// Set up onload listeners
backgroundImage.onload = checkAllImagesLoaded;
roomImage.onload = checkAllImagesLoaded;
characterImage.onload = checkAllImagesLoaded;

// Draw everything in one place
function drawScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // Draw room (with scaling)
    const scaleFactor = 3; // Try 3x or adjust as needed
    const newWidth = roomImage.width * scaleFactor;
    const newHeight = roomImage.height * scaleFactor;

    const xOffset = (canvas.width - newWidth) / 2;
    const yOffset = (canvas.height - newHeight) / 2;

    ctx.drawImage(roomImage, xOffset, yOffset, newWidth, newHeight);

    // Draw character
    ctx.drawImage(characterImage, 20, canvas.height - 250, 150, 200);

    // Draw speech bubble
    ctx.fillStyle = "white";
    ctx.fillRect(50, 100, 250, 100);
    ctx.fillStyle = "black";
    ctx.font = "16px PixelFont";
    ctx.fillText("Click objects to explore!", 60, 130);
}

// Animation loop
function gameLoop() {
    drawScene();
    requestAnimationFrame(gameLoop);
}
