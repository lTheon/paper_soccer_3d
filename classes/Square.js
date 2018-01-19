function Square() {
    var fullSquare = new THREE.Object3D();
    //------------------WNĘTRZE
    var squareMaterial = new THREE.MeshPhongMaterial({
        color: 0x00d311,
        side: THREE.DoubleSide,
        specular: 0x00d311,
        shininess: 0
    })
    var squareGeometry = new THREE.PlaneBufferGeometry(32, 32);
    var square = new THREE.Mesh(squareGeometry, squareMaterial);
    square.rotation.x += Math.PI / 2
    square.position.set(16, 0, 16);
    //-------------------LINIE
    var lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
    var geometry = new THREE.Geometry();

    geometry.vertices.push(new THREE.Vector3(0, 1, 0));
    geometry.vertices.push(new THREE.Vector3(32, 1, 0));
    geometry.vertices.push(new THREE.Vector3(32, 1, 32));
    geometry.vertices.push(new THREE.Vector3(0, 1, 32));
    var line = new THREE.Line(geometry, lineMaterial);
    fullSquare.add(square);
    fullSquare.add(line);
    this.getFullSquare = function () {
        return fullSquare;
    }

    //------------bramki
    var goal_1 = new THREE.Object3D();
    var goal_2 = new THREE.Object3D();

    var squareGoalMaterial_1 = new THREE.MeshPhongMaterial({
        color: 0xffff00,
        side: THREE.DoubleSide,
        specular: 0xffff00,
        shininess: 0,
        emissive: 0xffff00      //opcjonalne - można usunąć przy innym oświetleniu
    })
    var squareGoalMaterial_2 = new THREE.MeshPhongMaterial({
        color: 0x0000ff,
        side: THREE.DoubleSide,
        specular: 0x0000ff,
        shininess: 0,
        emissive: 0x0000ff
    })
    var squareGoal_1 = new THREE.Mesh(squareGeometry, squareGoalMaterial_1);
    squareGoal_1.rotation.x += Math.PI / 2
    squareGoal_1.position.set(16, 0, 16);

    var squareGoal_2 = new THREE.Mesh(squareGeometry, squareGoalMaterial_2);
    squareGoal_2.rotation.x += Math.PI / 2
    squareGoal_2.position.set(16, 0, 16);


    var lineMaterial_goal_1 = new THREE.LineBasicMaterial({ color: 0xff0000 });
    var geometry_goal_1 = new THREE.Geometry();

    geometry_goal_1.vertices.push(new THREE.Vector3(0, 1, 0));
    geometry_goal_1.vertices.push(new THREE.Vector3(32, 1, 0));
    geometry_goal_1.vertices.push(new THREE.Vector3(32, 1, 32));
    geometry_goal_1.vertices.push(new THREE.Vector3(0, 1, 32));
    var line_goal_1 = new THREE.Line(geometry_goal_1, lineMaterial_goal_1);

    goal_1.add(squareGoal_1);
    goal_1.add(line_goal_1);

    var lineMaterial_goal_2 = new THREE.LineBasicMaterial({ color: 0xff0000 });
    var geometry_goal_2 = new THREE.Geometry();

    geometry_goal_2.vertices.push(new THREE.Vector3(0, 1, 0));
    geometry_goal_2.vertices.push(new THREE.Vector3(32, 1, 0));
    geometry_goal_2.vertices.push(new THREE.Vector3(32, 1, 32));
    geometry_goal_2.vertices.push(new THREE.Vector3(0, 1, 32));
    var line_goal_2 = new THREE.Line(geometry_goal_2, lineMaterial_goal_2);

    goal_2.add(squareGoal_2);
    goal_2.add(line_goal_2);

    this.getGoal_1 = function () {
        return goal_1;
    }
    this.getGoal_2 = function () {
        return goal_2;
    }
}