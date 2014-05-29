(function() {
	'use strict'

	var KEYS = {
		37: 'LEFT',
		38: 'UP',
		39: 'RIGHT',
		40: 'DOWN',
		65: 'A',
		68: 'D',
		83: 'S',
		87: 'W',
		32: 'SPACE'
	},
		CANVAS = document.getElementById('canvas'),
		ctx = canvas.getContext('2d'),
		CANVASWIDTH = canvas.width,
		CANVASHEIGHT = canvas.height,
		CHARACTER_SPEED = 5,
		CHARACTER = null,
		AMMOARRAY = [],
		BULLET_SPEED = 10,
		STOP_NUMBER = 1;

	// sprites
	var sprite, background;

	var uuidString = function() {
	    return Math.random().toString(36).substring(7)
	}

	var MAP = [
		[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
		[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
		[1,0,1,1,1,1,0,0,0,0,0,0,0,0,0,1],
		[1,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1],
		[1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
		[1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
		[1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1],
		[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
		[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
	];

	var RAF = window.requestAnimationFrame ||
		      window.webkitRequestAnimationFrame ||
		      window.mozRequestAnimationframe ||
		      window.msRequestAnimationFrame ||
		      window.oRequestAnimationFrame;

	ctx.webkitImageSmoothingEnabled = false;
	ctx.mozImageSmoothingEnabled = false;

	(function preload() {
		sprite = new Image();
		sprite.src = "images/Sprites.png";
		background = new Image();
		background.src = "images/bg.png"
		sprite.addEventListener('load', create, false);
		document.addEventListener('keydown', checkKeyDown, false);
		document.addEventListener('keyup', checkKeyUp, false);
		canvas.addEventListener('click', mouseClicked, false);
		console.log('sprites loaded')
	})();


	function create() {
		CHARACTER = new Character('Philip', 100, 100, 16, 16);
		main();
	}

	function main() {
		ctx.clearRect(0, 0, CANVASWIDTH, CANVASHEIGHT);
		mapCreate();


		CHARACTER.draw();

		for (var i in AMMOARRAY) {
			var ammo = AMMOARRAY[i];
			if (ammo.inCanvas() && !ammo.collision()) {
				ammo.draw();
			} else {
				AMMOARRAY.splice(i,1);
				ctx.drawImage(sprite, 4, 222, 6, 6, ammo.meta.drawX-2, ammo.meta.drawY-2, 9, 9);
			}
		}
		RAF(main);
	}	
	function Character(name, startX, startY, spriteSizeX, spriteSizeY) {
		this.id = uuidString();
		this.name = name || 'character',
		this.meta = {
			drawX : startX,
			drawY : startY,
			spriteSizeX : spriteSizeX,
			spriteSizeY : spriteSizeY,
			speed : CHARACTER_SPEED,
			isDownKey : null,
			isUpKey : null,
			isRightKey : null,
			isLeftKey : null,
			wayGo : 5,
			animationChangeRate : 200,
			multiple : 2
		}
	}
	Character.prototype.collision = function() {
		var x = this.meta.drawX + this.meta.spriteSizeX,
			y = this.meta.drawY + this.meta.spriteSizeY * 2,
			blockX = ~~(x / BLOCKS_SIZE.X),
			blockY = ~~(y / BLOCKS_SIZE.Y);
		if (MAP[blockY][blockX] == STOP_NUMBER) {
			return true;
		} else {
			return false;
		}
	}
	Character.prototype.draw = function() {
		this.checkDirection();
		this.shouldUseAlternativeSprite = new Date().getTime() % this.meta.animationChangeRate*2 <= this.meta.animationChangeRate;

		if (this.meta.wayGo == 7 || this.meta.wayGo == 8) {
	        if (this.shouldUseAlternativeSprite) this.meta.wayGo = 7;   
	        else this.meta.wayGo = 8;   
	    }
		if (this.meta.wayGo == 1 || this.meta.wayGo == 0) { 
	        if (this.shouldUseAlternativeSprite) this.meta.wayGo = 1;   
	        else this.meta.wayGo = 0;   
		}
		if (this.meta.wayGo == 2 || this.meta.wayGo == 3) { 
	        if (this.shouldUseAlternativeSprite) this.meta.wayGo = 2;   
	        else this.meta.wayGo = 3;   
		}
		if (this.meta.wayGo == 10 || this.meta.wayGo == 11) { 
	        if (this.shouldUseAlternativeSprite) this.meta.wayGo = 10;   
	        else this.meta.wayGo = 11;   
		}

		ctx.drawImage(sprite, 0, 
			30 + this.meta.spriteSizeY * this.meta.wayGo, 
			this.meta.spriteSizeX, this.meta.spriteSizeY, 
			this.meta.drawX, this.meta.drawY, 
			this.meta.spriteSizeX * this.meta.multiple, this.meta.spriteSizeY * this.meta.multiple);
	}
	Character.prototype.checkDirection = function() {
		this.meta.lastX = this.meta.drawX;
		this.meta.lastY = this.meta.drawY;

			if (this.meta.isLeftKey && this.meta.isDownKey) {
				this.meta.drawX += this.meta.speed/Math.sqrt(8);
				this.meta.drawY -= this.meta.speed/Math.sqrt(8);
			} 
			if (this.meta.isLeftKey && this.meta.isUpKey) {
				this.meta.drawX += this.meta.speed/Math.sqrt(8);
				this.meta.drawY += this.meta.speed/Math.sqrt(8);
			} 
			if (this.meta.isRightKey && this.meta.isDownKey) {
				this.meta.drawX -= this.meta.speed/Math.sqrt(8);
				this.meta.drawY -= this.meta.speed/Math.sqrt(8);
			} 
			if (this.meta.isRightKey && this.meta.isUpKey) {
				this.meta.drawX -= this.meta.speed/Math.sqrt(8);
				this.meta.drawY += this.meta.speed/Math.sqrt(8);
			} 
			if (this.meta.isUpKey){
				this.meta.drawY -= this.meta.speed;
			}
			if (this.meta.isRightKey){
				this.meta.drawX += this.meta.speed;
			}
			if (this.meta.isDownKey){
				this.meta.drawY += this.meta.speed;
			}
			if (this.meta.isLeftKey){
				this.meta.drawX -= this.meta.speed;
			}
			if (this.collision()) {
				this.meta.drawX = this.meta.lastX;
				this.meta.drawY = this.meta.lastY;
			}	
	}

	function Ammo(xS,yS,xE,yE) {
	    this.meta = {
			drawX : xS,
			drawY : yS
		}
		this.FiredEndX = xE;
		this.FiredEndY = yE;
		this.speed = BULLET_SPEED;
	    this.angleRadian = Math.atan2(this.FiredEndY - this.meta.drawY, this.FiredEndX - this.meta.drawX);
	    this.rotation = (this.angleRadian * 180 / Math.PI);
	    this.ammoID = uuidString();
	    this.initiator = CHARACTER.ID;
	}
	Ammo.prototype.collision = function() {
		var x = this.meta.drawX,
			y = this.meta.drawY,
			blockX = ~~(x / BLOCKS_SIZE.X),
			blockY = ~~(y / BLOCKS_SIZE.Y);
		if (MAP[blockY][blockX] == STOP_NUMBER) {
			return true;
		} else {
			return false;
		}
	}

	Ammo.prototype.draw = function() {
	    this.meta.drawX +=  Math.cos(this.angleRadian) * this.speed;
	    this.meta.drawY +=  Math.sin(this.angleRadian) * this.speed;
	  
	 	ctx.save();
		ctx.translate(this.meta.drawX, this.meta.drawY);
		ctx.rotate(this.angleRadian + Math.PI/2);
		ctx.drawImage(sprite , 0 , 222 , 4 , 12 , 0 , 0 , 4 , 16 );
		ctx.restore();
	}

	Ammo.prototype.inCanvas = function() {
		if (this.meta.drawX < CANVASWIDTH && 
	        this.meta.drawX > 0 && 
	        this.meta.drawY < CANVASHEIGHT && 
   	        this.meta.drawY > 0) {
			return true;
		} 
		else return false;
	}

	function checkKeyDown (e) {
		e.preventDefault();
		var keyID = e.keyCode || e.which;
		if (keyID === 38 || keyID === 87) {
			CHARACTER.meta.isUpKey = true;
			CHARACTER.meta.wayGo = 10;
		}
		if (keyID === 39 || keyID === 68) {
			CHARACTER.meta.isRightKey = true; 
			CHARACTER.meta.wayGo = 0;
		}
		if (keyID === 40 || keyID === 83) {
			CHARACTER.meta.isDownKey = true;
			CHARACTER.meta.wayGo = 7;
		}
		if (keyID === 37 || keyID === 65) {
			CHARACTER.meta.isLeftKey = true;
			CHARACTER.meta.wayGo = 2;
		}
	}

	function checkKeyUp (e) {
		e.preventDefault();
		var keyID = e.keyCode || e.which;
		if (keyID === 38 || keyID === 87) {
			CHARACTER.meta.isUpKey = false;
			CHARACTER.meta.wayGo = 9;
		}
		if (keyID === 39 || keyID === 68) {
			CHARACTER.meta.isRightKey = false;
			CHARACTER.meta.wayGo = 5;
		}
		if (keyID === 40 || keyID === 83) {
			CHARACTER.meta.isDownKey = false; 
			CHARACTER.meta.wayGo = 6;
		}
		if (keyID === 37 || keyID === 65) {
			CHARACTER.meta.isLeftKey = false;
			CHARACTER.meta.wayGo = 4;
		}
	}

	function mouseClicked(e) {
		var posX = e.offsetX,
			posY = e.offsetY;
		AMMOARRAY.push(new Ammo(CHARACTER.meta.drawX + CHARACTER.meta.spriteSizeX, 
								CHARACTER.meta.drawY + CHARACTER.meta.spriteSizeY, 
								posX, posY));
	}

	var BLOCKS_FOR_X = MAP[0].length;
	var BLOCKS_FOR_Y = MAP.length;
	var BLOCKS_SIZE = {
		X : CANVASWIDTH / BLOCKS_FOR_X,
		Y : CANVASHEIGHT / BLOCKS_FOR_Y
	};
	console.log(BLOCKS_FOR_X, BLOCKS_FOR_Y, BLOCKS_SIZE)

	function mapCreate() {
		for (var i = MAP.length-1; i >= 0; i--) {
			for (var j = MAP[i].length-1; j >= 0; j--) {
				ctx.drawImage(background, 0 + 50 * MAP[i][j], 0, 
										  50, 50, 
										  BLOCKS_SIZE.X * j, BLOCKS_SIZE.Y * i, 
										  BLOCKS_SIZE.X, BLOCKS_SIZE.Y)
			}
		}
	}
	

})()