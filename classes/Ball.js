function Ball() {
    var loader = new THREE.ColladaLoader();
    var container = new THREE.Object3D();
    var model;
    loader.load( "models/ball.dae",
        function (collada) {
            model = collada.scene;
            model.scale.set(10, 10, 10);
            model.position.set(0, 0, 0);
            container.add(model);
            container.position.set(0, 7, 0);
    })
    var geometry = new THREE.SphereGeometry(4, 32, 32);
    var material = new THREE.MeshPhongMaterial({ color: 0xe1e1e1 });
    var ball = new THREE.Mesh(geometry, material);
    ball.position.set(0, 2, 0);
    this.getBall = function () {
        return container;
    }
}