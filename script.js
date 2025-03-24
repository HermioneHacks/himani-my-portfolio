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
// These coordinates are RELATIVE to the room image (NOT absolute canvas coordinates)
const interactiveAreas = [
    {
        name: "Macbook",
        relX: 0.685, // Position as percentage of room width (0-1)
        relY: 0.47, // Position as percentage of room height (0-1)
        relWidth: 0.03, // Width as percentage of room width
        relHeight: 0.05, // Height as percentage of room height
        message: "This is my lapytopy where I code and study!",
        link: "https://github.com/HermioneHacks"
    },
    {
        name: "bed",
        relX: 0.31,
        relY: 0.45,
        relWidth: 0.1, 
        relHeight: 0.2,
        message: "My cozy bed...!"
    },
    {
        name: "bookshelf",
        relX: 0.53,
        relY: 0.25,
        relWidth: 0.15,
        relHeight: 0.08,
        message: "This is my bookshelf, where I keep my trinkets!"
    },
    {
        name: "iPad",
        relX: 0.655,
        relY: 0.475,
        relWidth: 0.015,
        relHeight: 0.03,
        message: "This is my iPad where I watch my favorite shows and take notes!"
    },
    {
        name: "turtle",
        relX: 0.43,
        relY: 0.50,
        relWidth: 0.03,
        relHeight: 0.03,
        message: "This is Sir Bartholomew Oswald van Beethoven the Third!",
        link: "https://www.ikea.com/us/en/p/blavingad-soft-toy-turtle-green-10532041/"
    },
    {
        name: "mango",
        relX: 0.815,
        relY: 0.43,
        relWidth: 0.03,
        relHeight: 0.055,
        message: "This is my bird Mango! Click to see more photos!",
        link: "mango-collage.html"
    }
];

// Character and UI constants
const UI = {
    character: {
        relWidth: 0.09, // Character width as percentage of screen width
        relHeight: 0.25, // Character height as percentage of screen height
        relX: 0.025, // Position from left as percentage of screen width
        relBottomMargin: 0.07 // Margin from bottom as percentage of screen height
    },
    speechBubble: {
        relWidth: 0.25, // Width as percentage of screen width
        relHeight: 0.20, // Height as percentage of screen height
        relX: 0.03, // Position from left as percentage of screen width
        relY: 0.15 // Position from top as percentage of screen height
    },
    nextButton: {
        relWidth: 0.06, // Width as percentage of screen width
        relHeight: 0.05, // Height as percentage of screen height
        relMarginTop: 0.02 // Margin top as percentage of screen height
    }
};

// Current speech bubble text
let currentMessage = "I designed, drew, and coded everything for this page including the pixel art!";
let defaultMessage = "Hover and Click objects to explore!";
let hoveredArea = null;
let showNextButton = true; // Flag to control Next button visibility
let debugMode = false; // Show all interactive areas for positioning

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
    
    // Draw all interactive areas in debug mode
    if (debugMode) {
        // Calculate room dimensions and position
        const roomWidth = roomImage.width * scaleFactor;
        const roomHeight = roomImage.height * scaleFactor;
        const roomX = (canvas.width - roomWidth) / 2;
        const roomY = (canvas.height - roomHeight) / 2;
        
        for (const area of interactiveAreas) {
            // Convert relative coordinates to absolute canvas coordinates
            const areaX = roomX + (area.relX * roomWidth);
            const areaY = roomY + (area.relY * roomHeight);
            const areaWidth = area.relWidth * roomWidth;
            const areaHeight = area.relHeight * roomHeight;
            
            // Draw box for each area with a different color
            ctx.strokeStyle = '#FF0000'; // Red boxes for debug
            ctx.lineWidth = 2;
            ctx.strokeRect(areaX, areaY, areaWidth, areaHeight);
            
            // Add name label
            ctx.fillStyle = "white";
            ctx.fillRect(areaX, areaY - 20, area.name.length * 8, 20);
            ctx.fillStyle = "black";
            ctx.font = "12px Arial";
            ctx.fillText(area.name, areaX + 5, areaY - 5);
        }
    }
    // Draw highlight for hovered area
    else if (hoveredArea && !showNextButton) {
        ctx.strokeStyle = '#FF9900';
        ctx.lineWidth = 3;
        ctx.strokeRect(hoveredArea.x, hoveredArea.y, hoveredArea.width, hoveredArea.height);
    }

    // Calculate character dimensions and position (responsive)
    const characterWidth = canvas.width * UI.character.relWidth;
    const characterHeight = canvas.height * UI.character.relHeight;
    const characterX = canvas.width * UI.character.relX;
    const characterY = canvas.height - characterHeight - (canvas.height * UI.character.relBottomMargin);

    // Draw character
    ctx.drawImage(characterImage, characterX, characterY, characterWidth, characterHeight);

    // Calculate speech bubble dimensions and position (responsive)
    const bubbleWidth = canvas.width * UI.speechBubble.relWidth;
    const bubbleHeight = canvas.height * UI.speechBubble.relHeight;
    const bubbleX = canvas.width * UI.speechBubble.relX;
    const bubbleY = canvas.height * UI.speechBubble.relY;

    // Draw speech bubble
    ctx.fillStyle = "white";
    ctx.fillRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight);
    ctx.strokeStyle = "black";
    ctx.strokeRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight);
    ctx.fillStyle = "black";
    ctx.font = `${Math.max(12, Math.min(16, canvas.width / 70))}px Arial`; // Responsive font size
    
    // Handle long text by adding line breaks
    wrapText(ctx, currentMessage, bubbleX + 10, bubbleY + 25, bubbleWidth - 20, 20);
    
    // Draw Next button if needed
    if (showNextButton) {
        // Calculate button dimensions and position (responsive)
        const buttonWidth = canvas.width * UI.nextButton.relWidth;
        const buttonHeight = canvas.height * UI.nextButton.relHeight;
        const buttonX = bubbleX + (bubbleWidth - buttonWidth) / 2;
        const buttonY = bubbleY + bubbleHeight + (canvas.height * UI.nextButton.relMarginTop);
        
        // Draw button
        ctx.fillStyle = "#4CAF50"; // Green button
        ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        // Draw button border
        ctx.strokeStyle = "#248536";
        ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        // Button text
        ctx.fillStyle = "white";
        ctx.font = `${Math.max(12, Math.min(14, canvas.width / 80))}px Arial`; // Responsive font size
        ctx.fillText("Next", buttonX + buttonWidth/2 - 15, buttonY + buttonHeight/2 + 5);
    }
    
    // Add debug mode instructions
    if (debugMode) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(canvas.width - 220, 10, 210, 30);
        ctx.fillStyle = "white";
        ctx.font = "14px Arial";
        ctx.fillText("Press 'D' to toggle debug mode", canvas.width - 210, 30);
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

// Handle keyboard events for debug mode
window.addEventListener('keydown', function(event) {
    // Toggle debug mode when 'D' is pressed
    if (event.key === 'd' || event.key === 'D') {
        debugMode = !debugMode;
    }
});

// Handle canvas clicks
function handleCanvasClick(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Calculate room dimensions and position
    const scaleFactor = 3;
    const roomWidth = roomImage.width * scaleFactor;
    const roomHeight = roomImage.height * scaleFactor;
    const roomX = (canvas.width - roomWidth) / 2;
    const roomY = (canvas.height - roomHeight) / 2;
    
    // Check if click is on the Next button
    if (showNextButton) {
        // Calculate button dimensions and position (responsive)
        const bubbleWidth = canvas.width * UI.speechBubble.relWidth;
        const bubbleHeight = canvas.height * UI.speechBubble.relHeight;
        const bubbleX = canvas.width * UI.speechBubble.relX;
        const bubbleY = canvas.height * UI.speechBubble.relY;
        
        const buttonWidth = canvas.width * UI.nextButton.relWidth;
        const buttonHeight = canvas.height * UI.nextButton.relHeight;
        const buttonX = bubbleX + (bubbleWidth - buttonWidth) / 2;
        const buttonY = bubbleY + bubbleHeight + (canvas.height * UI.nextButton.relMarginTop);
        
        if (x >= buttonX && x <= buttonX + buttonWidth &&
            y >= buttonY && y <= buttonY + buttonHeight) {
            // Switch to default message and hide Next button
            currentMessage = defaultMessage;
            showNextButton = false;
            return;
        }
    }
    
    // Check if click is within any interactive area
    for (const area of interactiveAreas) {
        // Convert relative coordinates to absolute canvas coordinates
        const areaX = roomX + (area.relX * roomWidth);
        const areaY = roomY + (area.relY * roomHeight);
        const areaWidth = area.relWidth * roomWidth;
        const areaHeight = area.relHeight * roomHeight;
        
        if (x >= areaX && x <= areaX + areaWidth && 
            y >= areaY && y <= areaY + areaHeight) {
            
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
    
    // Calculate room dimensions and position
    const scaleFactor = 3;
    const roomWidth = roomImage.width * scaleFactor;
    const roomHeight = roomImage.height * scaleFactor;
    const roomX = (canvas.width - roomWidth) / 2;
    const roomY = (canvas.height - roomHeight) / 2;
    
    // Check if mouse is over the Next button
    if (showNextButton) {
        // Calculate button dimensions and position (responsive)
        const bubbleWidth = canvas.width * UI.speechBubble.relWidth;
        const bubbleHeight = canvas.height * UI.speechBubble.relHeight;
        const bubbleX = canvas.width * UI.speechBubble.relX;
        const bubbleY = canvas.height * UI.speechBubble.relY;
        
        const buttonWidth = canvas.width * UI.nextButton.relWidth;
        const buttonHeight = canvas.height * UI.nextButton.relHeight;
        const buttonX = bubbleX + (bubbleWidth - buttonWidth) / 2;
        const buttonY = bubbleY + bubbleHeight + (canvas.height * UI.nextButton.relMarginTop);
        
        if (x >= buttonX && x <= buttonX + buttonWidth &&
            y >= buttonY && y <= buttonY + buttonHeight) {
            document.body.style.cursor = 'pointer';
            return;
        }
    }
    
    let foundHover = false;
    
    // Only process hover effects for interactive areas if Next button is not showing
    if (!showNextButton) {
        // Check if mouse is over any interactive area
        for (const area of interactiveAreas) {
            // Convert relative coordinates to absolute canvas coordinates
            const areaX = roomX + (area.relX * roomWidth);
            const areaY = roomY + (area.relY * roomHeight);
            const areaWidth = area.relWidth * roomWidth;
            const areaHeight = area.relHeight * roomHeight;
            
            if (x >= areaX && x <= areaX + areaWidth && 
                y >= areaY && y <= areaY + areaHeight) {
                hoveredArea = {
                    ...area,
                    x: areaX,
                    y: areaY,
                    width: areaWidth,
                    height: areaHeight
                };
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
