function Controls(b, s) {
    var ball = b;
    var scene = s;
    var won = false;
    window.addEventListener("keydown", function (event) {
        if (!won) {
            var code = event.which;
            console.log(code);
            if (connected && yourTurn) {
                $.ajax({
                    url: "http://localhost:3000",
                    data: { type: "move", code: code },
                    type: "POST",
                    success: function (data) {
                        data = JSON.parse(data);
                        if (data.pos == "possible") {
                            move(data.x, data.z);
                            yourTurn = false;
                            var moveWaiting = setInterval(function () {
                                $.ajax({
                                    url: "http://localhost:3000",
                                    data: { type: "turnWait" },
                                    type: "POST",
                                    success: function (data) {
                                        data = JSON.parse(data);
                                        if (data.won) {
                                            clearInterval(moveWaiting);
                                            move(data.x, data.z);
                                            won = true;
                                            alert("Gracz " + data.player + " wygrał");                                                                                                                          
                                        }
                                        else {
                                            if (data.moveAgain == true) {
                                                move(data.x, data.z);
                                            }
                                            if (data.turn == player) {
                                                clearInterval(moveWaiting);
                                                yourTurn = true;
                                                move(data.x, data.z);
                                                $("#showTurn").html("Your turn");
                                            }
                                            else {
                                                $("#showTurn").html("Opponent's turn");
                                            }
                                        }
                                    }
                                });
                            }, 500);
                        }
                    }
                });
            }
        }
    }, false)
    function move(x, z) {
        var lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff});
        var geometry = new THREE.Geometry();

        geometry.vertices.push(new THREE.Vector3(ball.position.x, 2, ball.position.z));
        geometry.vertices.push(new THREE.Vector3(ball.position.x + x, 2, ball.position.z + z));

        var whiteLine = new THREE.Line(geometry, lineMaterial);

        scene.add(whiteLine);

        ball.position.x += x;
        ball.position.z += z;
    }
}