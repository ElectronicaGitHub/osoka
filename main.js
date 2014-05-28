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
		CHARACTER_SPEED = 3,
		CHARACTER = null,
		AMMOARRAY = [],
		BULLET_SPEED = 10;

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
	sprite.addEventListener('load', create, false);
	document.addEventListener('keydown', checkKeyDown, false);
	document.addEventListener('keyup', checkKeyUp, false);
	canvas.addEventListener('click', mouseClicked, false);
	console.log('sprites loaded')

	function create() {
		CHARACTER = new Character('Philip', 30, 30, 16, 16);
		main();
	}

	function main() {
		ctx.clearRect(0, 0, CANVASWIDTH, CANVASHEIGHT);
		CHARACTER.draw();

		for (var i in AMMOARRAY) {
			var ammo = AMMOARRAY[i];
			if (ammo.inCanvas()) {
				ammo.draw();
			} else {
				AMMOARRAY.splice(i,1);
				ctx.drawImage(sprite, 4, 222, 6, 6, ammo.FiredStartX-2, ammo.FiredStartY-2, 9, 9);
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
			animationChangeRate : 200
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
		ctx.drawImage(sprite, 0, 30 + this.meta.spriteSizeY * this.meta.wayGo, 
							 this.meta.spriteSizeX, this.meta.spriteSizeY, 
							 this.meta.drawX, this.meta.drawY, 
							 this.meta.spriteSizeX * 2, this.meta.spriteSizeY * 2);
	}
	Character.prototype.checkDirection = function() {
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
	}

	function Ammo(xS,yS,xE,yE) {
		this.FiredStartX = xS;
		this.FiredStartY = yS;
		this.FiredEndX = xE;
		this.FiredEndY = yE;
		this.speed = BULLET_SPEED;
	    this.angleRadian = Math.atan2(this.FiredEndY - this.FiredStartY, this.FiredEndX - this.FiredStartX);
	    this.rotation = (this.angleRadian * 180 / Math.PI);
	    this.ammoID = uuidString();
	    this.initiator = CHARACTER.ID;
	}

	Ammo.prototype.draw = function() {
	    this.FiredStartX +=  Math.cos(this.angleRadian) * this.speed;
	    this.FiredStartY +=  Math.sin(this.angleRadian) * this.speed;
	  
	 	ctx.save();
		ctx.translate(this.FiredStartX, this.FiredStartY);
		ctx.rotate(this.angleRadian + Math.PI/2);
		ctx.drawImage(sprite , 0 , 222 , 4 , 12 , 0 , 0 , 4 , 16 );
		ctx.restore();
	}

	Ammo.prototype.inCanvas = function() {
		if (this.FiredStartX < CANVASWIDTH && 
	        this.FiredStartX > 0 && 
	        this.FiredStartY < CANVASHEIGHT && 
   	        this.FiredStartY > 0) {
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

})()