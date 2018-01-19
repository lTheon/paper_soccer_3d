function Main() {

    connected = false;
    yourTurn = false;
    //--------------------------SCENE AND CAMERA------------------------
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(
    45, // kąt patrzenia kamery (FOV - field of view)
    window.innerWidth / window.innerHeight, // proporcje widoku
    0.1, // min renderowana odległość
    50000 // max renderowana odległość
    );
    var renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x000000);
    renderer.setSize(window.innerWidth, window.innerHeight);
    var axis = new THREE.AxisHelper(200);
    //scene.add(axis);
    scene.add(camera);
    camera.position.set(0, 300, -500);
    //---------------------ANIMATE--------------------------     
    document.getElementById("scene").appendChild(renderer.domElement);
    function animateScene() {
        requestAnimationFrame(animateScene);
        renderer.render(scene, camera);
        camera.updateProjectionMatrix();
    }
    animateScene();

    //--------------------OBJECTS---------------------------
    var helpScreen = new HelpScreen();
    var mapObject = new Map();
    var map = mapObject.getMap();
    camera.lookAt(map.position);
    scene.add(map);

    var ball = new Ball();
    ball = ball.getBall();
    scene.add(ball);

    var startScreen = new StartScreen(camera, map, ball, scene);
    var controls = new Controls(ball, scene);

    var lights = new Lights();
    scene.add(lights.getLights());

    
}