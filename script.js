const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

ctx.imageSmoothingEnabled = false;

// Always attach event listeners, regardless of image load
canvas.addEventListener('click', handleCanvasClick);
canvas.addEventListener('mousemove', handleMouseMove);

// Load all images
const roomImage = new Image();
const characterStaticImage = new Image();

roomImage.src = "img/room_background.png";
characterStaticImage.src = "img/me_static.png";

// Create animated character element
const animatedCharacter = document.createElement('div');
animatedCharacter.id = 'animatedCharacter';
animatedCharacter.style.backgroundImage = 'url("img/me_gif.gif")';
document.body.appendChild(animatedCharacter);

let isCharacterAnimated = false;

// Animation state for sliding in
let characterSlideX = -1; // -1 means offscreen, 0 means at target
let slideStartTime = null;
let animationStarted = false;
let glitching = false;
let glitchStartTime = null;
let showBoxes = false;
let showSpeechBubble = true;
let showRecruiterBox = true;
let showBackButton = false;

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
        link: "mango-page.html"
    }
];

// Character and UI constants
const UI = {
    characterStatic: {
        relWidth: 0.32, // Static character width as percentage of screen width
        relHeight: 0.56, // Static character height as percentage of screen height
        relX: 0.025, // Position from left as percentage of screen width
        relBottomMargin: 0.07 // Margin from bottom as percentage of screen height
    },
    characterAnimated: {
        relWidth: 0.373333333333333, // Animated character width as percentage of screen width
        relHeight: 0.56, // Animated character height as percentage of screen height
        relX: 0.030, // Position from left as percentage of screen width
        relBottomMargin: 0.061 // Margin from bottom as percentage of screen height
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

// Add a contact link (update this to your real link if desired)
const contactLink = "himanipateluiuc@gmail.com"; // You can change this to your LinkedIn or portfolio

function checkAllImagesLoaded() {
    imagesLoaded++;
    if (imagesLoaded === 2) { // Only waiting for 2 images now
        gameLoop();
    }
}

// Set up onload listeners
roomImage.onload = checkAllImagesLoaded;
characterStaticImage.onload = checkAllImagesLoaded;

// Function to update character position
function updateCharacterPosition(x, y, width, height) {
    animatedCharacter.style.width = `${width}px`;
    animatedCharacter.style.height = `${height}px`;
    animatedCharacter.style.left = `${x}px`;
    animatedCharacter.style.top = `${y}px`;
}

// Draw everything in one place
function drawScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw room (with scaling)
    const scaleFactor = 3;
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
            ctx.font = "12px 'Press Start 2P'";
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
    let characterConfig = animationStarted ? UI.characterAnimated : UI.characterStatic;
    const characterWidth = canvas.width * characterConfig.relWidth;
    const characterHeight = canvas.height * characterConfig.relHeight;
    const characterTargetX = canvas.width * characterConfig.relX;
    const characterY = canvas.height - characterHeight - (canvas.height * characterConfig.relBottomMargin);

    // Animate slide-in
    if (slideStartTime === null) slideStartTime = Date.now();
    const elapsed = Date.now() - slideStartTime;
    if (characterSlideX < 0) characterSlideX = -characterWidth;
    if (characterSlideX < characterTargetX) {
        // Slide in over 1s
        const slideDuration = 1000;
        characterSlideX = Math.min(characterTargetX, -characterWidth + (elapsed / slideDuration) * (characterTargetX + characterWidth));
    }
    // After 2s, start animation
    if (!animationStarted && elapsed > 2000) {
        animationStarted = true;
        isCharacterAnimated = true;
        animatedCharacter.style.display = 'block';
        glitching = true;
        glitchStartTime = Date.now();
    }

    // Glitch effect for first 300ms of animation
    let glitchOffsetX = 0;
    let glitchOffsetY = 0;
    let glitchFilter = '';
    if (glitching) {
        const glitchElapsed = Date.now() - glitchStartTime;
        if (glitchElapsed < 300) {
            // Random pixel jitter (up to ±6px)
            glitchOffsetX = Math.floor((Math.random() - 0.5) * 12);
            glitchOffsetY = Math.floor((Math.random() - 0.5) * 12);
            // Random color filter (hue-rotate or invert)
            if (Math.random() < 0.5) {
                glitchFilter = `hue-rotate(${Math.floor(Math.random() * 360)}deg)`;
            } else {
                glitchFilter = 'invert(1)';
            }
        } else {
            glitching = false;
            glitchFilter = '';
            showBoxes = true;
        }
    }

    // Update animated character position and visibility (with glitch)
    updateCharacterPosition(characterSlideX + glitchOffsetX, characterY + glitchOffsetY, characterWidth, characterHeight);
    animatedCharacter.style.display = animationStarted ? 'block' : 'none';
    animatedCharacter.style.filter = glitchFilter;

    // Only draw static character if not animated
    if (!animationStarted) {
        ctx.drawImage(characterStaticImage, characterSlideX, characterY, characterWidth, characterHeight);
    }

    // Draw UI boxes only after glitch is done
    if (showBoxes) {
        // Calculate speech bubble dimensions and position (responsive)
        const bubbleWidth = canvas.width * UI.speechBubble.relWidth;
        const bubbleHeight = canvas.height * UI.speechBubble.relHeight;
        const bubbleX = canvas.width * UI.speechBubble.relX;
        const bubbleY = canvas.height * UI.speechBubble.relY;

        // Draw speech bubble
        if (showSpeechBubble) {
            ctx.fillStyle = "white";
            ctx.fillRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight);
            ctx.strokeStyle = "black";
            ctx.lineWidth = 3;
            ctx.strokeRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight);
            ctx.fillStyle = "black";
            const fontSize = Math.max(12, Math.min(16, canvas.width / 90));
            ctx.font = `${fontSize}px 'Press Start 2P'`;
            wrapText(ctx, currentMessage, bubbleX + 15, bubbleY + 28, bubbleWidth - 30, fontSize + 5);

            // Draw Next button if needed (INSIDE the speech bubble)
            if (showNextButton) {
                const buttonWidth = canvas.width * UI.nextButton.relWidth * 1.1;
                const buttonHeight = canvas.height * UI.nextButton.relHeight * 1.1;
                const buttonX = bubbleX + (bubbleWidth - buttonWidth) / 2;
                const buttonY = bubbleY + bubbleHeight - buttonHeight - 12;
                ctx.fillStyle = "#4CAF50";
                ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
                ctx.strokeStyle = "#248536";
                ctx.lineWidth = 3;
                ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
                ctx.fillStyle = "white";
                ctx.font = `bold ${Math.max(12, Math.min(14, canvas.width / 100))}px 'Press Start 2P'`;
                const textWidth = ctx.measureText("NEXT").width;
                ctx.fillText("NEXT", buttonX + (buttonWidth - textWidth)/2, buttonY + buttonHeight/2 + 6);
            }
        }

        // --- Draw recruiter/contact box ---
        if (showRecruiterBox) {
            const recruiterSpacing = canvas.height * 0.02;
            const contactBoxWidth = bubbleWidth;
            const contactBoxHeight = bubbleHeight * 1;
            const contactBoxX = bubbleX + (bubbleWidth - contactBoxWidth) / 2;
            const contactBoxY = bubbleY + bubbleHeight + recruiterSpacing;

            // Draw contact box
            ctx.fillStyle = "white";
            ctx.fillRect(contactBoxX, contactBoxY, contactBoxWidth, contactBoxHeight);
            ctx.strokeStyle = "black";
            ctx.lineWidth = 3;
            ctx.strokeRect(contactBoxX, contactBoxY, contactBoxWidth, contactBoxHeight);
            ctx.fillStyle = "black";
            const fontSize = Math.max(12, Math.min(16, canvas.width / 90));
            ctx.font = `${fontSize}px 'Press Start 2P'`;
            wrapText(ctx, "If you are a recruiter or interested in my work click here:", contactBoxX + 15, contactBoxY + 28, contactBoxWidth - 30, fontSize + 5);

            // --- Draw contact button (same as NEXT, inside recruiter box) ---
            const contactButtonWidth = canvas.width * UI.nextButton.relWidth * 1.1;
            const contactButtonHeight = canvas.height * UI.nextButton.relHeight * 1.1;
            const contactButtonX = contactBoxX + (contactBoxWidth - contactButtonWidth) / 2;
            const contactButtonY = contactBoxY + contactBoxHeight - contactButtonHeight - 12;
            ctx.fillStyle = "#4CAF50";
            ctx.fillRect(contactButtonX, contactButtonY, contactButtonWidth, contactButtonHeight);
            ctx.strokeStyle = "#248536";
            ctx.lineWidth = 3;
            ctx.strokeRect(contactButtonX, contactButtonY, contactButtonWidth, contactButtonHeight);
            ctx.fillStyle = "white";
            ctx.font = `bold ${Math.max(12, Math.min(14, canvas.width / 100))}px 'Press Start 2P'`;
            const contactText = "NEXT";
            const contactTextWidth = ctx.measureText(contactText).width;
            ctx.fillText(contactText, contactButtonX + (contactButtonWidth - contactTextWidth)/2, contactButtonY + contactButtonHeight/2 + 6);
        }

        // Draw BACK button if showBackButton is true
        if (showBackButton && !showNextButton && !showRecruiterBox) {
            // Draw BACK button in the same place as recruiter box button, but a lot higher and orange
            const bubbleWidth = canvas.width * UI.speechBubble.relWidth;
            const bubbleHeight = canvas.height * UI.speechBubble.relHeight;
            const bubbleX = canvas.width * UI.speechBubble.relX;
            const bubbleY = canvas.height * UI.speechBubble.relY;
            const recruiterSpacing = canvas.height * 0.02;
            const contactBoxWidth = bubbleWidth;
            const contactBoxHeight = bubbleHeight * 1.1;
            const contactBoxX = bubbleX + (bubbleWidth - contactBoxWidth) / 2;
            const contactBoxY = bubbleY + bubbleHeight + recruiterSpacing;
            const backButtonWidth = canvas.width * UI.nextButton.relWidth * 1.1;
            const backButtonHeight = canvas.height * UI.nextButton.relHeight * 1.1;
            const backButtonX = contactBoxX + (contactBoxWidth - backButtonWidth) / 2;
            // Move the button a lot higher by increasing the offset (e.g., 120 instead of 32)
            const backButtonY = contactBoxY + contactBoxHeight - backButtonHeight - 120;
            ctx.fillStyle = "#ff9900";
            ctx.fillRect(backButtonX, backButtonY, backButtonWidth, backButtonHeight);
            ctx.strokeStyle = "#e68a00";
            ctx.lineWidth = 3;
            ctx.strokeRect(backButtonX, backButtonY, backButtonWidth, backButtonHeight);
            ctx.fillStyle = "white";
            ctx.font = `bold ${Math.max(12, Math.min(14, canvas.width / 100))}px 'Press Start 2P'`;
            const textWidth = ctx.measureText("BACK").width;
            ctx.fillText("BACK", backButtonX + (backButtonWidth - textWidth)/2, backButtonY + backButtonHeight/2 + 6);
        }
    }
    
    // Add debug mode instructions
    if (debugMode) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(canvas.width - 220, 10, 210, 30);
        ctx.fillStyle = "white";
        ctx.font = "14px 'Press Start 2P'";
        ctx.fillText("Press D to toggle debug", canvas.width - 210, 30);
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
    
    let isOverInteractiveElement = false;
    
    // Check if mouse is over the Next button (speech bubble)
    if (showNextButton) {
        // Calculate button dimensions and position (responsive)
        const bubbleWidth = canvas.width * UI.speechBubble.relWidth;
        const bubbleHeight = canvas.height * UI.speechBubble.relHeight;
        const bubbleX = canvas.width * UI.speechBubble.relX;
        const bubbleY = canvas.height * UI.speechBubble.relY;
        
        const buttonWidth = canvas.width * UI.nextButton.relWidth * 1.1;
        const buttonHeight = canvas.height * UI.nextButton.relHeight * 1.1;
        const buttonX = bubbleX + (bubbleWidth - buttonWidth) / 2;
        const buttonY = bubbleY + bubbleHeight - buttonHeight - 12;
        if (
            x >= buttonX && x <= buttonX + buttonWidth &&
            y >= buttonY && y <= buttonY + buttonHeight
        ) {
            document.body.style.cursor = 'pointer';
            isOverInteractiveElement = true;
        }
    }
    
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
                isOverInteractiveElement = true;
                document.body.style.cursor = 'pointer';
                currentMessage = area.message;
                break;
            }
        }
    }

    // Check if mouse is over recruiter/contact box NEXT button
    if (!isOverInteractiveElement && showBoxes && showRecruiterBox) {
        const recruiterSpacing = canvas.height * 0.02;
        const bubbleWidth = canvas.width * UI.speechBubble.relWidth;
        const bubbleHeight = canvas.height * UI.speechBubble.relHeight;
        const bubbleX = canvas.width * UI.speechBubble.relX;
        const bubbleY = canvas.height * UI.speechBubble.relY;
        const contactBoxWidth = bubbleWidth;
        const contactBoxHeight = bubbleHeight * 1;
        const contactBoxX = bubbleX + (bubbleWidth - contactBoxWidth) / 2;
        const contactBoxY = bubbleY + bubbleHeight + recruiterSpacing;
        const contactButtonWidth = canvas.width * UI.nextButton.relWidth * 1.1;
        const contactButtonHeight = canvas.height * UI.nextButton.relHeight * 1.1;
        const contactButtonX = contactBoxX + (contactBoxWidth - contactButtonWidth) / 2;
        const contactButtonY = contactBoxY + contactBoxHeight - contactButtonHeight - 12;
        if (
            x >= contactButtonX && x <= contactButtonX + contactButtonWidth &&
            y >= contactButtonY && y <= contactButtonY + contactButtonHeight
        ) {
            document.body.style.cursor = 'pointer';
            return;
        }
    }

    // Check if mouse is over BACK button
    if (showBackButton && !showNextButton && !showRecruiterBox) {
        const bubbleWidth = canvas.width * UI.speechBubble.relWidth;
        const bubbleHeight = canvas.height * UI.speechBubble.relHeight;
        const bubbleX = canvas.width * UI.speechBubble.relX;
        const bubbleY = canvas.height * UI.speechBubble.relY;
        const recruiterSpacing = canvas.height * 0.02;
        const contactBoxWidth = bubbleWidth;
        const contactBoxHeight = bubbleHeight * 1.1;
        const contactBoxX = bubbleX + (bubbleWidth - contactBoxWidth) / 2;
        const contactBoxY = bubbleY + bubbleHeight + recruiterSpacing;
        const backButtonWidth = canvas.width * UI.nextButton.relWidth * 1.1;
        const backButtonHeight = canvas.height * UI.nextButton.relHeight * 1.1;
        const backButtonX = contactBoxX + (contactBoxWidth - backButtonWidth) / 2;
        // Move the button a lot higher by increasing the offset (e.g., 120 instead of 32)
        const backButtonY = contactBoxY + contactBoxHeight - backButtonHeight - 120;
        if (
            x >= backButtonX && x <= backButtonX + backButtonWidth &&
            y >= backButtonY && y <= backButtonY + backButtonHeight
        ) {
            document.body.style.cursor = 'pointer';
            return;
        }
    }

    // Update character animation state
    if (isOverInteractiveElement && !isCharacterAnimated) {
        isCharacterAnimated = true;
        animatedCharacter.style.display = 'block';
    } else if (!isOverInteractiveElement && isCharacterAnimated) {
        isCharacterAnimated = false;
        animatedCharacter.style.display = 'none';
        hoveredArea = null;
        document.body.style.cursor = 'default';
        if (!showNextButton) {
            currentMessage = defaultMessage;
        }
    }
}

// Handle canvas clicks
function handleCanvasClick(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Only allow button clicks if boxes are visible
    if (showBoxes) {
        // Speech bubble NEXT button
        if (showSpeechBubble && showNextButton) {
            const buttonWidth = canvas.width * UI.speechBubble.relWidth;
            const buttonHeight = canvas.height * UI.speechBubble.relHeight;
            const buttonX = canvas.width * UI.speechBubble.relX;
            const buttonY = canvas.height * UI.speechBubble.relY;
            if (
                x >= buttonX && x <= buttonX + buttonWidth &&
                y >= buttonY && y <= buttonY + buttonHeight
            ) {
                currentMessage = defaultMessage;
                showNextButton = false;
                showRecruiterBox = false;
                showBackButton = true;
                return;
            }
        }
        // Recruiter NEXT button (inside recruiter box)
        if (showRecruiterBox) {
            const recruiterSpacing = canvas.height * 0.02;
            const bubbleWidth = canvas.width * UI.speechBubble.relWidth;
            const bubbleHeight = canvas.height * UI.speechBubble.relHeight;
            const bubbleX = canvas.width * UI.speechBubble.relX;
            const bubbleY = canvas.height * UI.speechBubble.relY;
            const contactBoxWidth = bubbleWidth;
            const contactBoxHeight = bubbleHeight * 1;
            const contactBoxX = bubbleX + (bubbleWidth - contactBoxWidth) / 2;
            const contactBoxY = bubbleY + bubbleHeight + recruiterSpacing;
            const contactButtonWidth = canvas.width * UI.nextButton.relWidth * 1.1;
            const contactButtonHeight = canvas.height * UI.nextButton.relHeight * 1.1;
            const contactButtonX = contactBoxX + (contactBoxWidth - contactButtonWidth) / 2;
            const contactButtonY = contactBoxY + contactBoxHeight - contactButtonHeight - 12;
            if (
                x >= contactButtonX && x <= contactButtonX + contactButtonWidth &&
                y >= contactButtonY && y <= contactButtonY + contactButtonHeight
            ) {
                window.location.href = 'portfolio.html';
                return;
            }
        }
        // Interactive areas only clickable after recruiter box is gone and NEXT is gone
        if (!showNextButton && !showRecruiterBox) {
            for (const area of interactiveAreas) {
                // Convert relative coordinates to absolute canvas coordinates
                const scaleFactor = 3;
                const roomWidth = roomImage.width * scaleFactor;
                const roomHeight = roomImage.height * scaleFactor;
                const roomX = (canvas.width - roomWidth) / 2;
                const roomY = (canvas.height - roomHeight) / 2;
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
    }

    // Handle click on BACK button
    if (showBackButton && !showNextButton && !showRecruiterBox) {
        const bubbleWidth = canvas.width * UI.speechBubble.relWidth;
        const bubbleHeight = canvas.height * UI.speechBubble.relHeight;
        const bubbleX = canvas.width * UI.speechBubble.relX;
        const bubbleY = canvas.height * UI.speechBubble.relY;
        const recruiterSpacing = canvas.height * 0.02;
        const contactBoxWidth = bubbleWidth;
        const contactBoxHeight = bubbleHeight * 1.1;
        const contactBoxX = bubbleX + (bubbleWidth - contactBoxWidth) / 2;
        const contactBoxY = bubbleY + bubbleHeight + recruiterSpacing;
        const backButtonWidth = canvas.width * UI.nextButton.relWidth * 1.1;
        const backButtonHeight = canvas.height * UI.nextButton.relHeight * 1.1;
        const backButtonX = contactBoxX + (contactBoxWidth - backButtonWidth) / 2;
        // Move the button a lot higher by increasing the offset (e.g., 120 instead of 32)
        const backButtonY = contactBoxY + contactBoxHeight - backButtonHeight - 140;
        if (
            x >= backButtonX && x <= backButtonX + backButtonWidth &&
            y >= backButtonY && y <= backButtonY + backButtonHeight
        ) {
            window.location.reload();
            return;
        }
    }
}
