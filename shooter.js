$(document).ready(function(){
	
	var thePlayer;
	var maxEnemies = 10;
	var enemies = [maxEnemies];
	var maxBullets = 10;
	var bullets = [];
	
	$(document).keypress(function(e) {
		if (e.which == 119) {
			thePlayer.y -= 5;
		} else if (e.which == 100) {
			thePlayer.x += 5;
		} else if (e.which == 97) {
			thePlayer.x -= 5;
		} else if (e.which == 115) {
			thePlayer.y += 5;
		} else {
			alert(e.which);
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
			this.context.save();
			this.context.fillStyle = color;
			this.context.translate(x,y);
			this.context.rotate(rotation);
			this.context.fillRect(0, 0, width, height);
			this.context.restore();
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
		this.update = function() {
			gameArea.draw(this.height, this.width, this.x, this.y, this.color,0);
			gameArea.draw(6,40,(this.x + ((this.width/2)-3)),(this.y + ((this.height/2)-3)), this.color,Math.atan2(this.aimY - this.y, this.aimX - this.x));
		}
	}
	function enemy(x,y) {
		this.health = 100;
		this.cooldown = 100;
		this.color = "red";
		this.x = x;
		this.y = y;
		this.height = 20;
		this.width = 20;
		this.update = function() {
			if (this.cooldown > 100) {
				this.cooldown = 0;
				
			} else {
				this.cooldown += 1;
			}
			gameArea.draw(this.height, this.width, this.x, this.y, this.color);
		}
	}
	function bullet(x, y, rotation) {
		this.x = x;
		this.y = y;
		this.speed = 2;
		this.rotation = rotation;
		this.update = function() {
			this.x += this.speed * Math.cos(this.rotation);
			this.y += this.speed * Math.sin(this.rotation);
			if (collission(this.x,this.y,5,5,enemies[0].x,enemies[0].y,enemies[0].width,enemies[0].height)) {
				enemies[0].width -= 10;
			}
			gameArea.draw(5,5,this.x,this.y,"black",this.rotation);
			if (this.x > gameArea.canvas.width || this.x < 0 || this.y > gameArea.canvas.height || this.y < 0) {
				bullets.splice(bullets.indexOf(this),1);
			}
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
		enemies[0].update();
		for (i=0;i < bullets.length;i++) {
			bullets[i].update();
		}
	}
	
	function start() {
		thePlayer = new player(100,100);
		enemies[0] = new enemy(300,300);
	}
	
	gameArea.start();
	start();
});