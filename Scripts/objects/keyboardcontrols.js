var objects;
(function (objects) {
    // KeyboardControls Class +++++++++++++++
    var KeyboardControls = (function () {
        // CONSTRUCTOR ++++++++++++++++++++++++++    
        function KeyboardControls() {
            document.addEventListener('keydown', this.onKeyDown.bind(this));
            document.addEventListener('keyup', this.onKeyUp.bind(this), false);
        }
        //PUBLIC METHODS
        /*public enabled(): void {
            document.addEventListener('keydown', this.onKeyDown.bind(this), false);
            document.addEventListener('keyup', this.onKeyUp.bind(this), false);
            console.log("keyboard controls enabled");
        }
        
        public disabled(): void {
            document.removeEventListener('keydown', this.onKeyDown.bind(this));
            document.removeEventListener('keyup', this.onKeyUp.bind(this));
            console.log("keyboard controls disabled");
        }*/
        KeyboardControls.prototype.onKeyDown = function (event, KeyboardEvent) {
            switch (event.keyCode) {
                case 38: /*up arrorw*/
                case 87:
                    this.moveForward = true;
                    break;
                case 37: /*left arrorw*/
                case 65:
                    this.moveLeft = true;
                    break;
                case 40: /*down arrorw*/
                case 83:
                    this.moveBackward = true;
                    break;
                case 39: /*right arrorw*/
                case 68:
                    this.moveRight = true;
                    break;
                case 32:
                    this.jump = true;
                    break;
            }
        };
        KeyboardControls.prototype.onKeyUp = function (event, KeyboardEvent) {
            switch (event.keyCode) {
                case 38: /*up arrorw*/
                case 87:
                    this.moveForward = false;
                    break;
                case 37: /*left arrorw*/
                case 65:
                    this.moveLeft = false;
                    break;
                case 40: /*down arrorw*/
                case 83:
                    this.moveBackward = false;
                    break;
                case 39: /*right arrorw*/
                case 68:
                    this.moveRight = false;
                    break;
                case 32:
                    this.jump = false;
                    break;
            }
        };
        return KeyboardControls;
    }());
    objects.KeyboardControls = KeyboardControls;
})(objects || (objects = {}));

//# sourceMappingURL=keyboardcontrols.js.map
