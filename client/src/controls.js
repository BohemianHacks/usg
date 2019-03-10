class Controls {
    constructor(socket) {
        this._keysPressed = {
            a: false,
            w: false,
            s: false,
            d: false
        };

        document.addEventListener('keydown',(e) => {
            this._keysPressed[e.key] = true;
        });

        document.addEventListener('keyup',(e) => {
            this._keysPressed[e.key] = false;
        });

        this._socket = socket;
    }

    tick(dt, v) {
        const moveEvent = {
            x: 0,
            y: 0
        };
        if (this._keysPressed.a) {
            moveEvent.x -= +v.y;
            moveEvent.y += +v.x;
        }
        if (this._keysPressed.d) {
            moveEvent.x += +v.y;
            moveEvent.y -= +v.x;
        }
        if (this._keysPressed.w) {
            moveEvent.x += v.x;
            moveEvent.y += v.y;
        }
        if (this._keysPressed.s) {
            moveEvent.x -= v.x;
            moveEvent.y -= v.y;
        }

        if (moveEvent.x > 0 || moveEvent.x < 0 || moveEvent.y > 0 || moveEvent.y < 0) {
            this._socket.emit("move", moveEvent);
        }
    }
}

export default Controls;