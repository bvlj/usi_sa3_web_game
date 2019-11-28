// TODO: clientside app
class App {
	constructor(object) {
		this.canvas = document.getElementById(object.canvas);

		if (this.canvas.tagName !== 'CANVAS') {
			throw new Error("It should be a canvas");
		}

		this.ctx = this.canvas.getContext('2d');
		this.width = this.canvas.width;
		this.height = this.canvas.height;

		this.composer = new Composer(new CanvasInterface(this.canvas));

		//array keys movement
		this.movementKeys = ["KeyW", "KeyD", "KeyS", "KeyA"];

		//array keys chose edit
		this.editKeys = ["49", "50", "51", "52"];

		//array keys search cell
		this.searchCellKeys = ["ArrowRight", "ArrowLeft"];

		//array keys to take face of cell
		this.searchFaceKeys = ["49", "50", "51", "52", "53", "54"];

		this.keys = {};

		this.playerBody = undefined;

		//editor
		this.editor = undefined;

		//current cell and face to edit
		this.cellEdited = {cell: undefined, face: undefined};

		//inputs
		this.cell = document.getElementById(object.inputs.cell);
		this.shield = document.getElementById(object.inputs.shield);
		this.spike = document.getElementById(object.inputs.spike);
		this.bounce = document.getElementById(object.inputs.bounce);

		window.addEventListener('resize', (e) => {
			this.composer = new Composer(new CanvasInterface(this.canvas));
		});

	}

	setEdit(e){
		let edit = undefined;
		if (e.code == "49") {
			edit = 0;
		} 

		if (e.target == "50") {
			edit = 1;
		} 

		if (e.target == "51") {
			edit = 2;
		} 

		if (e.target == "52") {
			edit = 3;
		} 

		if (edit != undefined) {
			this.editor =  new Editor(edit, this.playerBody);
		}
	}

	searchCell(e){
		let cell = undefined;
		// UP RIGHT DOWN LEFT

		if (e.code == "ArrowRight") {
			this.cellEdited.cell = this.editor.findNextCell();

		 	//socket.emit('move',2);
		 	//console.log("D");
		}

		if (this.keys["ArrowLeft"]) {
			this.cellEdited.cell = this.editor.findPrevCell();
			//console.log("A");
			//socket.emit('move', 6);
		}
	}

	searchFace() {
		if (this.editor != undefined) {
			if (e.code == "49") {
				this.cellEdited.face = 0;
			}

			if (e.code == "50") {
				this.cellEdited.face = 1;
			}

			if (e.code == "51") {
				this.cellEdited.face = 2;
			}

			if (e.code == "52") {
				this.cellEdited.face = 3;
			}

			if (e.code == "53") {
				this.cellEdited.face = 4;
			}

			if (e.code == "54") {
				this.cellEdited.face = 5;
			}

			if (this.cellEdited.cell != undefined && this.cellEdited.face != undefined) {
				socket.emit('attachPart', { type: this.cellEdited.cell.type, 
											part: this.playerBody.indexOf(this.editor.currentCell), 
											face: this.cellEdited.face });
			}
		}
	}

	drawMap(data) {
		this.clearCanvas();
		//console.log(data);
		this.move();
		data.players.forEach((elem) => {
			this.playerBody = elem.components;
			this.drawPlayer(elem.components, elem.color, elem.position);
		});
	}

	drawPlayer(playerBody, colorIndex, position) {
		const color  = PLAYER_COLORS[colorIndex];
		this.composer.build(playerBody, color, position);
	}

	clearCanvas() {
		const ctx = this.canvas.getContext('2d');
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	enableInput() {
		console.log("enabled");
		this.canvas.focus();
		this.canvas.addEventListener('keydown', this.onKeyDown.bind(this));
		this.canvas.addEventListener('keyup', this.onKeyUp.bind(this));
	}

	disableInput() {
		console.log("disabled");
		this.canvas.blur();
		this.canvas.removeEventListener('keydown', this.onKeyDown);
		this.canvas.removeEventListener('keyup', this.onKeyUp);
	}

	onKeyDown(e) {
		e.preventDefault();
		if (this.movementKeys.includes(e.code)) {
			this.keys[e.code] = true;
		}

		if (this.editKeys.includes(e.code) && this.editor == undefined) {
			setEdit(e);
		}

		if (this.searchCellKeys.includes(e.code) && this.editor != undefined) {
			searchCell(e);
		} 

		if (this.searchFaceKeys.includes(e.code) && this.editor != undefined) {
			searchFace();
		}
	}

	move() {
		//WD DS SA AW || UPRIGHT RIGHTDOWN DOWNLEFT LEFTUP
		if (this.keys["KeyW"] &&
			this.keys["KeyD"]) {
			//console.log("W");
			socket.emit('move', 1);
		}

		if (this.keys["KeyD"] &&
			this.keys["KeyS"]) {
			//console.log("A");
			socket.emit('move', 3);
		}

		if (this.keys["KeyS"] &&
			this.keys["KeyA"]) {
			//console.log("S");
			socket.emit('move', 5);
		}

		if (this.keys["KeyA"] &&
			this.keys["KeyW"]) {
			socket.emit('move',7);
			//console.log("D");
		}

		// W A S D
		if (this.keys["KeyW"]) {
			//console.log("W");
			socket.emit('move', 0);
		}

		if (this.keys["KeyD"]) {
			socket.emit('move',2);
			//console.log("D");
		}

		if (this.keys["KeyS"]) {
			socket.emit('move', 4);
			//console.log("S");
		}

		if (this.keys["KeyA"]) {
			//console.log("A");
			socket.emit('move', 6);
		}

		// // UP RIGHT DOWN LEFT
		// if (this.keys["ArrowUp"]) {
		// 	//console.log("W");
		// 	socket.emit('move', 0);
		// }

		// if (this.keys["ArrowRight"]) {
		// 	socket.emit('move',2);
		// 	//console.log("D");
		// }

		// if (this.keys["ArrowDown"]) {
		// 	socket.emit('move', 4);
		// 	//console.log("S");
		// }

		// if (this.keys["ArrowLeft"]) {
		// 	//console.log("A");
		// 	socket.emit('move', 6);
		// }
	}

	onKeyUp(e) {
		this.keys[e.code] = undefined;
	}

	setName(name) {
		console.log(name);
		socket.emit('registerUser',  name);
	}


}