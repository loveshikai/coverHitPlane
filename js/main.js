var game = new Phaser.Game(240, 400, Phaser.CANVAS, 'game')

game.myState = {};
var scoreText;
game.score = 0;

// boot state,一般是对游戏进行一些设置 
game.myState.boot = {
	preload: function() {
		game.load.image('preload', 'assets/preloader.gif');
		if(!game.device.desktop) { //判断是否在手机上
			game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT //SHOW_ALL;
		}
	},
	create: function() {
		game.state.start('load');
		
	},
	update: function() {
	}
}

// load state, 一般加载资源
game.myState.load = {
	preload: function() {
		console.log('preload');
		var preloadSprite = game.add.sprite(game.width/2 - 220/2, game.height/2 - 12/2, 'preload');
		game.load.setPreloadSprite(preloadSprite);
		game.load.audio('ao', 'assets/ao.mp3');
		game.load.image('background', 'assets/bg.jpg');
		game.load.image('award', 'assets/award.png');
		game.load.image('bullet', 'assets/bullet.png');
		game.load.image('close', 'assets/close.png');
		game.load.image('close', 'assets/close.png');
		game.load.image('copyright', 'assets/copyright.png');
		game.load.audio('crash1', 'assets/crash1.mp3');
		game.load.audio('crash2', 'assets/crash2.mp3');
		game.load.audio('crash3', 'assets/crash3.mp3');
		game.load.audio('deng', 'assets/deng.mp3');
		game.load.image('enemy1', 'assets/enemy1.png');
		game.load.image('enemy2', 'assets/enemy2.png');
		game.load.image('enemy3', 'assets/enemy3.png');
		game.load.spritesheet('explode1', 'assets/explode1.png', 20, 20);
		game.load.spritesheet('explode2', 'assets/explode2.png', 30, 30);
		game.load.spritesheet('explode3', 'assets/explode3.png', 50, 50);
		game.load.audio('fashe', 'assets/fashe.mp3');
		game.load.image('logo', 'assets/logo.jpg');
		game.load.image('mybullet', 'assets/mybullet.png');
		game.load.spritesheet('myexplode', 'assets/myexplode.png', 40, 40);
		game.load.spritesheet('myplane', 'assets/myplane.png', 40, 40);
		game.load.audio('normalback', 'assets/normalback.mp3');
		game.load.audio('pi', 'assets/pi.mp3');
		game.load.audio('playback', 'assets/playback.mp3');
		game.load.spritesheet('replaybutton', 'assets/replaybutton.png', 80, 30);
		game.load.spritesheet('sharebutton', 'assets/sharebutton.png', 80, 30);
		game.load.spritesheet('startbutton', 'assets/startbutton.png', 100, 40);
		scoreText = game.add.text(game.width/2 - 35,  game.height/2 + 20, '进度: 0%', { fontSize: '14px', fill: '#fff' }); //添加文字
		game.load.onFileComplete.add(function(process) {
			scoreText.text = '进度: ' + process + '%';
		})
	},
	create: function() {
		console.log('create')
		// cursors = game.input.keyboard.addKey(Phaser.Keyboard.UP);
		game.state.start('start');
	},
	update: function() {
		console.log('update');
			
	}
}

// start state,游戏开始界面
game.myState.start = {
	create: function() {
		console.log('create');
		let ground = game.add.sprite(0, 0, 'background');
		// ground.scale.setTo(2, 2);
		game.add.image(12, game.height-16, 'copyright');
		var myplane = game.add .sprite(100, 100, 'myplane');
		myplane.animations.add('fly');
		myplane.animations.play('fly', 5, true);
		game.add.button(70, 200, 'startbutton', this.onStartClick, this, 1, 1, 0);
		this.normalback = game.add.audio('normalback', 0.2, true);
		try {
			this.normalback.play();
		} catch(e) {}
		
	},
	onStartClick: function() {
		game.state.start('play');
		this.normalback.stop();
	}
}

// play state,游戏主界面
game.myState.play = {
	create: function() {
		// 开启AECADE物理引擎
		game.physics.startSystem(Phaser.Physics.ARCADE);
		//  背景滚动
		var bg = game.add.tileSprite(0, 0, game.width, game.height, 'background');
		bg.autoScroll(0, 20);
		// 我方飞机
		this.myplane = game.add .sprite(100, 100, 'myplane')
		this.myplane.animations.add('fly');
		this.myplane.animations.play('fly', 5, true);
		game.physics.arcade.enable(this.myplane); //打开物理属性再有body
		this.myplane.body.collideWorldBounds = true; //与游戏边界的碰撞检测
		//TODO 调试代码,产生一架敌机
		// this.enemy = game.add.sprite(100, 10, 'enemy1');
		// game.physics.arcade.enable(this.enemy);
		// this.enemy.body.mass = 200;
		// 飞机飞到底部动画
		var tween = game.add.tween(this.myplane).to({y: game.height - 40}, 1000, Phaser.Easing.Sinusoidal.InOut, true);
		tween.onComplete.add(this.onStart, this);
		//声音
		this.playback = game.add.audio('playback', 0.2, true);
		try {
			this.playback.play();
		} catch(e) {}
		// 开火声音
		this.pi =  game.add.audio('pi', 1, false);
		// 打中敌人声音
		this.fashe =  game.add.audio('fashe', 5, false);
		// 爆炸声音
		this.crash1 = game.add.audio('crash1', 10, false);
		this.crash2 = game.add.audio('crash2', 10, false);
		this.crash3 = game.add.audio('crash3', 20, false);
		// 挂了的音乐
		this.ao = game.add.audio('ao', 10, false);
		// 接到了奖的音乐
		this.deng = game.add.audio('deng', 10, false);
	},
	update: function() {
		if(this.myplane.myStartFire) {
			this.myplaneFire();
			this.generateEnemy();
			this.enemyFire();
			// 我方子弹和敌机进行碰撞检测
			game.physics.arcade.overlap(this.myBullets, this.enemys, this.hitEnemy, null, this) //(另一个碰撞)collide
			// 敌方子弹和我方飞机检测
			game.physics.arcade.overlap(this.enemyBullets, this.myplane, this.hitPlance, null, this) //(另一个碰撞)collide
			//我方飞机与奖牌碰撞检测
			game.physics.arcade.overlap(this.awards, this.myplane, this.getAward, null, this)
			//我方飞机与地方飞机的检测
			game.physics.arcade.overlap(this.enemys, this.myplane, this.getEnemy, null, this)
		}
		// console.log(this.myBullets?this.myBullets.length:0) //打印子弹数量
	},
	getEnemy: function(myplane, enemys) {
		// console.log(arguments)
		this.gameOver(myplane, this)
	},
	getAward: function(myplane, award) {
		award.kill();
		if(myplane.life < 3) {
			myplane.life = myplane.life + 1
		}
		try {
			this.deng.play();
		} catch(e) {}
	},
	gameOver: function(myplane, ts) {
		myplane.kill(); 
		var myexplode = game.add.sprite(myplane.x, myplane.y, 'myexplode')
		var anim = myexplode.animations.add('myexplode');
		anim.play(30, false, false);
		anim.onComplete.addOnce(function() {
			myexplode.destroy();
			game.state.start('over');
			ts.playback.stop()
		})
		try {
			ts.ao.play();
		} catch(e) {}
	},
	hitEnemy: function(bullet, enemy) {
		// console.log(arguments); 可打印所有参数
		enemy.life = enemy.life - 1
		if(enemy.life <= 0){
			enemy.kill();
			var explode = game.add.sprite(enemy.x, enemy.y, 'explode' + enemy.index)
			explode.anchor.setTo(0.5, 0.5);
			var anim = explode.animations.add('explode');
			anim.play(30, false, false);
			anim.onComplete.addOnce(function() {
				explode.destroy();
				game.score = game.score + enemy.mark
				this.text.text = "Score:" + game.score
			}, this);
			try {
				this['crash' + enemy.index ].play();
			} catch(e) {}
		}
		bullet.kill();
		try {
			this.fashe.play();
		} catch(e) {}
	},
	hitPlance: function(myplane, bullet) {
		bullet.kill();
		myplane.life = myplane.life -1;
		if(myplane.life <= 0) {
			this.gameOver(myplane, this)
		}
	},
	onStart: function() {
		// 允许我方飞机拖拽
		this.myplane.inputEnabled = true;
		this.myplane.input.enableDrag();
		this.myplane.myStartFire = true;
		this.myplane.life = 2;
		this.myplane.lastBulletTime = 0;
		// 我方飞机子弹组
		this.myBullets = game.add.group();
		// this.myBullets.createMultiple(50, 'mybullet'); //添加group后给里面添加5子弹
		// this.myBullets.enableBody = true;
		// this.myBullets.setAll('outOfBoundsKill', true);
		// this.myBullets.setAll('checkWorldBounds', true);

		// 敌方飞机组
		this.enemys = game.add.group();
		this.enemys.lastEnemyTime = 0
		// 敌方子弹组
		this.enemyBullets = game.add.group();
		// 分数
		var style = { font: '16 Arial', fill: '#ff0000' };
		this.text = game.add.text(5,  5, 'Score: 0', style); //添加文字
		//奖牌组
		this.awards = game.add.group();
		// 奖牌,每隔30秒产生一次
		game.time.events.loop(Phaser.Timer.SECOND *3, this.generateAward, this);
	},
	generateAward: function() {
		var awardSize = game.cache.getImage('award')
		var x = game.rnd.integerInRange(0, game.width - awardSize.width);
		var y = -awardSize.height;
		var award =  this.awards.getFirstExists(false, true, x, y, 'award');
		award.outOfBoundsKill = true
		award.checkWorldBounds = true
		game.physics.arcade.enable(award);
		award.body.velocity.y = 600;  //速度
		// console.log(this.awards.length)
	},
	// 封装子弹
	myplaneFire: function() {
		var geMyPlaneBullet = function() {
			var mybullet = this.myBullets.getFirstExists(false); //去池里面拿子弹
			//获取到了
			if(mybullet) {
				mybullet.reset(this.myplane.x + 15, this.myplane.y - 7) //获取到 reset 位置
				// this.myBullets.add(myBullet) //子弹加到组里面 上面去了就不用加了
			} else{
				//拿不到子弹,创建一个子弹
				mybullet = game.add.sprite(this.myplane.x + 15, this.myplane.y - 7, 'mybullet');
				mybullet.outOfBoundsKill = true
				mybullet.checkWorldBounds = true
				this.myBullets.addChild(mybullet)
				game.physics.enable(mybullet, Phaser.Physics.ARCADE); //开启物理属性
			}
			return mybullet
		}
		var now = new Date().getTime(); //记录当前时间 //game.time.now;
		if(this.myplane.alive && now - this.myplane.lastBulletTime > 500) {
			// 相当于new了一个bullet
			// var myBullet = game.add.sprite(this.myplane.x + 15, this.myplane.y - 7, 'mybullet');
			var mybullet = geMyPlaneBullet.call(this)
			mybullet.body.velocity.y = -200;  //速度
			if(this.myplane.life >= 2) {
				mybullet = geMyPlaneBullet.call(this)
				mybullet.body.velocity.x = -20;
				mybullet.body.velocity.y = -200;
				mybullet = geMyPlaneBullet.call(this)
				mybullet.body.velocity.x = 20;
				mybullet.body.velocity.y = -200;
			}
			if(this.myplane.life >= 3) {
				mybullet = geMyPlaneBullet.call(this)
				mybullet.body.velocity.x = -40;
				mybullet.body.velocity.y = -200;
				mybullet = geMyPlaneBullet.call(this)
				mybullet.body.velocity.x = 40;
				mybullet.body.velocity.y = -200;
			}
			this.myplane.lastBulletTime = now;
			try {
				this.pi.play();
			} catch(e) {}
		}
	},
	// 敌机
	generateEnemy: function() {
		var now = new Date().getTime(); //记录当前时间 //game.time.now;
		if(now - this.enemys.lastEnemyTime > 2000) {
			// 取一个随机数
			var enemyIndex = game.rnd.integerInRange(1, 3);
			var key = 'enemy' + enemyIndex
			var size = game.cache.getImage(key).width;
			var x = game.rnd.integerInRange(size/2, game.width - size/2);
			var y = 0
			var enemy = this.enemys.getFirstExists(false, true, x, y, key);
			enemy.size = size
			enemy.index = enemyIndex
			enemy.anchor.setTo(0.5, 0.5);
			enemy.outOfBoundsKill = true
			enemy.checkWorldBounds = true
			game.physics.arcade.enable(enemy);
			enemy.body.setSize(size, size)
			enemy.body.velocity.y = 20;  //速度
			enemy.lastFireTime = 0;
			if(enemyIndex == 1) {
				enemy.bulletV = 40;
				enemy.bulletTime = 6000;
				enemy.life = 1;
				enemy.mark = 10;
			} else if (enemyIndex ==2) {
				enemy.bulletV = 80;
				enemy.bulletTime = 4000;
				enemy.life = 2;
				enemy.mark = 20;
			} else if(enemyIndex == 3) {
				enemy.bulletV = 120;
				enemy.bulletTime = 2000;
				enemy.life = 3;
				enemy.mark = 30;
			}
			this.enemys.lastEnemyTime = now
		}
	},
	enemyFire: function() {
		var now = new Date().getTime(); //记录当前时间 //game.time.now;
		this.enemys.forEachAlive(function(enemy) {
			if(now - enemy.lastFireTime > enemy.bulletTime) {
				// 敌人发射子弹
				var bullet = this.enemyBullets.getFirstExists(false, true, enemy.x, enemy.y + enemy.size/2, 'bullet');
				bullet.anchor.setTo(0.5, 0.5);
				bullet.outOfBoundsKill = true
				bullet.checkWorldBounds = true
				game.physics.arcade.enable(bullet);
				bullet.body.velocity.y = enemy.bulletV;  //速度
				enemy.lastFireTime = now 
			}
		}, this);
		console.log(this.enemyBullets.length)
	},
	// render: function() {
	// 	// render 主要用于在debug
	// 	if(this.enemys) {
	// 		this.enemys.forEachAlive(function(enemy) {
	// 			game.debug.body(enemy)
	// 		})
	// 	}
	// },
}

//over 游戏结束界面
game.myState.over = {
	create: function() {
		let ground = game.add.sprite(0, 0, 'background');
		// ground.scale.setTo(2, 2);
		game.add.image(12, game.height-16, 'copyright');
		var myplane = game.add .sprite(100, 100, 'myplane');
		myplane.animations.add('fly');
		myplane.animations.play('fly', 5, true);
		var style = { font: "bold 32px Arial", fill: "#f00", boundsAlignH: "center", boundsAlignV: "middle" };
	    text = game.add.text(0, 0, "Score:" + game.score, style);
    	text.setTextBounds(0, 0, game.width, game.height);
		game.add.button(30, 300, 'replaybutton', this.onReplayClick, this, 0, 0, 1);
		game.add.button(130, 300, 'sharebutton', this.onShareClick, this, 0, 0, 1);
		this.normalback = game.add.audio('normalback', 0.2, true);
		try {
			this.normalback.play();
		} catch(e) {}
	},
	onReplayClick: function() {
		game.score = 0;
		game.state.start('play');
		this.normalback.stop();
	},
	onShareClick: function() {

	}
}


game.state.add('load', game.myState.load)
game.state.add('start', game.myState.start)
game.state.add('boot', game.myState.boot)
game.state.add('play', game.myState.play)
game.state.add('over', game.myState.over)
game.state.start('boot')