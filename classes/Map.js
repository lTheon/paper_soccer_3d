function Map() {
    var map = new THREE.Object3D();

    //--------------------POLE
    for (var i = -5; i < 5; i++) {
        for (var j = -4; j < 4; j++) {
            var squareObject = new Square();
            var square = squareObject.getFullSquare();
            square.position.set(j * 32, 0, i * 32);
            map.add(square);
        }
    }
    //-------------------BRAMKI
    var squareObject = new Square();
    var square;

    square = squareObject.getGoal_1();
    square.position.set(-32, 0, 160);
    map.add(square);

    squareObject = new Square();
    square = squareObject.getGoal_1();
    square.position.set(0, 0, 160);
    map.add(square);

    squareObject = new Square();
    square = squareObject.getGoal_2();
    square.position.set(-32, 0, -192);
    map.add(square);

    squareObject = new Square();
    square = squareObject.getGoal_2();
    square.position.set(0, 0, -192);
    map.add(square);

    this.getMap = function () {
        return map;
    }
}