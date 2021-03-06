$(document).ready(function(){
	
	var thePlayer;
	var difficulty = 1;
	var maxEnemies = 10;
	var enemies = [maxEnemies];
	var maxBullets = 20;
	var bullets = [maxBullets];
	var maxPickups = 2;
	var pickups = [maxPickups];
	var maxScore = 0;
	var paused = false;
	//87 & 38 = up, 68 & 39 = right, 65 & 40 = down, 83 & 37 = left, 80 = pause
	var keyMap = {87: false, 38: false, 68: false, 39: false, 65: false, 40: false, 83: false, 37: false, 80: false};
	
	$(document).keydown(function(e) {
		if (e.keyCode in keyMap) {
			keyMap[e.keyCode] = true;
			if (paused && e.keyCode == 80) {
				paused = false;
			} else if (!paused && e.keyCode == 80){
				paused = true;
			}
		}
	}).keyup(function(e) {
		if (e.keyCode in keyMap) {
			keyMap[e.keyCode] = false;
		}
	});
	
	$(document).on("mousemove", function(event) {
		thePlayer.aimX = event.pageX;
		thePlayer.aimY = event.pageY;
	});
	
	$(document).on("click", function(event) {
		if (bullets.length < maxBullets) {
			bullets[bullets.length] = new bullet(thePlayer.x,thePlayer.y,Math.atan2(thePlayer.aimY - thePlayer.y, thePlayer.aimX - thePlayer.x));
		}
	});
	
	var gameArea = {
		canvas : document.createElement("canvas"),
		start : function () {
			this.canvas.width = document.body.clientWidth;
			this.canvas.height = 700;
			this.context = this.canvas.getContext("2d");
			document.body.insertBefore(this.canvas,document.body.childNodes[0]);
			this.interval = setInterval(updateGameArea, 20);
		},
		clear : function () {
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.draw(this.canvas.height,this.canvas.width,0,0,"green");
		},
		draw : function (height,width,x,y,color,rotation = 0) {
			//Draw function with rotation if provided
			this.context.save();
			this.context.fillStyle = color;
			this.context.translate(x,y);
			this.context.rotate(rotation);
			this.context.fillRect(0, 0, width, height);
			this.context.restore();
		},
		drawText : function (theString, x, y, size = 16) {
			//Draw function for text
			this.context.save();
			this.context.font = size + "px Verdana";
			this.context.fillText(theString, x, y);
			this.context.restore();
		}
	}
	
	function player(x,y) {
		this.maxHealth = 100;
		this.health = this.maxHealth;
		this.color = "black";
		this.x = x;
		this.y = y;
		this.aimX = 0;
		this.aimY = 0;
		this.height = 20;
		this.width = 20;
		this.score = 0;
		this.speed = 3;
		this.update = function() {
			//check movement key presses in the array of keys
			if (keyMap[87] || keyMap[38]) {
				thePlayer.y -= this.speed;
			} 
			if (keyMap[68] || keyMap[39]) {
				thePlayer.x += this.speed;
			}
			if (keyMap[65] || keyMap[37]) {
				thePlayer.x -= this.speed;
			}
			if (keyMap[83] || keyMap[40]) {
				thePlayer.y += this.speed;
			}
			//start again if the player dies
			if (this.health < 0) {
				this.health = 100;
				this.x = Math.floor(Math.random()*gameArea.canvas.width);
				this.y = Math.floor(Math.random()*gameArea.canvas.height);
				if (this.score > maxScore) {
					maxScore = this.score;
				}
				this.score = 0;
				difficulty = 1
				;
			}
			//Draw player base
			gameArea.draw(this.height, this.width, this.x, this.y, this.color,0);
			//Draw player turret pointed at the aim y and aim x (where the mouse is)
			gameArea.draw(6,40,(this.x + ((this.width/2)-3)),(this.y + ((this.height/2)-3)), this.color,Math.atan2(this.aimY - this.y, this.aimX - this.x));
			//Draw the health bar
			gameArea.draw(20,(gameArea.canvas.width / 100) * thePlayer.health,0,gameArea.canvas.height - 40, "red",0);
		}
	}
	
	function enemy(x,y) {
		this.health = 100;
		this.cooldown = 0;
		this.fireSpeed = 200 - (difficulty * 10);
		this.color = "blue";
		this.x = x;
		this.y = y;
		this.height = 20;
		this.width = 20;
		this.moving = Math.random() >= 0.5;
		this.update = function() {
			
			if (this.health < 0) {
				this.die();
			}
			
			//Fire at a set interval
			if (this.cooldown > this.fireSpeed) {
				this.cooldown = 0;
				this.fire();
			} else {
				this.cooldown += 1;
			}
			
			//move if this is a moving enemy
			if (this.moving) {
				this.x += ((thePlayer.x - this.x) / 500);
				this.y += ((thePlayer.y - this.y) / 500);
			}
			
			//draw enemy
			gameArea.draw(this.height, this.width, this.x, this.y, this.color);
		}
		this.fire = function() {
			if (bullets.length < maxBullets) {
				bullets[bullets.length] = new bullet(this.x,this.y,Math.atan2(thePlayer.y - this.y, thePlayer.x - this.x));
			}
		}
		this.die = function() {
			enemies.splice(enemies.indexOf(this),1);
		}
	}
	
	function bullet(x, y, rotation) {
		//Add an amount to x and y so the bullet doesn't hit the shooter
		this.x = x + (50 * Math.cos(rotation));
		this.y = y + (50 * Math.sin(rotation));
		this.size = 5;
		this.speed = 4;
		this.rotation = rotation;
		
		this.update = function() {
			//Keep bullet going at the same speed on a diagonal path
			this.x += this.speed * Math.cos(this.rotation);
			this.y += this.speed * Math.sin(this.rotation);
			if (this.x > gameArea.canvas.width || this.x < 0 || this.y > gameArea.canvas.height || this.y < 0) {
				this.die();
			}
			gameArea.draw(this.size,this.size,this.x,this.y,"black",this.rotation);
		}
		
		this.die = function() {
			//Remove from bullets array
			bullets.splice(bullets.indexOf(this),1);
		}
	}

	function pickup() {
		this.x = Math.floor(Math.random()*gameArea.canvas.width);
		this.y = Math.floor(Math.random()*gameArea.canvas.height);
		this.size = 25;
		this.color = "red"
		if (Math.floor(Math.random() * 2) == 1) {
			this.type = "health";
		} else {
			this.type = "bomb";
		}
		this.update = function () {
			if (this.type == "health") {
				gameArea.draw(this.size / 3,this.size,this.x,this.y + (this.size / 3),this.color);
				gameArea.draw(this.size, this.size / 3, this.x + (this.size / 3), this.y , this.color);
			} else if (this.type == "bomb") {
				gameArea.draw(this.size, this.size, this.x, this.y, "yellow");
			}
		}
		this.collect = function() {
			if (this.type == "health") {
				if (thePlayer.health + 25 < thePlayer.maxHealth) {
					thePlayer.health += 25;
				} else {
					thePlayer.health = thePlayer.maxHealth;
				}
			} else if (this.type = "bomb") {
				enemies[enemies.length - 1].die();
			}
		}
		this.die = function() {
			pickups.splice(pickups.indexOf(this),1);
		}
	}
	
	function collission(x1,y1,w1,h1,x2,y2,w2,h2) {
		var r1 = w1 + x1;
		var b1 = h1 + y1;
		var r2 = w2 + x2;
		var b2 = h2 + y2;
						
		if (x1 < r2 && r1 > x2 && y1 < b2 && b1 > y2) {
			return true;
		} else {
			return false;
		}
	}
	
	function updateGameArea() {
		
		if (!paused) {
			
			gameArea.clear();
			
			//Update the player
			thePlayer.update();
			//Progressively raise the difficulty depending on the score
			if (difficulty < thePlayer.score / 10) {
				difficulty ++;
			}
			//Spawn enemies randomly or spawn if there isn't any active ones
			if (enemies.length < 1 || ((Math.floor(Math.random() * 200) == 100) && enemies.length < maxEnemies && enemies.length < difficulty)) {
				enemies[enemies.length] = new enemy(Math.floor(Math.random()*gameArea.canvas.width),Math.floor(Math.random()*gameArea.canvas.height));
			}
			
			//spawn healthbox randomly
			if (pickups.length < maxPickups && Math.floor(Math.random() * 500) == 100) {
				pickups[pickups.length] = new pickup();
			}
			
			//update healthboxes
			for (i = 0; i < pickups.length; i++) {
				pickups[i].update();
				if (collission(thePlayer.x,thePlayer.y,thePlayer.width,thePlayer.height,pickups[i].x,pickups[i].y,pickups[i].size,pickups[i].size)) {
					pickups[i].collect();
					pickups[i].die();
				}
			}
			
			//Update all the enemies or kill them if there is too many for the difficulty
			for (i=0; i < enemies.length; i++) {
				if (i < difficulty) {
					enemies[i].update();
				} else {
					enemies[i].die();
				}
			}
			
			//Update all the bullets
			for (i=0;i < bullets.length;i++) {
				bullets[i].update();
				//Check collission with the bullet at bullets[i] and every enemy
				for (j=0;j < enemies.length;j++) {
					if (collission(bullets[i].x,bullets[i].y,bullets[i].size,bullets[i].size,enemies[j].x,enemies[j].y,enemies[j].width,enemies[j].height)) {
						enemies[j].health -= 50;
						thePlayer.score += 1;
						bullets[i].die();
					}
				}
				//Check collission with the bullet at bullets[i] and the player
				if (collission(thePlayer.x,thePlayer.y,thePlayer.width,thePlayer.height,bullets[i].x,bullets[i].y,bullets[i].size,bullets[i].size)) {
					thePlayer.health -= 10;
					bullets[i].die();
				}
			}
			
			//Draw the HUD
			gameArea.drawText("Health: " + thePlayer.health,0,20);
			gameArea.drawText("Difficulty: " + difficulty, 0, 40)
			gameArea.drawText("Enemies: " + enemies.length,0,60);
			gameArea.drawText("Score: " + thePlayer.score, 0, 80);
			gameArea.drawText("Max Score: " + maxScore, 0, 100);
			
		} else {
			//Draw Paused instead when paused
			gameArea.drawText("Paused", Math.floor(gameArea.canvas.width / 2) - 125, Math.floor(gameArea.canvas.height / 2), 48);
		}
	}
	
	function start() {
		thePlayer = new player(Math.floor(Math.random()*gameArea.canvas.width),Math.floor(Math.random()*gameArea.canvas.height));
		enemies[0] = new enemy(Math.floor(Math.random()*gameArea.canvas.width),Math.floor(Math.random()*gameArea.canvas.height));
		bullets[0] = new bullet(0,0,0);
		pickups[0] = new pickup();
	}
	
	gameArea.start();
	start();
});