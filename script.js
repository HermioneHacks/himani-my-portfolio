// Select the canvas and set up rendering
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set canvas dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Load the room background
const roomImage = new Image();
roomImage.src = "room-background.png"; // Replace with your actual image path

// Load interactive objects
const objects = [
    { name: "Laptop", x: 300, y: 250, width: 50, height: 40, action: () => window.open("https://github.com/HermioneHacks", "_blank") },
    { name: "Bookshelf", x: 100, y: 150, width: 80, height: 120, action: () => alert("Check out my projects!") },
    { name: "Resume", x: 500, y: 350, width: 50, height: 40, action: () => window.open("/resume.pdf", "_blank") }
];

// Draw everything
function drawScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(roomImage, 0, 0, canvas.width, canvas.height);

    // Draw interactive objects (hitboxes for now)
    ctx.fillStyle = "rgba(255, 0, 0, 0.3)"; // Transparent red hitboxes
    objects.forEach(obj => ctx.fillRect(obj.x, obj.y, obj.width, obj.height));
}

// Detect clicks on objects
canvas.addEventListener("click", (event) => {
    const { offsetX, offsetY } = event;

    objects.forEach(obj => {
        if (
            offsetX > obj.x &&
            offsetX < obj.x + obj.width &&
            offsetY > obj.y &&
            offsetY < obj.y + obj.height
        ) {
            obj.action();
        }
    });
});

// Continuously update the canvas
function gameLoop() {
    drawScene();
    requestAnimationFrame(gameLoop);
}

// Start the loop
roomImage.onload = () => {
    gameLoop();
};
