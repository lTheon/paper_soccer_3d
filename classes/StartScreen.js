function StartScreen(cam, map, b, s){
    var cameraPointer = cam;
    var mapPointer = map;
    var ball = b;
    var scene = s;
    var screen = $("<div>");
    screen.css("width", window.innerWidth)
        .css("height", window.innerHeight)
        .css("background", "rgba(0,70,0,0.3");


    $("#startScreen").append(screen)
        .css("position", "fixed")
        .css("top", 0)
        .css("right", 0)
        .css("z-index", 2);


    var fields = $("<div>");
    fields.css("width", "20%")
        .css("height", "20%")
        .css("background", "rgba(0,0,0,0.8")
        .css("position", "absolute")
        .css("left", "40%")
        .css("top", "40%")
    screen.append(fields);

    var username = $("<input>")
    username.attr("placeholder", "login")
        .css("width", "80%")
        .css("height", "20%")
        .css("text-align", "center")
        .css("font-size", "100%")
        .css("position", "absolute")
        .css("left", "10%")
        .css("top", "20%")
        .attr("id", "nickfield");
    fields.append(username);

    var log = $("<div>")
    log.html("zaloguj")
        .css("width", "80%")
        .css("height", "20%")
        .css("text-align", "center")
        .css("font-size", "100%")
        .css("position", "absolute")
        .css("left", "10%")
        .css("font-variant", "small-caps")
        .css("background", "#888888")
        .css("bottom", "20%")
        .click(function () {
            $.ajax({
                url: "http://localhost:3000",
                data: { type: "nick", nick: $("#nickfield").val() },
                type: "POST",
                success: function (data) {
                    if (data=="checked") { 
                        $.ajax({
                            url: "http://localhost:3000",
                            data: { type: "login" },
                            type: "POST",
                            success: function (data) {
                                data = JSON.parse(data);
                                if (data.resp == "ok") {
                                    $("#startScreen").remove();
                                    if (data.count == 1) {
                                        $("#showTurn").html("Opponent's turn");
                                        player = -1; //gracz drugi
                                        cameraPointer.position.z = -cameraPointer.position.z;
                                        cameraPointer.lookAt(mapPointer.position);
                                        connected = true;
                                        //----wykoanie pierwszego ruchu
                                        var firstWaiting = setInterval(function () {
                                            $.ajax({
                                                url: "http://localhost:3000",
                                                data: { type: "turnWait" },
                                                type: "POST",
                                                success: function (data) {
                                                    data = JSON.parse(data);
                                                    if (data.turn == player) {
                                                        $("#showTurn").html("Your turn");
                                                        var lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
                                                        var geometry = new THREE.Geometry();

                                                        geometry.vertices.push(new THREE.Vector3(ball.position.x, 2, ball.position.z));
                                                        geometry.vertices.push(new THREE.Vector3(ball.position.x + data.x, 2, ball.position.z + data.z));

                                                        var whiteLine = new THREE.Line(geometry, lineMaterial);

                                                        scene.add(whiteLine);
                                                        yourTurn = true;
                                                        clearInterval(firstWaiting);
                                                        ball.position.x += data.x;
                                                        ball.position.z += data.z;
                                                    }
                                                }
                                            });
                                        }, 500)
                                        //-------
                                    }
                                    else {
                                        player = 1; // gracz pierwszy
                                        $("#showTurn").html("Your turn");
                                        $("#waiting").css("position", "fixed")
                                            .css("top", 0)
                                            .css("right", 0)
                                            .css("z-index", "3")
                                            .css("height", "100%")
                                            .css("width", "100%")
                                        var waiting = $("<div>");
                                        waiting.css("positon", "fixed")
                                            .css("color", "yellow")
                                            .css("z-index", "3")
                                            .css("height", "20%")
                                            .html("Waiting for other player...")
                                            .css("left", "40%")
                                            .css("top", "20%")
                                            .css("text-align", "center")
                                            .css("padding", "7%")
                                        $("#waiting").append(waiting);


                                        yourTurn = true;
                                        var interval = setInterval(function () {
                                            console.log("czekam");
                                            $.ajax({
                                                url: "http://localhost:3000",
                                                data: { type: "wait" },
                                                type: "POST",
                                                success: function (data) {
                                                    if (data == "2") {
                                                        connected = true;
                                                        $("#waiting").remove();
                                                        clearInterval(interval);
                                                    }
                                                }
                                            });
                                        }, 500)
                                    }
                                }
                                else
                                    alert("Serwer jest pełen")
                        
                            }
                        });
                    }
                    else {
                        alert("Brak nicku w bazie danych");
                    }
                }
            })
        })
    fields.append(log);
}