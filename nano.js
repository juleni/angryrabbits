// ------------------------------------------------
// K O N S T A N T Y
// ------------------------------------------------
var CANVAS_WIDTH = 800;
var CANVAS_HEIGHT = 600;
var NANONAUT_WIDTH = 235;
var NANONAUT_HEIGHT = 323
var NANONAUT_Y_ZRYCHLENIE = 1;
var NANONAUT_SKOK_RYCHLOST = 20;
var NANONAUT_X_RYCHLOST = 5;
var NANONAUT_POCET_SNIMKOV_ANIMACIE = 10;
var NANONAUT_ANIMACIA_RYCHLOST = 7;
var NANONAUT_MAX_ZDRAVIE = 100;

// var ROBOT_WIDTH = 141;
// var ROBOT_HEIGHT = 139;
// var ROBOT_POCET_SNIMKOV_ANIMACIE = 9;
var ROBOT_WIDTH = 125;
var ROBOT_HEIGHT = 150;
var ROBOT_POCET_SNIMKOV_ANIMACIE = 8;

var ROBOT_ANIMACIA_RYCHLOST = 5;
var ROBOT_X_RYCHLOST = 4;
var MIN_VZDIALENOST_MEDZI_ROBOTMI = 400;
var MAX_VZDIALENOST_MEDZI_ROBOTMI = 1200;
var MAX_AKTIVNYCH_ROBOTOV = 3;

var POZADIE_WIDTH = 1000;

var ZEM_Y = 540;

var KOD_MEDZERNIK = 32;

var ZATRASENIE_RADIUS = 16;

var MOD_HRA_BEZI = 0;
var MOD_HRA_SKONCILA = 1;



// ------------------------------------------------
// N A S T A V E N I A
// ------------------------------------------------
var canvas = document.createElement('canvas');
var c = canvas.getContext('2d');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
canvas.id = "canvas";
canvas.className = "img-fluid img-thumbnail height: 90%";
var canvasDiv = document.getElementById('canvas-container');
canvasDiv.appendChild(canvas);

var nanonautImage = new Image();
nanonautImage.src = 'animatedLea.png';

var pozadieImage = new Image();
pozadieImage.src = 'background.png';

var ker1Image = new Image();
ker1Image.src = 'bush1.png';

var ker2Image = new Image();
ker2Image.src = 'bush2.png';

var robotImage = new Image();
robotImage.src = 'animatedChlpka.png';


var nanonautX = CANVAS_WIDTH / 2;
var nanonautY = ZEM_Y - NANONAUT_HEIGHT;
var nanonautYRychlost = 0;
var nanonautVoVzduchu = false;
var nanonautZdravie = NANONAUT_MAX_ZDRAVIE;

var nanonautSpriteSheet = {
    pocetSnimkovVRade: 5,
    spriteWidth: NANONAUT_WIDTH,
    spriteHeight: NANONAUT_HEIGHT,
    image: nanonautImage
};

var robotSpriteSheet = {
    pocetSnimkovVRade: 8,
    spriteWidth: ROBOT_WIDTH,
    spriteHeight: ROBOT_HEIGHT,
    image: robotImage
};

var nanonautKoliznyObdlznik = {
    xOffset: 20,
    yOffset: 20,
    width: 160,
    height: 200
};

var robotKoliznyObdlznik = {
    xOffset: 0,
    yOffset: 0,
    width: 110,
    height: 120
};

var robotData = [];

var kameraX = 0;
var kameraY = 0;

var medzernikStlaceny = false;
var nanonautSnimokNr = 0;
var hraSnimkyPocitadlo = 0;
var zatrasenie = false;
var hraMod = MOD_HRA_BEZI;

var kerData = generujKriky(); 

window.addEventListener('keydown', onKeyDown);
window.addEventListener('keyup', onKeyUp);
window.addEventListener('load', start);

window.addEventListener("touchstart", onTouchStart, false);
window.addEventListener("touchend", onTouchEnd, false);


function start() {
    window.requestAnimationFrame(mainLoop);
}

function generujKriky() {
    var poleGenerovanychKrikov = [];
    var kerX = 0;
    while (kerX < (2 * CANVAS_WIDTH)) {
        var kerRandomImage;
        if (Math.random() >= 0.5) {
            kerRandomImage = ker1Image;
        } else {
            kerRandomImage = ker2Image;
        }

        poleGenerovanychKrikov.push({
            x: kerX,
            y: 80 + Math.random()*20,
            image: kerRandomImage
        });
        kerX += 150 + Math.random() * 200;
    }

    return poleGenerovanychKrikov;
}

// ------------------------------------------------
// H L A V N A   S L U C K A
// ------------------------------------------------
function mainLoop() {
    update();
    draw();
    window.requestAnimationFrame(mainLoop);
}

// ------------------------------------------------
// R E A K CI E   H R A C A
// ------------------------------------------------
function onTouchStart(event) {
        medzernikStlaceny = true;
}

function onTouchEnd(event) {
    medzernikStlaceny = false;
}


function onKeyDown(event) {
    if (event.keyCode === KOD_MEDZERNIK) {
        medzernikStlaceny = true;
        console.log("onKeyDown medzernikStlaceny="+medzernikStlaceny);
    }
}

function onKeyUp(event) {
    if (event.keyCode === KOD_MEDZERNIK) {
        medzernikStlaceny = false;
        console.log("onKeyUp medzernikStlaceny="+medzernikStlaceny);
    }
}

// ------------------------------------------------
// A K T U A L I Z A C I E
// ------------------------------------------------
function update() {
    if (hraMod != MOD_HRA_BEZI) { return; } // pokracuj len ak nie je koniec hry

    hraSnimkyPocitadlo += 1;

    nanonautX = nanonautX + NANONAUT_X_RYCHLOST;

    if (medzernikStlaceny && !nanonautVoVzduchu)  {
        nanonautYRychlost = -NANONAUT_SKOK_RYCHLOST;
        nanonautVoVzduchu =  true;
        console.log("SKOK");
    }


    // aktualizacia animacie
    if ((hraSnimkyPocitadlo % NANONAUT_ANIMACIA_RYCHLOST) === 0) {
        nanonautSnimokNr += 1;
        if (nanonautSnimokNr >= NANONAUT_POCET_SNIMKOV_ANIMACIE) {
            nanonautSnimokNr = 0;
        }
    }

    // aktualizacia kamery, aby ukazovala 150px nalavo od nanonauta
    kameraX = nanonautX - 150;
    
    // aktualizacia nanonauta
    nanonautY = nanonautY + nanonautYRychlost;
    nanonautYRychlost = nanonautYRychlost + NANONAUT_Y_ZRYCHLENIE;
    // uprav suradnicu ak sa uz dotkol zeme
    if (nanonautY > (ZEM_Y - NANONAUT_HEIGHT)) {
        nanonautY = ZEM_Y - NANONAUT_HEIGHT;
        nanonautYRychlost = 0;
        nanonautVoVzduchu = false;
    }
    
    // aktualizacia krikov
    for (var i=0; i<kerData.length; i++) {
        //console.log("kerData[i].x / y = " + kerData[i].x + " / " + kerData[i].y);    
        if ((kerData[i].x - kameraX) < -CANVAS_WIDTH) {
            kerData[i].x += (2*CANVAS_WIDTH) + 150;
        }
    }

    // aktualizacia robotov
    zatrasenie = false;
    var nanonautRobotKolizia = updateRoboti();
    if (nanonautRobotKolizia) {
        zatrasenie = true;
        if (nanonautZdravie > 0) {
            nanonautZdravie -=1; // po kolizii odcitaj bod zdravia
        }
        // skontroluj ci hra skoncila a ak ano, prestav mod
        if (nanonautZdravie <= 0) { 
            hraMod = MOD_HRA_SKONCILA;
            zatrasenie = false;
        }
    }
}

function updateRoboti() {
    var nanonautRobotKolizia = false;
    // pohyb a animacia robotov
    for (var i=0; i<robotData.length; i++) {
        // testuj koliziu nanonauta a robota
      
        if (OtazkaPrekryvaNanonautRobota(
                nanonautX + nanonautKoliznyObdlznik.xOffset,
                nanonautY + nanonautKoliznyObdlznik.yOffset,
                nanonautKoliznyObdlznik.width,
                nanonautKoliznyObdlznik.height,
                robotData[i].x + robotKoliznyObdlznik.xOffset,
                robotData[i].y + robotKoliznyObdlznik.yOffset,
                robotKoliznyObdlznik.width,
                robotKoliznyObdlznik.height)) {
            // doslo ku kolizii
            console.log("AU - kolizia");
            nanonautRobotKolizia = true;
        }

        robotData[i].x -= ROBOT_X_RYCHLOST; 
        if ((hraSnimkyPocitadlo % ROBOT_ANIMACIA_RYCHLOST) === 0) {
            robotData[i].snimokNr += 1;
            if (robotData[i].snimokNr >= ROBOT_POCET_SNIMKOV_ANIMACIE)
            robotData[i].snimokNr = 0;
        }
    }
    
    // odstranenie robotov, ktori su mimo obrazovky
    var robotIndex = 0;
    while (robotIndex < robotData.length) {
        if (robotData[robotIndex].x < kameraX - ROBOT_WIDTH) {
            robotData.splice(robotIndex, 1);
            console.log("Robot odstraneny...");
        } else {
            robotIndex++;
        }
    }

    if (robotData.length < MAX_AKTIVNYCH_ROBOTOV) {
        var poslednyRobotX = CANVAS_WIDTH;
        if (robotData.length > 0) {
            poslednyRobotX = robotData[robotData.length - 1].x;
        }
        
        var novyRobotX = poslednyRobotX + MIN_VZDIALENOST_MEDZI_ROBOTMI + 
                         Math.random() * (MAX_VZDIALENOST_MEDZI_ROBOTMI - MIN_VZDIALENOST_MEDZI_ROBOTMI);
        robotData.push({
            x: novyRobotX,
            y: ZEM_Y - ROBOT_HEIGHT,
            snimokNr: 0
        }); 
    }
    return nanonautRobotKolizia;
}

function OtazkaPrekryvaNanonautRobotaPozdlzJednejOsi(nanonautBlizkoX, 
                                                     nanonautDalekoX,
                                                     robotBlizkoX, 
                                                     robotDalekoX) {
    var nanonautPrekryvaRobotovBlizkyOkraj = (nanonautDalekoX >= robotBlizkoX) &&
                                             (nanonautDalekoX <= robotDalekoX);
    var nanonautPrekryvaRobotovDalekyOkraj = (nanonautBlizkoX >= robotBlizkoX) &&
                                             (nanonautBlizkoX <= robotDalekoX);
    var nanonautPrekryvaCelehoRobota = (nanonautBlizkoX <= robotBlizkoX) &&
                                             (nanonautDalekoX >= robotDalekoX);
    return nanonautPrekryvaRobotovBlizkyOkraj || nanonautPrekryvaRobotovDalekyOkraj ||
           nanonautPrekryvaCelehoRobota;                                                                       ;
}

function OtazkaPrekryvaNanonautRobota(nanonautX, 
                                      nanonautY, 
                                      nanonautWidth, 
                                      nanonautHeight,
                                      robotX, 
                                      robotY, 
                                      robotWidth, 
                                      robotHeight) {
   var nanonautPrekryvaRobotaNaOseX = OtazkaPrekryvaNanonautRobotaPozdlzJednejOsi(
                                        nanonautX,
                                        nanonautX + nanonautWidth,
                                        robotX,
                                        robotX + robotWidth);
   var nanonautPrekryvaRobotaNaOseY = OtazkaPrekryvaNanonautRobotaPozdlzJednejOsi(
                                        nanonautY,
                                        nanonautY + nanonautHeight,
                                        robotY,
                                        robotY + robotHeight);
    return nanonautPrekryvaRobotaNaOseX && nanonautPrekryvaRobotaNaOseY;                                        
}
// ------------------------------------------------
// Z O B R A Z E N I E
// ------------------------------------------------
function draw() {
    // zatras obrazovkou ak treba
    var otrasKameraX = kameraX;
    var otrasKameraY = kameraY;

    if (zatrasenie) {
        otrasKameraX += (Math.random() -0.5) * ZATRASENIE_RADIUS;
        otrasKameraY += (Math.random() -0.5) * ZATRASENIE_RADIUS;
    }

    // zobrazenie oblohy
    c.fillStyle = 'LightSkyBlue';
    c.fillRect(0, 0, CANVAS_WIDTH, ZEM_Y - 40);

    // zobrazenie pozadia
    var pozadieX = -(kameraX % POZADIE_WIDTH);
    c.drawImage(pozadieImage, pozadieX, -210);
    c.drawImage(pozadieImage, pozadieX + POZADIE_WIDTH, -210);

    // zobrazenie zeme
    c.fillStyle = 'ForestGreen';
    c.fillRect(0, ZEM_Y - 40, CANVAS_WIDTH, CANVAS_HEIGHT - ZEM_Y + 40);

    // zobrazenie krikov
    for (var i=0; i<kerData.length; i++) {
        c.drawImage(kerData[i].image, kerData[i].x - otrasKameraX, ZEM_Y - kerData[i].y - otrasKameraY);
    }

    // zobrazenie robotov
    for (var i=0; i<robotData.length; i++) {
        zobrazAnimovanySprite(robotData[i].x - kameraX, robotData[i].y - kameraY, 
                              robotData[i].snimokNr, robotSpriteSheet);
    }

    // zobraz nanonauta
    zobrazAnimovanySprite(nanonautX - otrasKameraX, nanonautY - otrasKameraY, 
                          nanonautSnimokNr, nanonautSpriteSheet);

    // zobraz vzdialenost, ktoru nanonaut ubehol
    var nanonautVzdialenost = nanonautX / 100;
    c.fillStyle = 'black';
    c.font = '20px sans-serif';
    c.fillText("Ran away: " + nanonautVzdialenost.toFixed(0) + "m", 20, 30);
    
    // zobraz ukazatel zdravia
    // zdravie vydelime max. zdravim a ziskame relativne zdravie. To potom vynasobime
    // sirkou ukazatela zdravia. Tak sa relativne zdravie roztiahne po celej dlzke ukazatela
    c.fillText("Health: ", 320, 30);
    c.fillStyle = 'red';
    c.fillRect(400, 15, nanonautZdravie / NANONAUT_MAX_ZDRAVIE * 380, 20);
    c.strokeRect(400, 15, 380, 20);

    // po ukonceni hry zobraz napis
    if (hraMod == MOD_HRA_SKONCILA) {
        c.fillStyle = "black";
        c.font = '96px sans-serif';
        c.fillText("GAME OVER", 120, 300);
    }

    // zobrazenie animovaneho spritu
    function zobrazAnimovanySprite(screenX, screenY, snimokNr, spriteSheet) {
    // zobrazenie 
        var spriteSheetRada = Math.floor(snimokNr / spriteSheet.pocetSnimkovVRade);
        var spriteSheetStlpec = snimokNr % spriteSheet.pocetSnimkovVRade;
        var spriteSheetX = spriteSheetStlpec * spriteSheet.spriteWidth;
        var spriteSheetY = spriteSheetRada * spriteSheet.spriteHeight;
        // vykresli obrazok so spreadsheetu s nasledovnymi parametrami:
        // 1 - obrazok, podla ktoreho sa bude vykreslovat
        // 2 - X a Y suradnice obdlznika (lavy horny roh), ktory sa z obrazku vyberie
        // 3 - sirka a vyska toho obdlznika
        // 4 - X a Y suradnice miesta, kde sa zobrazi dana cast obrazku
        // 5 - sirka a vyska zobrazenej casti
        c.drawImage(spriteSheet.image, 
                    spriteSheetX, spriteSheetY, 
                    spriteSheet.spriteWidth, spriteSheet.spriteHeight, screenX, screenY,
                    spriteSheet.spriteWidth, spriteSheet.spriteHeight);
    };
}