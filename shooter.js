$(document).ready(function(){
	
	var thePlayer;
	var maxEnemies = 10;
	var enemies = [maxEnemies];
	var maxBullets = 20;
	var bullets = [maxBullets];
	
	$(document).keypress(function(e) {
		if (e.which == 119) {
			thePlayer.y -= 5;
		} else if (e.which == 100) {
			thePlayer.x += 5;
		} else if (e.which == 97) {
			thePlayer.x -= 5;
		} else if (e.which == 115) {
			thePlayer.y += 5;
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
		drawText : function (theString, x, y) {
			//Draw function for text
			this.context.font = "16px Verdana";
			this.context.fillText(theString, x, y);
		}
	}
	
	function player(x,y) {
		this.health = 100;
		this.color = "black";
		this.x = x;
		this.y = y;
		this.aimX = 0;
		this.aimY = 0;
		this.height = 20;
		this.width = 20;
		this.score = 0;
		this.update = function() {
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
		this.color = "red";
		this.x = x;
		this.y = y;
		this.height = 20;
		this.width = 20;
		this.moving = Math.random() >= 0.5;
		this.update = function() {
			if (this.health < 0) {
				this.die();
			}
			if (this.cooldown > 100) {
				this.cooldown = 0;
				this.fire();
			} else {
				this.cooldown += 1;
			}
			if (this.moving) {
				this.x += ((thePlayer.x - this.x) / 500);
				this.y += ((thePlayer.y - this.y) / 500);
			}
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
		this.speed = 3;
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
			bullets.splice(bullets.indexOf(this),1);
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
		gameArea.clear();
		thePlayer.update();
		gameArea.drawText("Health: " + thePlayer.health,0,20);
		gameArea.drawText("Enemies: " + enemies.length,0,40);
		gameArea.drawText("Score: " + thePlayer.score, 0, 60)
		//Spawn enemies randomly or spawn if there isn't any active ones
		if (enemies.length < 1 || ((Math.floor(Math.random() * 200) == 100) && enemies.length < maxEnemies)) {
			enemies[enemies.length] = new enemy(Math.floor(Math.random()*gameArea.canvas.width),Math.floor(Math.random()*gameArea.canvas.height));
		}
		for (i=0; i < enemies.length; i++) {
			enemies[i].update();
		}
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
	}
	
	function start() {
		thePlayer = new player(Math.floor(Math.random()*gameArea.canvas.width),Math.floor(Math.random()*gameArea.canvas.height));
		enemies[0] = new enemy(Math.floor(Math.random()*gameArea.canvas.width),Math.floor(Math.random()*gameArea.canvas.height));
		bullets[0] = new bullet(0,0,0);
	}
	
	gameArea.start();
	start();
});