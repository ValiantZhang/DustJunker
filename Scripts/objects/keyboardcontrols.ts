module objects {
    // KeyboardControls Class +++++++++++++++
    export class KeyboardControls {
        // PUBLIC INSTANCE VARIABLES ++++++++++++
        public moveForward: boolean;
        public moveBackward: boolean;
        public moveLeft: boolean;
        public moveRight: boolean;
        public jump: boolean;
        public enabled: boolean;
    
        // CONSTRUCTOR ++++++++++++++++++++++++++    
        constructor() {
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
        
        public onKeyDown(event.KeyboardEvent): void{
            switch(event.keyCode){
                case 38: /*up arrorw*/
                case 87: /*W Key*/
                    this.moveForward = true;
                    break;
                    
                case 37: /*left arrorw*/
                case 65: /*A Key*/
                    this.moveLeft = true;
                    break;
                    
                case 40: /*down arrorw*/
                case 83: /*S Key*/
                    this.moveBackward = true;
                    break;
                    
                case 39: /*right arrorw*/
                case 68: /*D Key*/
                    this.moveRight = true;
                    break;
                    
                case 32: /*space*/
                    this.jump = true;
                    break;
            }
        }
        
        public onKeyUp(event.KeyboardEvent): void{
            switch(event.keyCode){
                case 38: /*up arrorw*/
                case 87: /*W Key*/
                    this.moveForward = false;
                    break;
                    
                case 37: /*left arrorw*/
                case 65: /*A Key*/
                    this.moveLeft = false;
                    break;
                    
                case 40: /*down arrorw*/
                case 83: /*S Key*/
                    this.moveBackward = false;
                    break;
                    
                case 39: /*right arrorw*/
                case 68: /*D Key*/
                    this.moveRight = false;
                    break;
                    
                case 32: /*space*/
                    this.jump = false;
                    break;
            }   
        }
    }
}