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
var CircleGeometry = THREE.CircleGeometry;
var TorusGeometry = THREE.TorusGeometry;
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
    var gameOver;
    var spotLight;
    var ambientLight;
    var groundGeometry;
    var groundPhysicsMaterial;
    var groundMaterial;
    var ground;
    var shipGeometry;
    var shipPhysicsMaterial;
    var shipMaterial;
    var ship;
    var shipTexture;
    var shipTextureNormal;
    var shipPitGeometry;
    var shipPitPhysicsMaterial;
    var shipPitMaterial;
    var shipPit;
    var shipPitTexture;
    var shipPitTextureNormal;
    var wingGeometry;
    var wingMaterial;
    var wingLeft;
    var wingRight;
    var sphere;
    var sunMaterial;
    var sunAtmoMaterial;
    var sunTexture;
    var gasGiantGeometry;
    var gasGiantMaterial;
    var gasGiant;
    var gasGiantTexture;
    var gasGiantTextureNormal;
    var beltRing;
    var beltRingGeometry;
    var beltRingMaterial;
    var beltRingTexture;
    var beltRingTextureNormal;
    var starDustGeometry;
    var starDustPhysicsMaterial;
    var starDustMaterial;
    var starDust;
    var starDustTexture;
    var starDustTextureNormal;
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
    var spaceSkybox;
    var score = 0;
    var deathDistance = 0;
    var oxygenLevels = 61;
    var remainingOxygen = 0;
    var maxStarDust = 5;
    var shipPos = new Vector3(0, 0, 0);
    var curPlayerPos = new Vector3(0, 0, 0);
    var assest;
    var canvas;
    var stage;
    var manifest = [
        { id: "thrust", src: "../../Assets/audio/thrusters.wav" },
        { id: "bloop", src: "../../Assets/audio/bloop.wav" },
        { id: "warp", src: "../../Assets/audio/warp.wav" }
    ];
    function preload() {
        assets = new createjs.LoadQueue();
        assets.installPlugin(createjs.Sound);
        assets.on('complete', init, this);
        assets.loadManifest(manifest);
    }
    function setupCanvas() {
        canvas = document.getElementById("canvas");
        canvas.setAttribute("width", (config.Screen.WIDTH.toString()));
        canvas.setAttribute("height", (config.Screen.HEIGHT * 0.05).toString());
        canvas.style.backgroundColor = "#000000";
        stage = new createjs.Stage(canvas);
    }
    function setupScoreboard() {
        oxygenLabel = new createjs.Text("OXYGEN LEVELS: " + remainingOxygen, "20px Consolas", "#ffffff");
        oxygenLabel.x = config.Screen.WIDTH * 0.45;
        oxygenLabel.y = (config.Screen.HEIGHT * 0.1) * 0.20;
        stage.addChild(oxygenLabel);
        console.log("Added lives label to stage");
        //Add Score Label
        scoreLabel = new createjs.Text("SCORE: " + score, "20px Consolas", "#ffffff");
        scoreLabel.x = config.Screen.WIDTH * 0.9;
        scoreLabel.y = (config.Screen.HEIGHT * 0.1) * 0.20;
        stage.addChild(scoreLabel);
        console.log("Added score label to stage");
        stage.update();
    }
    function init() {
        // Create to HTMLElements
        blocker = document.getElementById("blocker");
        instructions = document.getElementById("instructions");
        gameOver = document.getElementById("gameOver");
        gameOver.style.display = 'none';
        //setup createjs canvas and stage
        setupCanvas();
        //Set up Scoreboard
        setupScoreboard();
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
        scene.fog = new THREE.Fog(0xffe6ff, 0, 1000);
        scene.setGravity(new THREE.Vector3(0, -10, 0));
        scene.addEventListener('update', function () {
            scene.simulate(undefined, 2);
        });
        // setup a THREE.JS Clock object
        clock = new Clock();
        setupRenderer(); // setup the default renderer
        setupCamera(); // setup the camera
        //DEATH GROUND
        groundGeometry = new BoxGeometry(100000, 1, 100000);
        groundMaterial = Physijs.createMaterial(new LambertMaterial({ color: 0xffffff }), 0.4, 0);
        groundPhysicsMaterial = Physijs.createMaterial(groundMaterial, 0, 0);
        ground = new Physijs.ConvexMesh(groundGeometry, groundMaterial, 0);
        ground.position.set(0, -73, 0);
        ground.receiveShadow = false;
        ground.visible = false;
        ground.name = "Ground";
        scene.add(ground);
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
        spaceSkybox = new THREE.Mesh(new THREE.CubeGeometry(100000, 100000, 100000, null, true), skyboxMat);
        // add it to the scene
        scene.add(spaceSkybox);
        // Add an AmbientLight to the scene
        ambientLight = new AmbientLight(0x0c0c0c);
        scene.add(ambientLight);
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
        //ship Cockpit
        shipPitTexture = new THREE.TextureLoader().load('../../Assets/images/shipHull.jpg');
        shipPitTexture.wrapS = THREE.RepeatWrapping;
        shipPitTexture.wrapT = THREE.RepeatWrapping;
        shipPitTexture.repeat.set(4, 4);
        shipPitTextureNormal = new THREE.TextureLoader().load('../../Assets/images/shipHullNormal.png');
        shipPitTextureNormal.wrapS = THREE.RepeatWrapping;
        shipPitTextureNormal.wrapT = THREE.RepeatWrapping;
        shipPitTextureNormal.repeat.set(4, 4);
        shipPitMaterial = new PhongMaterial();
        shipPitMaterial.map = shipPitTexture;
        shipPitMaterial.bumpMap = shipPitTextureNormal;
        shipPitMaterial.bumpScale = 0.2;
        shipPitGeometry = new CylinderGeometry(1, 9, 12, 10);
        shipPitPhysicsMaterial = Physijs.createMaterial(shipPitMaterial, 1, 0);
        shipPit = new Physijs.CylinderMesh(shipPitGeometry, shipPitMaterial, 0);
        shipPit.position.set(0, 20.5, 0);
        shipPit.rotation.y = 42;
        shipPit.receiveShadow = true;
        ship.add(shipPit);
        //Ship wings
        wingGeometry = new CircleGeometry(14, 0, 0, 2.1);
        wingMaterial = new LambertMaterial({ map: shipTexture });
        wingRight = new THREE.Mesh(wingGeometry, wingMaterial);
        wingRight.position.set(5, -15, 0);
        ship.add(wingRight);
        wingLeft = new THREE.Mesh(wingGeometry, wingMaterial);
        wingLeft.position.set(-6, -15, 2);
        wingLeft.rotation.z = 45;
        ship.add(wingLeft);
        scene.add(ship);
        shipPos = new THREE.Vector3(ship.position.x, ship.position.y, ship.position.z);
        //Add a Sphere (sun)
        sun = new SphereGeometry(10, 25, 25);
        sunMaterial = new LambertMaterial({ color: 0xff4dff, map: new THREE.TextureLoader().load("../../Assets/images/sun.jpg") });
        sun = new Mesh(sun, sunMaterial);
        sun.castShadow = true;
        sun.position.set(-70, 30, -140);
        //Add Light to the Sun
        pointLight = new PointLight(0xffc61a, 1, 100);
        pointLight.position.set(-30, 25, -80);
        pointLight.intensity = 10;
        pointLight.castShadow = true;
        scene.add(pointLight);
        // Spot Light
        spotLight = new SpotLight(0xffdf80);
        spotLight.position.set(-80, 70, 200);
        spotLight.castShadow = true;
        spotLight.intensity = 1;
        spotLight.lookAt(new Vector3(0, 0, 0));
        spotLight.shadowCameraNear = 2;
        spotLight.shadowCameraFar = 200;
        spotLight.shadowCameraLeft = -5;
        spotLight.shadowCameraRight = 5;
        spotLight.shadowCameraTop = 5;
        spotLight.shadowCameraBottom = -5;
        //spotLight.shadowMapWidth = 2048;
        //spotLight.shadowMapHeight = 2048;
        spotLight.shadowDarkness = 0.5;
        spotLight.name = "Spot Light";
        scene.add(spotLight);
        scene.add(sun);
        //Gas Giant object
        gasGiantTexture = new THREE.TextureLoader().load('../../Assets/images/gasPlanet.jpg');
        gasGiantTexture.wrapS = THREE.RepeatWrapping;
        gasGiantTexture.wrapT = THREE.RepeatWrapping;
        gasGiantTexture.repeat.set(4, 4);
        gasGiantTextureNormal = new THREE.TextureLoader().load('../../Assets/images/gasPlanetNormal.png');
        gasGiantTextureNormal.wrapS = THREE.RepeatWrapping;
        gasGiantTextureNormal.wrapT = THREE.RepeatWrapping;
        gasGiantTextureNormal.repeat.set(4, 4);
        gasGiantMaterial = new PhongMaterial();
        gasGiantMaterial.map = gasGiantTexture;
        gasGiantMaterial.bumpMap = gasGiantTextureNormal;
        gasGiantMaterial.bumpScale = 0.2;
        gasGiantGeometry = new SphereGeometry(80, 25, 25);
        gasGiant = new Mesh(gasGiantGeometry, gasGiantMaterial);
        gasGiant.position.set(100, -80, -400);
        gasGiant.receiveShadow = true;
        gasGiant.rotation.set(0.2, -0.5, 0.5);
        gasGiant.name = "Gas Giant";
        //Asteroid Belt for Gas Giant
        beltRingTexture = new THREE.TextureLoader().load("../../Assets/images/asteroidBelt.png");
        beltRingTexture.wrapS = THREE.RepeatWrapping;
        beltRingTexture.wrapT = THREE.RepeatWrapping;
        beltRingTexture.repeat.set(4, 1);
        beltRingTextureNormal = new THREE.TextureLoader().load('../../Assets/images/asteroidBeltNormal.png');
        beltRingTextureNormal.wrapS = THREE.RepeatWrapping;
        beltRingTextureNormal.wrapT = THREE.RepeatWrapping;
        beltRingTextureNormal.repeat.set(4, 1);
        beltRingMaterial = new PhongMaterial();
        beltRingMaterial.map = beltRingTexture;
        beltRingMaterial.bumpMap = beltRingTextureNormal;
        beltRingMaterial.bumpScale = 0.2;
        beltRingMaterial.transparent = true;
        beltRingGeometry = new TorusGeometry(100, 15, 2, 30);
        beltRing = new Mesh(beltRingGeometry, beltRingMaterial);
        beltRing.castShadow = false;
        beltRing.rotation.set(-1.2, 0, 0);
        gasGiant.add(beltRing);
        //Add Light to the gas giant
        gasPointLight = new PointLight(0xdd99ff, 0, 500);
        gasPointLight.position.set(50, -50, -320);
        gasPointLight.intensity = 0.5;
        gasPointLight.castShadow = false;
        scene.add(gasPointLight);
        scene.add(gasGiant);
        //StarDust object
        starDustTexture = new THREE.TextureLoader().load('../../Assets/images/cartoonStars.jpg');
        starDustTexture.wrapS = THREE.RepeatWrapping;
        starDustTexture.wrapT = THREE.RepeatWrapping;
        starDustTexture.repeat.set(1, 1);
        starDustTextureNormal = new THREE.TextureLoader().load('../../Assets/images/cartoonStars.png');
        starDustTextureNormal.wrapS = THREE.RepeatWrapping;
        starDustTextureNormal.wrapT = THREE.RepeatWrapping;
        starDustTextureNormal.repeat.set(1, 1);
        starDustMaterial = new PhongMaterial();
        starDustMaterial.map = starDustTexture;
        starDustMaterial.bumpMap = starDustTextureNormal;
        starDustMaterial.shininess = 100;
        starDustMaterial.shading = THREE.FlatShading;
        starDustMaterial.bumpScale = 0.2;
        starDustGeometry = new SphereGeometry(1.5, 3, 2);
        starDustPhysicsMaterial = Physijs.createMaterial(starDustMaterial, 1, 0);
        //Spawn collectable every 5sec
        setInterval(spawnStarDust, 5000);
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
        //Duping asteroids 
        var asteroid1 = asteroid.clone();
        asteroid1 = new Physijs.SphereMesh(asteroidGeometry, asteroidMaterial, 0);
        asteroid1.position.set(0, -5, -25);
        asteroid1.scale.set(0.5, 0.5, 0.5);
        asteroid1.name = "Asteroid";
        scene.add(asteroid1);
        var asteroid2 = asteroid.clone();
        asteroid2 = new Physijs.SphereMesh(asteroidGeometry, asteroidMaterial, 0);
        asteroid2.scale.set(0.7, 0.5, 0.7);
        asteroid2.rotation.z -= 50;
        asteroid2.position.set(10, 0, -25);
        asteroid2.name = "Asteroid";
        scene.add(asteroid2);
        var asteroid3 = asteroid.clone();
        asteroid3 = new Physijs.SphereMesh(asteroidGeometry, asteroidMaterial, 0);
        asteroid3.scale.set(0.4, 0.3, 0.5);
        asteroid3.rotation.z -= 20;
        asteroid3.position.set(-30, 0, -30);
        asteroid3.name = "Asteroid";
        scene.add(asteroid3);
        var asteroid4 = asteroid.clone();
        asteroid4 = new Physijs.SphereMesh(asteroidGeometry, asteroidMaterial, 0);
        //asteroid4.scale.set(0.4, 0.3, 0.5);
        asteroid4.rotation.z -= 20;
        asteroid4.position.set(-30, 0, -30);
        asteroid4.name = "Asteroid";
        scene.add(asteroid4);
        var asteroid5 = asteroid.clone();
        asteroid5 = new Physijs.SphereMesh(asteroidGeometry, asteroidMaterial, 0);
        asteroid5.position.set(-20, -10, -15);
        asteroid5.scale.set(0.5, 0.4, 0.5);
        asteroid5.name = "Asteroid";
        scene.add(asteroid5);
        var asteroid6 = asteroid.clone();
        asteroid6 = new Physijs.SphereMesh(asteroidGeometry, asteroidMaterial, 0);
        asteroid6.position.set(-10, -10, -40);
        asteroid6.scale.set(0.5, 0.4, 0.5);
        asteroid6.name = "Asteroid";
        scene.add(asteroid6);
        var asteroid7 = asteroid.clone();
        asteroid7 = new Physijs.SphereMesh(asteroidGeometry, asteroidMaterial, 0);
        asteroid7.position.set(30, -10, -30);
        asteroid7.scale.set(0.4, 0.3, 0.4);
        asteroid7.name = "Asteroid";
        scene.add(asteroid7);
        // Player Object
        playerGeometry = new BoxGeometry(1, 2, 1);
        playerMaterial = Physijs.createMaterial(new LambertMaterial({ color: 0x00ff00 }), 1, 2);
        player = new Physijs.BoxMesh(playerGeometry, playerMaterial, 1.5);
        player.position.set(2, 1, 0);
        player.rotation.set(0, 0, 0);
        player.receiveShadow = true;
        player.castShadow = true;
        player.name = "Player";
        scene.add(player);
        console.log("Added Player to Scene");
        //create parent child relationship with camera and player
        player.add(camera);
        camera.position.set(0, 1, 0);
        player.addEventListener('collision', function (event) {
            if (event.name === "SpaceShip" || event.name === "Asteroid") {
                isGrounded = true;
            }
            if (event.name === "StarDust") {
                score += 1;
                console.log("player collected points" + score);
                createjs.Sound.play("bloop");
            }
            if (event.name === "Ground") {
                console.log("Game Over");
                gameOver.style.display = '';
                blocker.style.display = 'none';
            }
        });
        // Add framerate stats
        addStatsObject();
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
            gameOver.style.display = 'none';
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
        canvas.style.width = "100%";
        oxygenLabel.x = config.Screen.WIDTH * 0.45;
        oxygenLabel.y = (config.Screen.HEIGHT * 0.1) * 0.20;
        scoreLabel.x = config.Screen.WIDTH * 0.9;
        scoreLabel.y = (config.Screen.HEIGHT * 0.1) * 0.20;
        stage.update();
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
        stage.update();
        checkControls();
        checkDeathDistance();
        starDustTimeout();
        spaceSkybox.rotation.x += 0.05;
        spaceSkybox.rotation.y += 0.05;
        spaceSkybox.rotation.z -= 0.08;
        beltRing.rotation.z += 0.0025;
        gasGiant.rotation.y += 0.00025;
        sun.rotation.z += 0.0025;
        scoreLabel.text = "SCORE: " + score;
        oxygenLabel.text = "OXYGEN LEVELS: " + remainingOxygen;
        // render using requestAnimationFrame
        requestAnimationFrame(gameLoop);
        // render the scene
        renderer.render(scene, camera);
    }
    //Check to see if the player should be dead
    function checkDeathDistance() {
        curPlayerPos = new THREE.Vector3(player.position.x, player.position.y, player.position.z);
        deathDistance = Math.abs(Math.round(curPlayerPos.distanceTo(shipPos)));
        remainingOxygen = oxygenLevels - deathDistance;
        if (remainingOxygen > 50) {
            remainingOxygen = 50;
        }
        if (remainingOxygen <= 0) {
            remainingOxygen = 0;
            gameOver.style.display = '';
            blocker.style.display = 'none';
            enableMoveControls(false);
        }
    }
    //Check keyboard/mouse controls
    function checkControls() {
        velocity = new Vector3();
        if (keyboardControls.enabled) {
            var time = performance.now();
            var delta = (time - prevTime) / 1000;
            var direction = new Vector3(0, 0, 0);
            if (keyboardControls.moveForward) {
                velocity.z -= 500.0 * delta;
            }
            if (keyboardControls.moveLeft) {
                velocity.x -= 500.0 * delta;
            }
            if (keyboardControls.moveBackward) {
                velocity.z += 500.0 * delta;
            }
            if (keyboardControls.moveRight) {
                velocity.x += 500.0 * delta;
            }
            if (keyboardControls.restart) {
                restartGame();
            }
            if (isGrounded) {
                if (keyboardControls.jump) {
                    velocity.y += 2000.0 * delta;
                    createjs.Sound.play("thrust");
                    if (player.position.y > 10) {
                        isGrounded = false;
                    }
                }
            }
            if (!keyboardControls.jump) {
                createjs.Sound.stop("thrust");
            }
            if (keyboardControls.revert) {
                createjs.Sound.play("warp");
                scene.remove(player);
                player.position.set(2, 1, 0);
                player.rotation.set(0, 0, 0);
                scene.add(player);
                player.setAngularVelocity(new Vector3(0, 0, 0));
                oxygenLevels--;
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
    //Disable player movement only
    function enableMoveControls(disabled) {
        keyboardControls.moveForward = disabled;
        keyboardControls.moveLeft = disabled;
        keyboardControls.moveRight = disabled;
        keyboardControls.moveBackward = disabled;
        keyboardControls.jump = disabled;
        mouseControls.enabled = disabled;
    }
    function cameraLook() {
        var zenith = THREE.Math.degToRad(90);
        var nadir = THREE.Math.degToRad(-90);
        var cameraPitch = camera.rotation.x + mouseControls.pitch;
        //Constrain the Camera Pitch
        camera.rotation.x = THREE.Math.clamp(cameraPitch, nadir, zenith);
    }
    //restarting the game
    function restartGame() {
        score = 0;
        oxygenLevels = 61;
        scene.remove(player);
        player.position.set(2, 1, 0);
        player.rotation.set(0, 0, 0);
        scene.add(player);
        player.setAngularVelocity(new Vector3(0, 0, 0));
        gameOver.style.display = 'none';
        blocker.style.display = 'none';
    }
    //Spawn Collectables
    function spawnStarDust() {
        starDust = new Physijs.SphereMesh(starDustGeometry, starDustMaterial, 0);
        starDust.addEventListener('collision', function () {
            scene.remove(this);
        });
        starDust.position.set((Math.random() * 50) - 30, (Math.random() * 15) - 5, (Math.random() * -30) - 5);
        starDust.receiveShadow = true;
        starDust.rotation.set((Math.random() * 50) - 30, (Math.random() * 10) - 10, (Math.random() * 25) - 25);
        starDust.name = "StarDust";
        scene.add(starDust);
        console.log("added stardust");
    }
    //Remove Collectable if it there is too much on screen
    function starDustTimeout() {
        var starDustArray = scene.children;
        var starDustAmt = 0;
        var lastObject = starDustArray[starDustArray.length - 1];
        for (var i in starDustArray) {
            if (scene.children[i].name === "StarDust") {
                starDustAmt++;
            }
            if (starDustAmt > maxStarDust) {
                scene.remove(lastObject);
                starDustAmt = 0;
            }
        }
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
        camera = new PerspectiveCamera(35, config.Screen.RATIO, 0.1, 100000);
        camera.position.set(0, 10, 30);
        camera.lookAt(new Vector3(0, 0, 0));
        console.log("Finished setting up Camera...");
    }
    window.onload = preload;
    return {
        scene: scene
    };
})();

//# sourceMappingURL=game.js.map
