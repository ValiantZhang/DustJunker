/// <reference path="_reference.ts"/>
// MAIN GAME FILE
// THREEJS Aliases
var Scene = Physijs.Scene;
var Renderer = THREE.WebGLRenderer;
var PerspectiveCamera = THREE.PerspectiveCamera;
var BoxGeometry = THREE.BoxGeometry;
var CubeGeometry = THREE.CubeGeometry;
var PlaneGeometry = THREE.PlaneGeometry;
var SphereGeometry = THREE.SphereGeometry;
var CylinderGeometry = THREE.CylinderGeometry;
var Geometry = THREE.Geometry;
var AxisHelper = THREE.AxisHelper;
var LambertMaterial = THREE.MeshLambertMaterial;
var MeshBasicMaterial = THREE.MeshBasicMaterial;
var LineBasicMaterial = THREE.LineBasicMaterial;
var PhongMaterial = THREE.MeshPhongMaterial;
var Material = THREE.Material;
var Line = THREE.Line;
var Mesh = THREE.Mesh;
var Object3D = THREE.Object3D;
var SpotLight = THREE.SpotLight;
var PointLight = THREE.PointLight;
var AmbientLight = THREE.AmbientLight;
var Control = objects.Control;
var GUI = dat.GUI;
var Color = THREE.Color;
var Vector3 = THREE.Vector3;
var Face3 = THREE.Face3;
var Point = objects.Point;
var CScreen = config.Screen;
var Clock = THREE.Clock;
//Custom Game Objects
var gameObject = objects.gameObject;
// Setup a Web Worker for Physijs
Physijs.scripts.worker = "/Scripts/lib/Physijs/physijs_worker.js";
Physijs.scripts.ammo = "/Scripts/lib/Physijs/examples/js/ammo.js";
// setup an IIFE structure (Immediately Invoked Function Expression)
var game = (function () {
    // declare game objects
    var havePointerLock;
    var element;
    var scene = new Scene(); // Instantiate Scene Object
    var renderer;
    var camera;
    var control;
    var gui;
    var stats;
    var blocker;
    var instructions;
    var spotLight;
    var shipGeometry;
    var shipPhysicsMaterial;
    var shipMaterial;
    var ship;
    var shipTexture;
    var shipTextureNormal;
    var asteroidGeometry;
    var asteroidPhysicsMaterial;
    var asteroidMaterial;
    var asteroid;
    var asteroidTexture;
    var asteroidTextureNormal;
    var clock;
    var playerGeometry;
    var playerMaterial;
    var player;
    var sphereGeometry;
    var sphereMaterial;
    var sphere;
    var keyboardControls;
    var mouseControls;
    var isGrounded;
    var velocity = new Vector3(0, 0, 0);
    var prevTime = 0;
    var directionLineMaterial;
    var directionLineGeometry;
    var directionLine;
    var spaceSkybox;
    function init() {
        // Create to HTMLElements
        blocker = document.getElementById("blocker");
        instructions = document.getElementById("instructions");
        //check to see if pointerlock is supported
        havePointerLock = 'pointerLockElement' in document ||
            'mozPointerLockElement' in document ||
            'webkitPointerLockElement' in document;
        // Instantiate Game Controls
        keyboardControls = new objects.KeyboardControls();
        mouseControls = new objects.MouseControls();
        if (havePointerLock) {
            element = document.body;
            instructions.addEventListener('click', function () {
                // Ask the user for pointer lock
                console.log("Requesting PointerLock");
                element.requestPointerLock = element.requestPointerLock ||
                    element.mozRequestPointerLock ||
                    element.webkitRequestPointerLock;
                element.requestPointerLock();
            });
            document.addEventListener('pointerlockchange', pointerLockChange);
            document.addEventListener('mozpointerlockchange', pointerLockChange);
            document.addEventListener('webkitpointerlockchange', pointerLockChange);
            document.addEventListener('pointerlockerror', pointerLockError);
            document.addEventListener('mozpointerlockerror', pointerLockError);
            document.addEventListener('webkitpointerlockerror', pointerLockError);
        }
        // Scene changes for Physijs
        scene.name = "Main";
        scene.fog = new THREE.Fog(0xffffff, 0, 750);
        scene.setGravity(new THREE.Vector3(0, -10, 0));
        scene.addEventListener('update', function () {
            scene.simulate(undefined, 2);
        });
        // setup a THREE.JS Clock object
        clock = new Clock();
        setupRenderer(); // setup the default renderer
        setupCamera(); // setup the camera
        // Spot Light
        spotLight = new SpotLight(0xffffff);
        spotLight.position.set(20, 40, -15);
        spotLight.castShadow = true;
        spotLight.intensity = 2;
        spotLight.lookAt(new Vector3(0, 0, 0));
        spotLight.shadowCameraNear = 2;
        spotLight.shadowCameraFar = 200;
        spotLight.shadowCameraLeft = -5;
        spotLight.shadowCameraRight = 5;
        spotLight.shadowCameraTop = 5;
        spotLight.shadowCameraBottom = -5;
        spotLight.shadowMapWidth = 2048;
        spotLight.shadowMapHeight = 2048;
        spotLight.shadowDarkness = 0.5;
        spotLight.name = "Spot Light";
        scene.add(spotLight);
        console.log("Added spotLight to scene");
        // load the cube textures
        var skyboxCubePics = ["../../Assets/Skybox/Space/posX.jpg",
            "../../Assets/Skybox/Space/negX.jpg",
            "../../Assets/Skybox/Space/posY.jpg",
            "../../Assets/Skybox/Space/negY.jpg",
            "../../Assets/Skybox/Space/posZ.jpg",
            "../../Assets/Skybox/Space/negZ.jpg"];
        var skyboxCube = THREE.ImageUtils.loadTextureCube(skyboxCubePics);
        // init the cube shadder
        var shader = THREE.ShaderLib["cube"];
        shader.uniforms['tCube'].value = skyboxCube;
        var skyboxMat = new THREE.ShaderMaterial({
            fragmentShader: shader.fragmentShader,
            vertexShader: shader.vertexShader,
            uniforms: shader.uniforms,
            depthWrite: false,
            side: THREE.BackSide
        });
        // build the skybox Mesh
        spaceSkybox = new THREE.Mesh(new THREE.CubeGeometry(100, 100, 100, null, true), skyboxMat);
        // add it to the scene
        scene.add(spaceSkybox);
        // Spaceship object
        shipTexture = new THREE.TextureLoader().load('../../Assets/images/shipHull.jpg');
        shipTexture.wrapS = THREE.RepeatWrapping;
        shipTexture.wrapT = THREE.RepeatWrapping;
        shipTexture.repeat.set(4, 4);
        shipTextureNormal = new THREE.TextureLoader().load('../../Assets/images/shipHullNormal.png');
        shipTextureNormal.wrapS = THREE.RepeatWrapping;
        shipTextureNormal.wrapT = THREE.RepeatWrapping;
        shipTextureNormal.repeat.set(4, 4);
        shipMaterial = new PhongMaterial();
        shipMaterial.map = shipTexture;
        shipMaterial.bumpMap = shipTextureNormal;
        shipMaterial.bumpScale = 0.2;
        shipGeometry = new CylinderGeometry(8, 10, 30, 10);
        shipPhysicsMaterial = Physijs.createMaterial(shipMaterial, 1, 0);
        ship = new Physijs.CylinderMesh(shipGeometry, shipMaterial, 0);
        ship.position.set(0, -10, 0);
        ship.rotation.x = 5;
        ship.rotation.z = -55;
        ship.receiveShadow = true;
        ship.name = "SpaceShip";
        scene.add(ship);
        console.log("Added Spaceship to scene");
        //Asteroid object
        asteroidTexture = new THREE.TextureLoader().load('../../Assets/images/asteroid.jpg');
        asteroidTexture.wrapS = THREE.RepeatWrapping;
        asteroidTexture.wrapT = THREE.RepeatWrapping;
        asteroidTexture.repeat.set(1, 1);
        asteroidTextureNormal = new THREE.TextureLoader().load('../../Assets/images/asteroidMapNormal.png');
        asteroidTextureNormal.wrapS = THREE.RepeatWrapping;
        asteroidTextureNormal.wrapT = THREE.RepeatWrapping;
        asteroidTextureNormal.repeat.set(1, 1);
        asteroidMaterial = new PhongMaterial();
        asteroidMaterial.map = asteroidTexture;
        asteroidMaterial.bumpMap = asteroidTextureNormal;
        asteroidMaterial.bumpScale = 0.2;
        asteroidGeometry = new SphereGeometry(5, 10, 6);
        asteroidPhysicsMaterial = Physijs.createMaterial(asteroidMaterial, 1, 0);
        asteroid = new Physijs.SphereMesh(asteroidGeometry, asteroidMaterial, 0);
        asteroid.position.set(0, -10, -15);
        asteroid.rotation.z += 50;
        asteroid.receiveShadow = true;
        asteroid.name = "Asteroid";
        scene.add(asteroid);
        //clone doesn't save gravity? wut?
        //Duping asteroids 
        var asteroid1 = asteroid.clone();
        asteroid1 = new Physijs.SphereMesh(asteroidGeometry, asteroidMaterial, 0);
        asteroid1.position.set(0, -5, -25);
        asteroid1.scale.set(0.5, 0.5, 0.5);
        scene.add(asteroid1);
        var asteroid2 = asteroid.clone();
        asteroid2 = new Physijs.SphereMesh(asteroidGeometry, asteroidMaterial, 0);
        asteroid2.scale.set(0.7, 0.5, 0.7);
        asteroid2.rotation.z -= 50;
        asteroid2.position.set(10, 0, -25);
        scene.add(asteroid2);
        var asteroid3 = asteroid.clone();
        asteroid3 = new Physijs.SphereMesh(asteroidGeometry, asteroidMaterial, 0);
        asteroid3.scale.set(0.4, 0.3, 0.5);
        asteroid3.rotation.z -= 20;
        asteroid3.position.set(-30, 0, -30);
        scene.add(asteroid3);
        var asteroid4 = asteroid.clone();
        asteroid4 = new Physijs.SphereMesh(asteroidGeometry, asteroidMaterial, 0);
        asteroid4.scale.set(0.4, 0.3, 0.5);
        asteroid4.rotation.z -= 20;
        asteroid4.position.set(-30, 0, -30);
        scene.add(asteroid4);
        var asteroid5 = asteroid.clone();
        asteroid5 = new Physijs.SphereMesh(asteroidGeometry, asteroidMaterial, 0);
        asteroid5.position.set(-20, -10, -15);
        asteroid5.scale.set(0.5, 0.4, 0.5);
        scene.add(asteroid5);
        var asteroid6 = asteroid.clone();
        asteroid6 = new Physijs.SphereMesh(asteroidGeometry, asteroidMaterial, 0);
        asteroid6.position.set(-10, -10, -40);
        asteroid6.scale.set(0.5, 0.4, 0.5);
        scene.add(asteroid6);
        var asteroid7 = asteroid.clone();
        asteroid7 = new Physijs.SphereMesh(asteroidGeometry, asteroidMaterial, 0);
        asteroid7.position.set(30, -10, -30);
        asteroid7.scale.set(0.4, 0.3, 0.4);
        scene.add(asteroid7);
        // Player Object
        playerGeometry = new BoxGeometry(2, 4, 2);
        playerMaterial = Physijs.createMaterial(new LambertMaterial({ color: 0x00ff00 }), 0.8, 0);
        player = new Physijs.BoxMesh(playerGeometry, playerMaterial, 1);
        player.position.set(0, 1, 0);
        player.receiveShadow = true;
        player.castShadow = true;
        player.name = "Player";
        scene.add(player);
        console.log("Added Player to Scene");
        player.addEventListener('collision', function (event) {
            if (event.name === "SpaceShip" || event.name === "Asteroid") {
                console.log("player hit the ground");
                isGrounded = true;
            }
            if (event.name === "Sphere") {
                console.log("player hit the sphere");
            }
        });
        // Add DirectionLine
        directionLineMaterial = new LineBasicMaterial({ color: 0xffff00 });
        directionLineGeometry = new Geometry();
        directionLineGeometry.vertices.push(new Vector3(0, 0, 0)); // line origin
        directionLineGeometry.vertices.push(new Vector3(0, 0, -50)); // end of the line
        directionLine = new Line(directionLineGeometry, directionLineMaterial);
        player.add(directionLine);
        console.log("Added DirectionLine to the Player");
        //create parent child relationship with camera and player
        player.add(camera);
        camera.position.set(0, 1, 0);
        /*        //Sphere Object
                sphereGeometry = new SphereGeometry(2);
                sphereMaterial = Physijs.createMaterial(new LambertMaterial({ color: 0x00ff00 }), 0.4, 0);
                sphere = new Physijs.SphereMesh(sphereGeometry, sphereMaterial, 1);
                sphere.position.set(0, 60, 0);
                sphere.receiveShadow = true;
                sphere.castShadow = true;
                sphere.name = "Sphere";
                scene.add(sphere);
                console.log("Adding Sphere to Scene");*/
        // add controls
        gui = new GUI();
        control = new Control();
        addControl(control);
        // Add framerate stats
        addStatsObject();
        console.log("Added Stats to scene...");
        document.body.appendChild(renderer.domElement);
        gameLoop(); // render the scene	
        scene.simulate();
        window.addEventListener('resize', onWindowResize, false);
    }
    //PointerLockChange Event Handler
    function pointerLockChange(event) {
        if (document.pointerLockElement === element ||
            document.mozPointerLockElement === element ||
            document.webkitPointerLockElement === element) {
            // enable our mouse and keyboard controls
            keyboardControls.enabled = true;
            mouseControls.enabled = true;
            blocker.style.display = 'none';
            console.log("PointerLock enabled");
        }
        else {
            // disable our mouse and keyboard controls
            keyboardControls.enabled = false;
            mouseControls.enabled = false;
            blocker.style.display = '-webkit-box';
            blocker.style.display = '-moz-box';
            blocker.style.display = 'box';
            instructions.style.display = '';
            console.log("PointerLock disabled");
        }
    }
    //PointerLockError Event Handler
    function pointerLockError(event) {
        instructions.style.display = '';
        console.log("PointerLock Error Detected!!");
    }
    // Window Resize Event Handler
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    function addControl(controlObject) {
        /* ENTER CODE for the GUI CONTROL HERE */
    }
    // Add Frame Rate Stats to the Scene
    function addStatsObject() {
        stats = new Stats();
        stats.setMode(0);
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';
        document.body.appendChild(stats.domElement);
    }
    // Setup main game loop
    function gameLoop() {
        stats.update();
        checkControls();
        spaceSkybox.rotation.x += 0.005;
        spaceSkybox.rotation.y += 0.005;
        spaceSkybox.rotation.z -= 0.008;
        // render using requestAnimationFrame
        requestAnimationFrame(gameLoop);
        // render the scene
        renderer.render(scene, camera);
    }
    function checkControls() {
        velocity = new Vector3();
        if (keyboardControls.enabled) {
            var time = performance.now();
            var delta = (time - prevTime) / 1000;
            var direction = new Vector3(0, 0, 0);
            if (keyboardControls.moveForward) {
                console.log("Moving Forward");
                velocity.z -= 2000.0 * delta;
            }
            if (keyboardControls.moveLeft) {
                console.log("Moving left");
                velocity.x -= 2000.0 * delta;
            }
            if (keyboardControls.moveBackward) {
                console.log("Moving Backward");
                velocity.z += 2000.0 * delta;
            }
            if (keyboardControls.moveRight) {
                console.log("Moving Right");
                velocity.x += 2000.0 * delta;
            }
            if (isGrounded) {
                if (keyboardControls.jump) {
                    console.log("Jumping");
                    velocity.y += 4000.0 * delta;
                    if (player.position.y > 5) {
                        isGrounded = false;
                    }
                }
            }
            player.setDamping(0.7, 0.1);
            // Changing player's rotation
            player.setAngularVelocity(new Vector3(0, -mouseControls.yaw, 0));
            direction.addVectors(direction, velocity);
            direction.applyQuaternion(player.quaternion);
            if (Math.abs(player.getLinearVelocity().x) < 20 && Math.abs(player.getLinearVelocity().y) < 10) {
                player.applyCentralForce(direction);
            }
            cameraLook();
            prevTime = time;
        } // Controls Enabled ends
        else {
            player.setAngularVelocity(new Vector3(0, 0, 0));
        }
    }
    function cameraLook() {
        var zenith = THREE.Math.degToRad(90);
        var nadir = THREE.Math.degToRad(-90);
        var cameraPitch = camera.rotation.x + mouseControls.pitch;
        //Constrain the Cmaera Pitch
        camera.rotation.x = THREE.Math.clamp(cameraPitch, nadir, zenith);
    }
    // Setup default renderer
    function setupRenderer() {
        renderer = new Renderer({ antialias: true });
        renderer.setClearColor(0x404040, 1.0);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(CScreen.WIDTH, CScreen.HEIGHT);
        renderer.shadowMap.enabled = true;
        console.log("Finished setting up Renderer...");
    }
    // Setup main camera for the scene
    function setupCamera() {
        camera = new PerspectiveCamera(35, config.Screen.RATIO, 0.1, 100);
        camera.position.set(0, 10, 30);
        camera.lookAt(new Vector3(0, 0, 0));
        console.log("Finished setting up Camera...");
    }
    window.onload = init;
    return {
        scene: scene
    };
})();

//# sourceMappingURL=game.js.map
