const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

ctx.imageSmoothingEnabled = false;

// Load all images
const roomImage = new Image();
const characterImage = new Image();

roomImage.src = "img/room-background.png";
characterImage.src = "img/character.png";

// Define interactive areas and their actions
const interactiveAreas = [
    // hover message is disabled
    {
        name: "Macbook",
        x: 1010, // Example coordinates - adjust based on actual room image
        y: 400,
        width: 30,
        height: 30,
        hoverMessage: "My laptop setup...",
        message: "This is my lapytopy where I code and study!",
        link: "https://github.com/HermioneHacks" // Replace with your GitHub or portfolio link
    },
    {
        name: "bed",
        x: 500, // Example coordinates - adjust based on actual room image
        y: 400,
        width: 100,
        height: 100,
        hoverMessage: "My cozy bed...",
        message: "My cozy bed...!"
    },
    {
        name: "bookshelf",
        x: 800, // Example coordinates - adjust based on actual room image
        y: 200,
        width: 150,
        height: 70,
        hoverMessage: "My collection of candy and perfume...",
        message: "This is my bookshelf, where I keep my trinkets!",
        //link: "https://yourfavoritebooks.com" // Optional link
    },
    {
        name: "iPad",
        x: 970, // Example coordinates - adjust based on actual room image
        y: 400,
        width: 20,
        height: 20,
        //hoverMessage: "My iPad...",
        message: "This is my iPad where I watch my favorite shows and take notes!",
        //link: "https://github.com/HermioneHacks" // Replace with new page link
    },
    {
        name: "turtle",
        x: 670, // Example coordinates - adjust based on actual room image
        y: 410,
        width: 30,
        height: 30,
        hoverMessage: "My dear turtle...",
        message: "This is Sir Bartholomew Oswald van Beethoven the Third!",
        link: "https://www.ikea.com/us/en/p/blavingad-soft-toy-turtle-green-10532041/" // Ikea link!
    },
    // Add more interactive areas as needed
];

// Current speech bubble text
let currentMessage = "I designed, drew, and coded everything for this page including the pixel art!";
let defaultMessage = "Hover and Click objects to explore!";
let hoveredArea = null;
let showNextButton = true; // Flag to control Next button visibility

// Track how many images have loaded
let imagesLoaded = 0;

function checkAllImagesLoaded() {
    imagesLoaded++;
    if (imagesLoaded === 2) {
        gameLoop();
        // Add click listener once images are loaded
        canvas.addEventListener('click', handleCanvasClick);
        canvas.addEventListener('mousemove', handleMouseMove);
    }
}

// Set up onload listeners
roomImage.onload = checkAllImagesLoaded;
characterImage.onload = checkAllImagesLoaded;

// Handle canvas clicks
function handleCanvasClick(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Check if click is on the Next button
    if (showNextButton) {
        // Next button dimensions and position
        const nextButtonX = 150;
        const nextButtonY = 210;
        const nextButtonWidth = 80;
        const nextButtonHeight = 30;
        
        if (x >= nextButtonX && x <= nextButtonX + nextButtonWidth &&
            y >= nextButtonY && y <= nextButtonY + nextButtonHeight) {
            // Switch to default message and hide Next button
            currentMessage = defaultMessage;
            showNextButton = false;
            return;
        }
    }
    
    // Check if click is within any interactive area
    for (const area of interactiveAreas) {
        if (x >= area.x && x <= area.x + area.width && 
            y >= area.y && y <= area.y + area.height) {
            
            // Update speech bubble
            currentMessage = area.message;
            showNextButton = false; // Hide Next button when interacting with objects
            
            // Open link if available
            if (area.link) {
                setTimeout(() => {
                    window.open(area.link, '_blank');
                }, 1000); // Small delay before opening link
            }
            
            break;
        }
    }
}

// Handle mouse movement for hover effects
function handleMouseMove(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Check if mouse is over the Next button
    if (showNextButton) {
        const nextButtonX = 150;
        const nextButtonY = 210;
        const nextButtonWidth = 80;
        const nextButtonHeight = 30;
        
        if (x >= nextButtonX && x <= nextButtonX + nextButtonWidth &&
            y >= nextButtonY && y <= nextButtonY + nextButtonHeight) {
            document.body.style.cursor = 'pointer';
            return;
        }
    }
    
    let foundHover = false;
    
    // Only process hover effects for interactive areas if Next button is not showing
    if (!showNextButton) {
        // Check if mouse is over any interactive area
        for (const area of interactiveAreas) {
            if (x >= area.x && x <= area.x + area.width && 
                y >= area.y && y <= area.y + area.height) {
                hoveredArea = area;
                foundHover = true;
                document.body.style.cursor = 'pointer'; // Change cursor to pointer
                
                // Update speech bubble with full message on hover
                currentMessage = area.message;
                break;
            }
        }
        
        if (!foundHover) {
            hoveredArea = null;
            document.body.style.cursor = 'default'; // Reset cursor
            
            // Reset speech bubble to default when not hovering over anything
            currentMessage = defaultMessage;
        }
    } else {
        // If next button is showing, just set cursor to default if not over button
        document.body.style.cursor = 'default';
    }
}

// Draw everything in one place
function drawScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw room (with scaling)
    const scaleFactor = 3; // Try 3x or adjust as needed
    const newWidth = roomImage.width * scaleFactor;
    const newHeight = roomImage.height * scaleFactor;

    const xOffset = (canvas.width - newWidth) / 2;
    const yOffset = (canvas.height - newHeight) / 2;

    ctx.drawImage(roomImage, xOffset, yOffset, newWidth, newHeight);
    
    // Draw highlight for hovered area
    if (hoveredArea && !showNextButton) {
        ctx.strokeStyle = '#FF9900';
        ctx.lineWidth = 3;
        ctx.strokeRect(hoveredArea.x, hoveredArea.y, hoveredArea.width, hoveredArea.height);
    }

    // Draw character
    const characterWidth = 100; // Adjusted width
    const characterHeight = 160; // Adjusted height to maintain proportion
    ctx.drawImage(characterImage, 20, canvas.height - characterHeight - 50, characterWidth, characterHeight);

    // Draw speech bubble
    ctx.fillStyle = "white";
    ctx.fillRect(50, 100, 250, 100);
    ctx.strokeStyle = "black";
    ctx.strokeRect(50, 100, 250, 100);
    ctx.fillStyle = "black";
    ctx.font = "16px Arial";
    
    // Handle long text by adding line breaks
    wrapText(ctx, currentMessage, 60, 130, 230, 20);
    
    // Draw Next button if needed
    if (showNextButton) {
        // Draw button
        ctx.fillStyle = "#4CAF50"; // Green button
        ctx.fillRect(150, 210, 80, 30);
        
        // Button text
        ctx.fillStyle = "white";
        ctx.font = "14px Arial";
        ctx.fillText("Next", 175, 230);
    }
}

// Function to wrap text in the speech bubble
function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    context.fillText(line, x, y);
}

// Animation loop
function gameLoop() {
    drawScene();
    requestAnimationFrame(gameLoop);
}

// Handle window resizing
window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.imageSmoothingEnabled = false;
});
