(function() {
	'use strict'
	
	var CANVAS = document.getElementById('canvas'),
		ctx = canvas.getContext('2d'),
		CANVASWIDTH = canvas.width,
		CANVASHEIGHT = canvas.height;

	var uuidString = function() {
	    return Math.random().toString(36).substring(7)
	}

	var RAF = window.requestAnimationFrame ||
		      window.webkitRequestAnimationFrame ||
		      window.mozRequestAnimationframe ||
		      window.msRequestAnimationFrame ||
		      window.oRequestAnimationFrame;

	ctx.webkitImageSmoothingEnabled = false;
	ctx.mozImageSmoothingEnabled = false;

	var sprite = new Image();
	sprite.src = "images/Sprites.png";
	sprite.addEventListener('load', main, false);
	canvas.addEventListener('keydown', checkKeyDown, false);
	canvas.addEventListener('keyup', checkKeyUp, false);
	canvas.addEventListener('click', mouseClicked, false);
	console.log('sprites loaded')

	function main() {
		console.log('main start', sprite);
		var me = new Character('phil');
		console.log(me)
		// RAF(main);
	}

	function DrawObject() {
		this.x = null;
		this.y = null;
	}
	function Character(name) {
		this.id = uuidString();
		this.name = name || 'character';
	}
	Character.prototype = new DrawObject();

	function checkKeyDown (e) {
		var keyID = e.keyCode || e.which;
		e.preventDefault();
		if (keyID === 38 || keyID === 87) {     // 38 - up key , 87 - w key 
		}
		if (keyID === 39 || keyID === 68) {     // 39 - right key , 68 - d key
		}
		if (keyID === 40 || keyID === 83) {     // 40 - down key , 83 - s key 
		}
		if (keyID === 37 || keyID === 65) {     // 38 - left key , 87 - a key 
		}
	}

	function checkKeyUp (e) {
		var keyID = e.keyCode || e.which;
		e.preventDefault();
		if (keyID === 38 || keyID === 87) {     // 38 - up key , 87 - w key 
		}
		if (keyID === 39 || keyID === 68) {     // 39 - right key , 68 - d key 
		}
		if (keyID === 40 || keyID === 83) {     // 40 - down key , 83 - s key
		}
		if (keyID === 37 || keyID === 65) {     // 38 - left key , 87 - a key 
		}
	}

	function mouseClicked(e) {
		var posX = e.offsetX,
			posY = e.offsetY;
		console.log(posX, posY)
	}

})()


