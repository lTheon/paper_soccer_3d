var fs = require("fs");
var http = require("http");
var qs = require("querystring");


//-------------mongo
var mongoose = require("mongoose");
var Models = require("./database/Models.js")(mongoose);
mongoose.connect('mongodb://localhost/test');

var Operations = require("./database/Operations.js")
var db;
var opers = new Operations();


//---------------PARAMETRY GRY---------
var playersCount = 0;
var ballPositionX = 4;
var ballPositionY = 5;      //w modelu przestrzennym Y=odwrócone Z

var currentTurn = 1;        //który gracz obecnie powinien oddać ruch (1 - pierwszy | -1 - drugi)
var movePassed = {};


function playfieldPart() {
    this.moveUp_Possible = true;
    this.moveUpRight_Possible = true;
    this.moveRight_Possible = true;
    this.moveDownRight_Possible = true;
    this.moveDown_Possible = true;
    this.moveDownLeft_Possible = true;
    this.moveLeft_Possible = true;
    this.moveUpLeft_Possible = true;
    this.visited = false;
}

var playfield = new Array();
for (var i = 0; i < 9; i++) {
    playfield[i] = new Array();
}
for (var i = 0; i < 9; i++) {
    for (var j = 0; j < 11; j++) {
        playfield[i][j] = new playfieldPart();
        if (i == 0) {
            playfield[i][j].moveUp_Possible = false;
            playfield[i][j].moveUpLeft_Possible = false;
            playfield[i][j].moveLeft_Possible = false;
            playfield[i][j].moveDownLeft_Possible = false;
            playfield[i][j].moveDown_Possible = false;
            playfield[i][j].visited = true;
        }
        if (i == 8) {
            playfield[i][j].moveUp_Possible = false;
            playfield[i][j].moveUpRight_Possible = false;
            playfield[i][j].moveRight_Possible = false;
            playfield[i][j].moveDownRight_Possible = false;
            playfield[i][j].moveDown_Possible = false;
            playfield[i][j].visited = true;
        }
        if (j == 0) {
            playfield[i][j].moveLeft_Possible = false;
            playfield[i][j].moveUpLeft_Possible = false;
            playfield[i][j].moveUp_Possible = false;
            playfield[i][j].moveUpRight_Possible = false;
            playfield[i][j].moveRight_Possible = false;
            playfield[i][j].visited = true;
        }
        if (j == 10) {
            playfield[i][j].moveLeft_Possible = false;
            playfield[i][j].moveDownLeft_Possible = false;
            playfield[i][j].moveDown_Possible = false;
            playfield[i][j].moveDownRight_Possible = false;
            playfield[i][j].moveRight_Possible = false;
            playfield[i][j].visited = true;
        }
    }
}

playfield[4][5].visited = true; //pozycja początkowa

//--------ruch do bramek

//---------żółta
playfield[3][0].moveUpRight_Possible = true;

playfield[4][0].moveUpLeft_Possible = true;
playfield[4][0].moveUp_Possible = true;
playfield[4][0].moveUpRight_Possible = true;
playfield[4][0].visited = false;

playfield[5][0].moveUpLeft_Possible = true;

//--------niebieska

playfield[3][10].moveDownRight_Possible = true;

playfield[4][10].moveDownLeft_Possible = true;
playfield[4][10].moveDown_Possible = true;
playfield[4][10].moveDownRight_Possible = true;
playfield[4][10].visited = false;

playfield[5][10].moveDownLeft_Possible = true;

//-------------------------------------
var server = http.createServer(function (request, response) {
    //console.log(request.url);
    switch (request.method) {
        case "GET":
            //---------stworzenie ścieżki do pliku bez / na początku
            var path = new Array();
            for (var i = 1; request.url[i] != undefined; i++) {
                path.push(request.url[i]);
            }
            path = path.join('');
            //----------------------


            if (request.url === "/") {
                fs.readFile("index.html", function (error, data) {
                    if (error) {
                        response.writeHead(404, { 'Content-Type': 'text/html' });
                        response.write("<h1>błąd 404 - nie ma pliku!<h1>");
                        response.end();
                    }
                    else {
                        response.writeHead(200, { 'Content-Type': 'text/html' });
                        response.write(data);
                        response.end();
                    }
                })
            }
            else if (request.url.indexOf(".dae") != -1) {
                fs.readFile(path, function (error, data) {
                    response.writeHead(200);
                    response.write(data);
                    response.end();
                })
            }
            else if (request.url.indexOf(".png") != -1) {
                fs.readFile(path, function (error, data) {
                    response.writeHead(200);
                    response.write(data);
                    response.end();
                })
            }
            else if (request.url.indexOf(".css") != -1) {
                fs.readFile(path, function (error, data) {
                    response.writeHead(200, { 'Content-Type': 'text/css' });
                    response.write(data);
                    response.end();
                })
            }
            else if (request.url.indexOf(".js") != -1) {
                fs.readFile(path, function (error, data) {
                    response.writeHead(200, { 'Content-Type': 'application/javascript' });
                    response.write(data);
                    response.end();
                })
            }
            break;


        case "POST":
            var allData = "";
            request.on("data", function (data) {
                allData += data;
            })
            request.on("end", function (data) {
                finish = qs.parse(allData)
                if (finish.type == "login") {
                    if (playersCount < 2) {
                        var resp = { resp: "ok", count: playersCount } //count - jeśli jest już jeden gracz, kamera ma się obraca
                        playersCount++;
                    }
                    else {
                        var resp = { resp: "full" }
                    }
                    resp = JSON.stringify(resp);
                    response.end(resp);
                }
                if (finish.type == "nick") {
                    opers.SelectByImie(Models.user, finish.nick, 1, function (data) {
                        response.end(data);
                    })
                }

                if (finish.type == "wait") {
                    response.end(playersCount.toString());
                }


                if (finish.type == "turnWait") {
                    movePassed.turn = currentTurn;
                    var pass = JSON.stringify(movePassed);
                    response.end(pass);

                    //resetowanie w wypadku ponownego ruchu
                    movePassed.moveAgain = false;
                    movePassed.x = 0;
                    movePassed.z = 0;
                }

                if (finish.type == "move") {

                    //----gracz 1
                    console.log(playfield[ballPositionX][ballPositionY]);
                    if (currentTurn == 1) {
                        //---------------RUCH DO GÓRY
                        if (finish.code == 38) {
                            if (playfield[ballPositionX][ballPositionY].moveUp_Possible == true) {
                                playfield[ballPositionX][ballPositionY].moveUp_Possible = false;
                                var move = { pos: "possible", x: 0, z: currentTurn * 32 };
                                ballPositionY--;
                                if (ballPositionY == -1) {
                                    move.won = true;
                                    move.player = 1;
                                }
                                
                                else{
                                    playfield[ballPositionX][ballPositionY].moveDown_Possible = false;
                                    movePassed = move;
                                    if (playfield[ballPositionX][ballPositionY].visited) {
                                        movePassed.moveAgain = true;
                                    }
                                    else {
                                        currentTurn = -currentTurn;
                                    }
                                    playfield[ballPositionX][ballPositionY].visited = true;
                                }
                            }
                            else {
                                var move = { pos: "impossible" }
                            }
                        }
                        //---------------RUCH DO GÓRY W PRAWO
                        if (finish.code == 33) {
                            if (playfield[ballPositionX][ballPositionY].moveUpRight_Possible == true) {
                                playfield[ballPositionX][ballPositionY].moveUpRight_Possible = false;
                                var move = { pos: "possible", x: currentTurn * -32, z: currentTurn * 32 };
                                ballPositionY --;
                                ballPositionX++;
                                if (ballPositionY == -1) {
                                    move.won = true;
                                    move.player = 1;
                                    currentTurn = -currentTurn;
                                    movePassed = move;
                                }
                                else {
                                    playfield[ballPositionX][ballPositionY].moveDownLeft_Possible = false;
                                    movePassed = move;
                                    if (playfield[ballPositionX][ballPositionY].visited) {
                                        movePassed.moveAgain = true;
                                    }
                                    else {
                                        currentTurn = -currentTurn;
                                    }
                                    playfield[ballPositionX][ballPositionY].visited = true;
                                }
                            }
                            else {
                                var move = { pos: "impossible" }
                            }
                        }

                        //---------------RUCH W PRAWO
                        if (finish.code == 39) {
                            if (playfield[ballPositionX][ballPositionY].moveRight_Possible == true) {
                                playfield[ballPositionX][ballPositionY].moveRight_Possible = false;
                                var move = { pos: "possible", x: currentTurn * -32, z: 0 };
                                ballPositionX ++;
                                playfield[ballPositionX][ballPositionY].moveLeft_Possible = false;
                                movePassed = move;
                                if (playfield[ballPositionX][ballPositionY].visited) {
                                    movePassed.moveAgain = true;
                                }
                                else {
                                    currentTurn = -currentTurn;
                                }
                                playfield[ballPositionX][ballPositionY].visited = true;
                            }
                            else {
                                var move = { pos: "impossible" }
                            }
                        }
                        //---------------RUCH W DÓŁ W PRAWO
                        if (finish.code == 34) {
                            if (playfield[ballPositionX][ballPositionY].moveDownRight_Possible == true) {
                                playfield[ballPositionX][ballPositionY].moveDownRight_Possible = false;
                                var move = { pos: "possible", x: currentTurn * -32, z: currentTurn * -32 };
                                ballPositionX ++;
                                ballPositionY++;
                                if (ballPositionY == 11) {
                                    move.won = true;
                                    move.player = 2;
                                    currentTurn = -currentTurn;
                                    movePassed = move;
                                }
                                else {
                                    playfield[ballPositionX][ballPositionY].moveUpLeft_Possible = false;
                                    movePassed = move;
                                    if (playfield[ballPositionX][ballPositionY].visited) {
                                        movePassed.moveAgain = true;
                                    }
                                    else {
                                        currentTurn = -currentTurn;
                                    }
                                    playfield[ballPositionX][ballPositionY].visited = true;
                                }
                            }
                            else {
                                var move = { pos: "impossible" }
                            }
                        }
                        //---------------RUCH W DÓŁ
                        if (finish.code == 40) {
                            if (playfield[ballPositionX][ballPositionY].moveDown_Possible == true) {
                                playfield[ballPositionX][ballPositionY].moveDown_Possible = false;
                                var move = { pos: "possible", x: 0, z: currentTurn * -32 };
                                ballPositionY++;
                                if (ballPositionY == 11) {
                                    move.won = true;
                                    move.player = 2;
                                    currentTurn = -currentTurn;
                                    movePassed = move;
                                }
                                else {
                                    playfield[ballPositionX][ballPositionY].moveUp_Possible = false;
                                    movePassed = move;
                                    if (playfield[ballPositionX][ballPositionY].visited) {
                                        movePassed.moveAgain = true;
                                    }
                                    else {
                                        currentTurn = -currentTurn;
                                    }
                                    playfield[ballPositionX][ballPositionY].visited = true;
                                }
                            }
                            else {
                                var move = { pos: "impossible" }
                            }
                        }
                        //--------------RUCH W DÓŁ W LEWO
                        if (finish.code == 35) {
                            if (playfield[ballPositionX][ballPositionY].moveDownLeft_Possible == true) {
                                playfield[ballPositionX][ballPositionY].moveDownLeft_Possible = false;
                                var move = { pos: "possible", x: currentTurn * 32, z: currentTurn * -32 };
                                ballPositionX --;
                                ballPositionY++;
                                if (ballPositionY == 11) {
                                    move.won = true;
                                    move.player = 2;
                                    currentTurn = -currentTurn;
                                    movePassed = move;
                                }
                                else {
                                    playfield[ballPositionX][ballPositionY].moveUpRight_Possible = false;
                                    movePassed = move;
                                    if (playfield[ballPositionX][ballPositionY].visited) {
                                        movePassed.moveAgain = true;
                                    }
                                    else {
                                        currentTurn = -currentTurn;
                                    }
                                    playfield[ballPositionX][ballPositionY].visited = true;
                                }
                            }
                            else {
                                var move = { pos: "impossible" }
                            }
                        }
                        //--------------RUCH W LEWO
                        if (finish.code == 37) {
                            if (playfield[ballPositionX][ballPositionY].moveLeft_Possible == true) {
                                playfield[ballPositionX][ballPositionY].moveLeft_Possible = false;
                                var move = { pos: "possible", x: currentTurn * 32, z: 0 };
                                ballPositionX --;
                                playfield[ballPositionX][ballPositionY].moveRight_Possible = false
                                movePassed = move;
                                if (playfield[ballPositionX][ballPositionY].visited) {
                                    movePassed.moveAgain = true;
                                }
                                else {
                                    currentTurn = -currentTurn;
                                }
                                playfield[ballPositionX][ballPositionY].visited = true;
                            }
                            else {
                                var move = { pos: "impossible" }
                            }
                        }
                        //--------------RUCH DO GÓRY W LEWO
                        if (finish.code == 36) {
                            if (playfield[ballPositionX][ballPositionY].moveUpLeft_Possible == true) {
                                playfield[ballPositionX][ballPositionY].moveUpLeft_Possible = false;
                                var move = { pos: "possible", x: currentTurn * 32, z: currentTurn * 32 };
                                ballPositionX --;
                                ballPositionY--;
                                if (ballPositionY == -1) {
                                    move.won = true;
                                    move.player = 1;
                                    currentTurn = -currentTurn;
                                    movePassed = move;
                                }
                                else {
                                    playfield[ballPositionX][ballPositionY].moveDownRight_Possible = false;
                                    movePassed = move;
                                    if (playfield[ballPositionX][ballPositionY].visited) {
                                        movePassed.moveAgain = true;
                                    }
                                    else {
                                        currentTurn = -currentTurn;
                                    }
                                    playfield[ballPositionX][ballPositionY].visited = true;
                                }
                            }
                            else {
                                var move = { pos: "impossible" }
                            }
                        }
                    }

                    //-----gracz 2

                    else {
                        //---------------RUCH DO GÓRY
                        if (finish.code == 38) {
                            if (playfield[ballPositionX][ballPositionY].moveDown_Possible == true) {
                                playfield[ballPositionX][ballPositionY].moveDown_Possible = false;
                                var move = { pos: "possible", x: 0, z: currentTurn * 32 };
                                ballPositionY++;
                                if (ballPositionY == 11) {
                                    move.won = true;
                                    move.player = 2;
                                    currentTurn = -currentTurn;
                                    movePassed = move;
                                }
                                else {
                                    playfield[ballPositionX][ballPositionY].moveUp_Possible = false;
                                    movePassed = move;
                                    if (playfield[ballPositionX][ballPositionY].visited) {
                                        movePassed.moveAgain = true;
                                    }
                                    else {
                                        currentTurn = -currentTurn;
                                    }
                                    playfield[ballPositionX][ballPositionY].visited = true;
                                }
                            }
                            else {
                                var move = { pos: "impossible" }
                            }
                        }
                        //---------------RUCH DO GÓRY W PRAWO
                        if (finish.code == 33) {
                            if (playfield[ballPositionX][ballPositionY].moveDownLeft_Possible == true) {
                                playfield[ballPositionX][ballPositionY].moveDownLeft_Possible = false;
                                var move = { pos: "possible", x: currentTurn * -32, z: currentTurn * 32 };
                                ballPositionY++;
                                ballPositionX--;
                                if (ballPositionY == 11) {
                                    move.won = true;
                                    move.player = 2;
                                    currentTurn = -currentTurn;
                                    movePassed = move;
                                }
                                else {
                                    playfield[ballPositionX][ballPositionY].moveUpRight_Possible = false;
                                    movePassed = move;
                                    if (playfield[ballPositionX][ballPositionY].visited) {
                                        movePassed.moveAgain = true;
                                    }
                                    else {
                                        currentTurn = -currentTurn;
                                    }
                                    playfield[ballPositionX][ballPositionY].visited = true;
                                }
                            }
                            else {
                                var move = { pos: "impossible" }
                            }
                        }

                        //---------------RUCH W PRAWO
                        if (finish.code == 39) {
                            if (playfield[ballPositionX][ballPositionY].moveLeft_Possible == true) {
                                playfield[ballPositionX][ballPositionY].moveLeft_Possible = false;
                                var move = { pos: "possible", x: currentTurn * -32, z: 0 };
                                ballPositionX --;
                                playfield[ballPositionX][ballPositionY].moveRight_Possible = false;
                                movePassed = move;
                                if (playfield[ballPositionX][ballPositionY].visited) {
                                    movePassed.moveAgain = true;
                                }
                                else {
                                    currentTurn = -currentTurn;
                                }
                                playfield[ballPositionX][ballPositionY].visited = true;
                            }
                            else {
                                var move = { pos: "impossible" }
                            }
                        }
                        //---------------RUCH W DÓŁ W PRAWO
                        if (finish.code == 34) {
                            if (playfield[ballPositionX][ballPositionY].moveUpLeft_Possible == true) {
                                playfield[ballPositionX][ballPositionY].moveUpLeft_Possible = false;
                                var move = { pos: "possible", x: currentTurn * -32, z: currentTurn * -32 };
                                ballPositionX --;
                                ballPositionY--;
                                if (ballPositionY == -1) {
                                    move.won = true;
                                    move.player = 1;
                                    currentTurn = -currentTurn;
                                    movePassed = move;
                                }
                                else {
                                    playfield[ballPositionX][ballPositionY].moveDownRight_Possible = false;
                                    movePassed = move;
                                    if (playfield[ballPositionX][ballPositionY].visited) {
                                        movePassed.moveAgain = true;
                                    }
                                    else {
                                        currentTurn = -currentTurn;
                                    }
                                    playfield[ballPositionX][ballPositionY].visited = true;
                                }
                            }
                            else {
                                var move = { pos: "impossible" }
                            }
                        }
                        //---------------RUCH W DÓŁ
                        if (finish.code == 40) {
                            if (playfield[ballPositionX][ballPositionY].moveUp_Possible == true) {
                                playfield[ballPositionX][ballPositionY].moveUp_Possible = false;
                                var move = { pos: "possible", x: 0, z: currentTurn * -32 };
                                ballPositionY--;
                                if (ballPositionY == -1) {
                                    move.won = true;
                                    move.player = 1;
                                    currentTurn = -currentTurn;
                                    movePassed = move;
                                }
                                else {
                                    playfield[ballPositionX][ballPositionY].moveDown_Possible = false;
                                    movePassed = move;
                                    if (playfield[ballPositionX][ballPositionY].visited) {
                                        movePassed.moveAgain = true;
                                    }
                                    else {
                                        currentTurn = -currentTurn;
                                    }
                                    playfield[ballPositionX][ballPositionY].visited = true;
                                }
                            }
                            else {
                                var move = { pos: "impossible" }
                            }
                        }
                        //--------------RUCH W DÓŁ W LEWO
                        if (finish.code == 35) {
                            if (playfield[ballPositionX][ballPositionY].moveUpRight_Possible == true) {
                                playfield[ballPositionX][ballPositionY].moveUpRight_Possible = false;
                                var move = { pos: "possible", x: currentTurn * 32, z: currentTurn * -32 };
                                ballPositionX ++;
                                ballPositionY--;
                                if (ballPositionY == -1) {
                                    move.won = true;
                                    move.player = 1;
                                    currentTurn = -currentTurn;
                                    movePassed = move;
                                }
                                else {
                                    playfield[ballPositionX][ballPositionY].moveDownLeft_Possible = false;
                                    movePassed = move;
                                    if (playfield[ballPositionX][ballPositionY].visited) {
                                        movePassed.moveAgain = true;
                                    }
                                    else {
                                        currentTurn = -currentTurn;
                                    }
                                    playfield[ballPositionX][ballPositionY].visited = true;
                                }
                            }
                            else {
                                var move = { pos: "impossible" }
                            }
                        }
                        //--------------RUCH W LEWO
                        if (finish.code == 37) {
                            if (playfield[ballPositionX][ballPositionY].moveRight_Possible == true) {
                                playfield[ballPositionX][ballPositionY].moveRight_Possible = false;
                                var move = { pos: "possible", x: currentTurn * 32, z: 0 };
                                ballPositionX ++;
                                playfield[ballPositionX][ballPositionY].moveLeft_Possible = false
                                movePassed = move;
                                if (playfield[ballPositionX][ballPositionY].visited) {
                                    movePassed.moveAgain = true;
                                }
                                else {
                                    currentTurn = -currentTurn;
                                }
                                playfield[ballPositionX][ballPositionY].visited = true;
                            }
                            else {
                                var move = { pos: "impossible" }
                            }
                        }
                        //--------------RUCH DO GÓRY W LEWO
                        if (finish.code == 36) {
                            if (playfield[ballPositionX][ballPositionY].moveDownRight_Possible == true) {
                                playfield[ballPositionX][ballPositionY].moveDownRight_Possible = false;
                                var move = { pos: "possible", x: currentTurn * 32, z: currentTurn * 32 };
                                ballPositionX ++;
                                ballPositionY++;
                                if (ballPositionY == 11) {
                                    move.won = true;
                                    move.player = 2;
                                    currentTurn = -currentTurn;
                                    movePassed = move;
                                }
                                else {
                                    playfield[ballPositionX][ballPositionY].moveUpLeft_Possible = false;
                                    movePassed = move;
                                    if (playfield[ballPositionX][ballPositionY].visited) {
                                        movePassed.moveAgain = true;
                                    }
                                    else {
                                        currentTurn = -currentTurn;
                                    }
                                    playfield[ballPositionX][ballPositionY].visited = true;
                                }
                            }
                            else {
                                var move = { pos: "impossible" }
                            }
                        }
                    }
                    move = JSON.stringify(move);
                    response.end(move);
                    console.log(playfield[ballPositionX][ballPositionY]);
                }

                
            })
    }
});

server.listen(3000);
console.log("serwer staruje na porcie 3000 - ten komunikat zobaczysz tylko raz");


function connectToMongo() {

    db = mongoose.connection;
    db.on("error", function () {
        console.log("problem z mongo")
    });
    db.once("open", function () {
        //var user = new Models.user({ name: "Janusz" });
        //user.validate(function (err) {
        //    console.log(err);
        //});

        //opers.InsertOne(user);
        console.log("mongo jest podłączone - można wykonywać operacje na bazie");
    });
    db.once("close", function () {
        console.log("mongodb zostało odłączone");
    });
}

connectToMongo();
