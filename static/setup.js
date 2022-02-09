// TODO

// Make a menu for paused game
// Responsive menu
// Increasing difficuly

var columns = 12;
var rows = 18;
var nDigit;
var bGameOver = true;
var ticks = 0;
var score = 0;

var grid = new Array;
var gridRender = new Array;

var xPosition;
var yPosition;

var tetromino = new Array;
tetromino.push("..x...x...x...x.")
tetromino.push("..x..xx..x......")
tetromino.push(".x...xx...x.....")
tetromino.push(".....xx..xx.....")
tetromino.push("..x..xx...x.....")
tetromino.push(".....xx..x...x..")
tetromino.push(".....xx...x...x.")

var nTetromino;
var nextTetromino;
var nRotation = 0;

var bQueuedTetris = new Array;
var countDown = 0;

// Set function to start button
document.getElementById("startButton").onclick = generateGrid;
document.getElementById("pauseButton").onclick = pause;

// Set the game loop
window.setInterval(mainGameLoop, 50);

// Set the input event handlers
document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);

var rightPressed = 0;
var leftPressed = 0;
var downPressed = 0;
var zPressed = 0;

function keyDownHandler(event) {
    if(event.keyCode == 39 && rightPressed==0) {rightPressed = 1;}
    if(event.keyCode == 37 && leftPressed==0) {leftPressed = 1;}
    if(event.keyCode == 40 && downPressed==0) {downPressed = 1;}
    if(event.keyCode == 90 && zPressed==0) {zPressed = 1;}
}

function keyUpHandler(event) {
    if(event.keyCode == 39) {rightPressed = 0;}
    if(event.keyCode == 37) {leftPressed = 0;}
    if(event.keyCode == 40) {downPressed = 0;}
    if(event.keyCode == 90) {zPressed = 0;}
}



// Main Routines

function generateGrid(){
    // Remove button
    document.getElementById("startButton").style.display = "none";

    // Make play are visible
    document.getElementById("container").style.display = "flex";

    // Set the necessary number of digits to format the square identifiers
    nDigit = 1
    if (columns >= 10 || rows >= 10){nDigit = 2;}

    // Add squares to grid
    for (let i = 0; i < rows; i++){
        let temp = new Array;
        for (let j = 0; j < columns; j++){
            addSquare(i, j, nDigit);
            temp.push("_");
        }
        grid.push(temp);
    }

    generateBorder();

    nTetromino = Math.floor(Math.random() * 7);
    nextTetromino = Math.floor(Math.random() * 7);
    bGameOver = false;

    xPosition = columns/2-1
    yPosition = 0

    while (checkMovement(xPosition, yPosition-1, nTetromino, nRotation)){
        yPosition -= 1;
        console.log(xPosition, yPosition);
    }

    updatePreview();
}

function addSquare(i, j, nDigit){
    let id = "cell-"+String(i).padStart(nDigit, '0')+"-"+String(j).padStart(nDigit, '0');

    let square = document.createElement("div");
    let squareWidth = (100/columns);
    square.style.cssText = "float: left; width:"+squareWidth+"% ; height:0; padding-top: "+squareWidth+"%; border-radius: 10px; box-sizing: border-box;";
    square.id = id;

    gridDiv = document.getElementById("grid");
    gridDiv.appendChild(square);
};

function generateBorder(){
    for (let i = 0; i < rows; i++){
        grid[i][0] = "b";
        grid[i][columns-1] = "b";
    }
    for (let i = 0; i < columns; i++){
        grid[rows-1][i] = "b";
    }
};

function pause(){
    if (bGameOver){
        bGameOver = false;
        document.getElementById("pauseButton").innerHTML = "PAUSE";
    }else{
        bGameOver = true;
        document.getElementById("pauseButton").innerHTML = "UNPAUSE";
    }
};

function mainGameLoop(){
    if (!bGameOver){
        // Timing
        ticks++;
        gridRender = deepCopyGrid(grid);

        // Input
        if (rightPressed){
            if (rightPressed == 1 && checkMovement(xPosition+1, yPosition, nTetromino, nRotation)){xPosition+=1;}
            rightPressed = (rightPressed)%3+1;
        }else if (leftPressed){
            if (leftPressed == 1 && checkMovement(xPosition-1, yPosition, nTetromino, nRotation)){ xPosition-=1;}
            leftPressed = (leftPressed)%3+1;
        }

        if (downPressed){
            if (downPressed == 1){
                if (checkMovement(xPosition, yPosition+1, nTetromino, nRotation)){yPosition+=1;}
                else{bQueuedTetris = consolidatePiece();}
            }
            downPressed = (downPressed)%2+1;
        }

        if (zPressed){
            if (zPressed == 1 && checkMovement(xPosition, yPosition, nTetromino, nRotation+1)){nRotation+=1;}
            zPressed = 2;
        }

        // Game Logic
        if (ticks%20==0){
            if (checkMovement(xPosition, yPosition+1, nTetromino, nRotation)){
                yPosition+=1;
            }else{
                bQueuedTetris = consolidatePiece(); // Returns the line that will be eliminated (but first, animated)
            }
        }

        if (countDown){ // Countdown creates a animation process when a tetris is made
            countDown--;
            if (countDown == 0){
                for (let i = 0; i < bQueuedTetris.length; i++){
                    for (let temp = 0; temp < (bQueuedTetris[i]); temp++){
                        grid[bQueuedTetris[i] - temp] = grid[bQueuedTetris[i] - (temp+1)].slice(0);
                    }
                }
                score += (50*bQueuedTetris.length) + (6)**bQueuedTetris.length;
                bQueuedTetris = new Array;

                document.getElementById("score").innerText = score;
            }
        }
        if (bQueuedTetris[0] && !countDown){countDown = 10;}
 
        if (!checkMovement(xPosition, yPosition, nTetromino, nRotation)){
            bGameOver = true;
        }

        // Render Output
        if (countDown){paintTetris();}

        paintTetromino(xPosition, yPosition, nTetromino, nRotation);
        updateGrid();
    }
};

function updateGrid(){
    for (let i = 0; i < rows; i++){
        for (let j = 0; j < columns; j++){
            let id = "cell-"+String(i).padStart(nDigit, '0')+"-"+String(j).padStart(nDigit, '0');
            let square = document.getElementById(id);
        
            if(gridRender[i][j] == "_"){
                square.style.backgroundColor = "#555555";
            }else if (gridRender[i][j] == "a"){
                square.style.backgroundColor = "#f94144";
            }else if (gridRender[i][j] == "s"){
                square.style.backgroundColor = "#f3722c";
            }else if (gridRender[i][j] == "d"){
                square.style.backgroundColor = "#f8961e";
            }else if (gridRender[i][j] == "f"){
                square.style.backgroundColor = "#f9c74f";
            }else if (gridRender[i][j] == "g"){
                square.style.backgroundColor = "#90be6d";
            }else if (gridRender[i][j] == "h"){
                square.style.backgroundColor = "#43aa8b";
            }else if (gridRender[i][j] == "j"){
                square.style.backgroundColor = "#577590";
            }else if (gridRender[i][j] == "b"){
                square.style.backgroundColor = "#eeeeee";
            }else if (gridRender[i][j] == "t"){
                square.style.backgroundColor = "white";
            }
        }
    }
};

function deepCopyGrid(array){
    let temp = new Array;
    for (let i = 0; i < array.length; i++){
        temp.push( array[i].slice(0) );
    }
    return temp;
};

function checkMovement(xPos, yPos, nTetromino, nRotation){
    let tetro = tetromino[nTetromino];
    let tempCheck;

    for (let i=0; i<4;i++){
        for (let j=0; j<4; j++){
            if (yPos+j>=0){
                tempCheck = grid[yPos+j];
            }else{
                tempCheck = ['b', 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'b'];
            }

            if (tetro.charAt(mapCoordToIndex(i, j, nRotation))=="x" && tempCheck[xPos+i] != "_"){
                return false;
            }
        }
    }
    return true;
};

function paintTetromino(xPos, yPos, nTetromino, nRotation){
    let tetro = tetromino[nTetromino];
    for (let i=0; i<4;i++){
        for (let j=0; j<4; j++){
            if (tetro.charAt(mapCoordToIndex(i, j, nRotation))=="x"){
                gridRender[yPos+j][xPos+i] = "asdfghj"[nTetromino];
            }
        }
    }
};

function paintTetris(){
    if (countDown%6==1 || countDown%6==2 || countDown%6==3){
        let temp = ['b'];
        for (let i = 0; i < columns-2; i++){temp.push('t');}
        temp.push('b');

        for (let i = 0; i < bQueuedTetris.length; i++){
            gridRender[bQueuedTetris[i]] = temp;
        }
    }
}

function mapCoordToIndex(xRelative, yRelative, nRotation){
    if (nRotation%4 == 0) {return yRelative*4+xRelative;}
    if (nRotation%4 == 1) {return 12+yRelative-(4*xRelative);}
    if (nRotation%4 == 2) {return 15-(yRelative*4)-xRelative;}
    if (nRotation%4 == 3) {return 3-yRelative+(4*xRelative);}
    return 0;
};

function consolidatePiece(){
    paintTetromino(xPosition, yPosition, nTetromino, nRotation);
    grid = deepCopyGrid(gridRender);

    let tempCon = checkTetris();

    console.log(tempCon);

    xPosition = columns/2-1;
    yPosition = 0;
    nRotation = 0;

    // while (checkMovement(xPosition, yPosition-1, nTetromino, nRotation)){
    //     console.log(xPosition, yPosition);
    // }

    nTetromino = nextTetromino;
    nextTetromino = Math.floor(Math.random() * 7);

    updatePreview();

    return tempCon;
};

function checkTetris(){
    let temp = new Array;
    for (let j=1; j<rows-1; j++){
        let bFull = true;
        for (let i=0; i<columns; i++){            
            if (grid[j][i] == "_"){bFull = false;}
        }
        if (bFull){temp.push(j);}
    }
    return temp;
}

function updatePreview(){
    let src = ""+nextTetromino+".jpg";
    console.log(src);
    document.getElementById("preview").src = src;
}