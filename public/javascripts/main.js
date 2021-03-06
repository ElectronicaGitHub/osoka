GAME_APP = function(GAME_ID, PLAYER_SIDE, PLAYER_NAME) {
	'use strict';

	console.log('game_app_started with', GAME_ID, 'and player side is', PLAYER_SIDE);

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
		CANVAS_BG = document.getElementById('canvas_bg'),
		ctx = CANVAS.getContext('2d'),
		ctx_bg = CANVAS_BG.getContext('2d'),
		CANVASWIDTH = canvas.width,
		CANVASHEIGHT = canvas.height,
		CHARACTER_SPEED = 5,
		CHARACTER_MAX_HEALTH = 10,
		AMMO_POWER = 1,
		CHARACTER = null,
		AMMOARRAY = [],
		ENEMYAMMOARRAY = [],
		AMMOARRAYS = [AMMOARRAY, ENEMYAMMOARRAY],
		CHARACTERARRAY = {},
		BULLET_SPEED = 12,
		STOP_NUMBER = 1,
		DRAW_HIT = false, 
		DRAW_HIT_AMMO_NUMBER = null;

	// sprites
	var sprite, background, client;

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

	function exitController(array) {
		console.log('exit controller');
		if (array.length) {
			for (i in array) {
				if (array[i].side != PLAYER_SIDE) {
					console.log('exit, game isnt over');
				} else {
					console.log('exit, game over');
				}
			}
		} else {
			console.log('your team wins')
		}

	}

	(function preload() {
		client = io();

		client.emit('game main', GAME_ID);

		client.on('init ' + GAME_ID, function(data) {
				CHARACTERARRAY[data.id] = new Character(data.name, data.meta.drawX, data.meta.drawY, 16, 16, data.meta.side);
				console.log('персонаж присоединился к игре', data.id, data.name);
				console.log('МАССИВ ПЕРСОНАЖЕЙ = ', CHARACTERARRAY);
		})
		client.on('exit ' + GAME_ID, function(id) {
			console.log('character with id exited = ', id)
			delete CHARACTERARRAY[id];
			console.log(CHARACTERARRAY);
			exitController(CHARACTERARRAY);
		})
		client.on('movement ' + GAME_ID, function(data) {
			if (!CHARACTERARRAY[data.id]) { // хз что происходит, поэтому проверка
				CHARACTERARRAY[data.id] = new Character(data.name, data.meta.drawX, data.meta.drawY, 16, 16);
			}
			CHARACTERARRAY[data.id].meta = data.meta;
		})
		client.on('ammos ' + GAME_ID, function(data) {
			var ammo = new Ammo(data.startX, data.startY, data.endX, data.endY, data.side, data.initiator, data.id);
			ENEMYAMMOARRAY.push(ammo);
		})
		client.on('ammo exit ' + GAME_ID, function(data) {
			for (var i in AMMOARRAY) {
				if (AMMOARRAY[i].id == data.id) {
					DRAW_HIT = true;
					DRAW_HIT_AMMO_NUMBER = i;
					// ctx.drawImage(sprite, 4, 222, 6, 6, AMMOARRAY[i].meta.drawX-2, AMMOARRAY[i].meta.drawY-2, 9, 9);
				}
			}
		})

		sprite = new Image();
		sprite.src = "/images/Sprites.png";
		background = new Image();
		background.src = "/images/bg.png"
		sprite.addEventListener('load', create, false);
		document.addEventListener('keydown', checkKeyDown, false);
		document.addEventListener('keyup', checkKeyUp, false);
		CANVAS.addEventListener('click', mouseClicked, false);
		console.log('sprites loaded')
	})();


	function create() {
		CHARACTER = new Character(PLAYER_NAME, 50, 50, 16, 16, PLAYER_SIDE);
		client.emit('init ' + GAME_ID, CHARACTER);
		mapCreate();
		main();
	}

	function main() {
		ctx.clearRect(0, 0, CANVASWIDTH, CANVASHEIGHT);

		CHARACTER.draw();

		if (Object.keys(CHARACTERARRAY).length) {
			for (var i in CHARACTERARRAY) {
				var char = CHARACTERARRAY[i];
				char.draw();
			}
		}
		if ((AMMOARRAY.length + ENEMYAMMOARRAY.length) > 0) {
			for (var i = AMMOARRAYS.length-1; i >=0; i--) {
				for (var j = AMMOARRAYS[i].length-1; j>=0; j--) {
					var ammo = AMMOARRAYS[i][j];
					if (ammo.inCanvas() && !ammo.collision() && !ammo.hit()) {
						ammo.draw();
					} else {
						AMMOARRAYS[i].splice(j,1);
						ctx.drawImage(sprite, 4, 222, 6, 6, ammo.meta.drawX-2, ammo.meta.drawY-2, 9, 9);
					}
				}
			}
		}
		if (DRAW_HIT) {
			ctx.drawImage(sprite, 4, 222, 6, 6, AMMOARRAY[DRAW_HIT_AMMO_NUMBER].meta.drawX-2, AMMOARRAY[DRAW_HIT_AMMO_NUMBER].meta.drawY-2, 9, 9);
			AMMOARRAY.splice(DRAW_HIT_AMMO_NUMBER,1);
			DRAW_HIT = false;
			DRAW_HIT_AMMO_NUMBER = null;
		}
		RAF(main);
	}	
	function Character(name, startX, startY, spriteSizeX, spriteSizeY, side) {
		this.id = uuidString();
		this.name = name || 'character',
		this.meta = {
			drawX : startX,
			drawY : startY,
			lastX : startX, 
			lastY : startY,
			health : CHARACTER_MAX_HEALTH,
			side : side,
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
	Character.prototype.sendToSocket = function() {
		if (this.meta.lastX != this.meta.drawX || 
			this.meta.lastY != this.meta.drawY ) {
			client.emit('movement ' + GAME_ID, this);
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
		var sprite_coords = (this.meta.side == 0) ? 30 : 250;
		ctx.drawImage(sprite, 0, 
			sprite_coords + this.meta.spriteSizeY * this.meta.wayGo, 
			this.meta.spriteSizeX, this.meta.spriteSizeY, 
			this.meta.drawX, this.meta.drawY, 
			this.meta.spriteSizeX * this.meta.multiple, this.meta.spriteSizeY * this.meta.multiple);
		var color = (this.meta.side == 0) ? '#050' : '#500';
		ctx.fillStyle = color; 
		var full_text = this.name + ' ' + this.meta.health;
		ctx.fillText(full_text, this.meta.drawX - this.meta.spriteSizeX / 2, 
			this.meta.drawY + this.meta.spriteSizeY * this.meta.multiple + 10);
	}
	Character.prototype.checkDirection = function() {
		if (this.id == CHARACTER.id) {
			this.sendToSocket();
		}
	
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

	function Ammo(xS,yS,xE,yE, side, initiator, id) {
	    this.meta = {
			drawX : xS,
			drawY : yS
		}
		this.FiredEndX = xE;
		this.FiredEndY = yE;
		this.speed = BULLET_SPEED;
	    this.angleRadian = Math.atan2(this.FiredEndY - this.meta.drawY, this.FiredEndX - this.meta.drawX);
	    this.rotation = (this.angleRadian * 180 / Math.PI);
	    this.id = id || uuidString();
	    this.initiator = initiator || CHARACTER.id;
	    this.side = side;
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
	Ammo.prototype.inCanvas = function() {
		if (this.meta.drawX < CANVASWIDTH && 
	        this.meta.drawX > 0 && 
	        this.meta.drawY < CANVASHEIGHT && 
   	        this.meta.drawY > 0) {
			return true;
		} 
		else return false;
	}
	Ammo.prototype.hit = function() {
		console.log(this.initiator, CHARACTER.id, this.side, CHARACTER.meta.side);
		if (this.initiator == CHARACTER.id) return false;
		if (this.side == CHARACTER.meta.side) return false;

		var offsetX = CHARACTER.meta.spriteSizeX * CHARACTER.meta.multiple;
		var offsetY = CHARACTER.meta.spriteSizeY * CHARACTER.meta.multiple;
		var charStartX = CHARACTER.meta.drawX;
		var charEndX = charStartX + offsetX; 
		var charStartY = CHARACTER.meta.drawY; 
		var charEndY = charStartY + offsetY; 

		if (this.meta.drawX > charStartX && 
			this.meta.drawX < charEndX && 
			this.meta.drawY > charStartY && 
			this.meta.drawY < charEndY) {
			console.log('попадание');
			CHARACTER.meta.health -= AMMO_POWER;
			client.emit('ammo exit ' + GAME_ID, this);
			client.emit('movement ' + GAME_ID, CHARACTER);
			return true;
		} else return false;
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
			posY = e.offsetY,
			ammo = new Ammo(CHARACTER.meta.drawX + CHARACTER.meta.spriteSizeX, 
								CHARACTER.meta.drawY + CHARACTER.meta.spriteSizeY, 
								posX, posY, CHARACTER.meta.side);

		AMMOARRAY.push(ammo);
		client.emit('ammos ' + GAME_ID, {
			initiator : CHARACTER.id,
			side : CHARACTER.meta.side, 
			startX : CHARACTER.meta.drawX + CHARACTER.meta.spriteSizeX,
			startY : CHARACTER.meta.drawY + CHARACTER.meta.spriteSizeY,
			endX : posX,
			endY : posY,
			id : ammo.id
		});
	}

	var BLOCKS_FOR_X = MAP[0].length;
	var BLOCKS_FOR_Y = MAP.length;
	var BLOCKS_SIZE = {
		X : CANVASWIDTH / BLOCKS_FOR_X,
		Y : CANVASHEIGHT / BLOCKS_FOR_Y
	};
	console.log(BLOCKS_FOR_X, BLOCKS_FOR_Y, BLOCKS_SIZE)

	function mapCreate() {
		console.log('map create')
		for (var i = MAP.length-1; i >= 0; i--) {
			for (var j = MAP[i].length-1; j >= 0; j--) {
				ctx_bg.drawImage(background, 
					0 + 50 * MAP[i][j], 0, 
					50, 50, 
					BLOCKS_SIZE.X * j, BLOCKS_SIZE.Y * i, 
					BLOCKS_SIZE.X, BLOCKS_SIZE.Y)
			}
		}
	}
}