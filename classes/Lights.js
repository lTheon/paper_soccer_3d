function Lights() {
    var lights = new THREE.Object3D();

    var point = new THREE.Object3D();
    point.position.set(0, 1, 0);
    lights.add(point);

    var geometry = new THREE.SphereGeometry(5, 32, 32);
    var material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    var orb, light;


    light = new THREE.SpotLight(0xFFFFFF, 2, 500, 15);
    light.position.set(148, 200, 160);
    light.lookAt(point.position);
    lights.add(light);
    orb = new THREE.Mesh(geometry, material);
    orb.position.set(148, 200, 160);
    lights.add(orb);

    light = new THREE.SpotLight(0xFFFFFF, 2, 350, 15);
    light.position.set(-148, 200, -160);
    light.lookAt(point.position);
    lights.add(light);
    orb = new THREE.Mesh(geometry, material);
    orb.position.set(-148, 200, -160);
    lights.add(orb);

    light = new THREE.SpotLight(0xFFFFFF, 2, 350, 15);
    light.position.set(148, 200, -160);
    light.lookAt(point.position);
    lights.add(light);
    orb = new THREE.Mesh(geometry, material);
    orb.position.set(148, 200, -160);
    lights.add(orb);


    light = new THREE.SpotLight(0xFFFFFF, 2, 350, 15);
    light.position.set(-148, 200, 160);
    light.lookAt(point.position);
    lights.add(light);
    orb = new THREE.Mesh(geometry, material);
    orb.position.set(-148, 200, 160);
    lights.add(orb);

    this.getLights = function () {
        return lights;
    }
}