/*
 *   O         ,-
 *  ° o    . -´  '     ,-
 *   °  .´        ` . ´,´
 *     ( °   ))     . (
 *      `-;_    . -´ `.`.
 *          `._'       ´
 *
 * Copyright (c) 2004 Markus Fisch <mf@markusfisch.de>
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 */

/**
 * A high striker in form of a straight old vertical shooter
 */
var Striker =
{
	/**
	 * Page width in pixels
	 *
	 * @access public
	 */
	pageWidth : 0,

	/**
	 * Page height in pixels
	 *
	 * @access public
	 */
	pageHeight : 0,

	/**
	 * Number of shots the player can have simultaneously on screen
	 *
	 * @access public
	 */
	playerShots : 2,

	/**
	 * Number of simultaneous enemy shots (of all enemies)
	 *
	 * @access public
	 */
	enemyShots : 8,

	/**
	 * Number of enemies
	 *
	 * @access public
	 */
	enemies : 6,

	/**
	 * Current score
	 *
	 * @access public
	 */
	score : 0,

	/**
	 * Game objects
	 *
	 * @access private
	 */
	objects : {},

	/**
	 * Timer id
	 *
	 * @access private
	 */
	timerId : 0,

	/**
	 * Initialize game
	 *
	 * @access public
	 */
	init : function()
	{
		// determine page size
		{
			var w;
			var h;

			if( self.innerWidth )
			{
				w = self.innerWidth;
				h = self.innerHeight;
			}
			else if( document.documentElement &&
				document.documentElement.clientWidth )
			{
				w = document.documentElement.clientWidth;
				h = document.documentElement.clientHeight;
			}
			else
			{
				w = document.body.clientWidth;
				h = document.body.clientHeight;
			}

			Striker.pageWidth = w;
			Striker.pageHeight = h;
		}

		Striker.enemies = Math.floor( Striker.pageWidth/200 );
		Striker.enemyShots = Striker.enemies+2;
		Striker.playerShots = Striker.enemies>>1;
		Striker.objects = {};

		// add background object
		{
			var o = new StrikerObject();

			o.images.fly = new StrikerImageList(
				"css/images/background0.gif" );

			o.reset = function()
			{
				var i = this.images.fly.getImage();
				var w4 = i.width>>2;
				var h4 = i.height>>2;

				this.x = Math.round( Math.random()*
					(Striker.pageWidth+w4) )-w4;
				this.y = Math.round( Math.random()*
					(Striker.pageHeight+h4) )-h4;
			};

			o.fly = function()
			{
			};

			Striker.objects.background = o;
		}

		// add enemy shots
		for( var i = Striker.enemyShots; i--; )
		{
			var o = new StrikerObject();

			o.flags.enemy = o.flags.shot = true;
			o.images.fly = new StrikerImageList(
				"css/images/enemy-missile.gif" );
			o.images.explode = new StrikerImageList(
				"css/images/impact.gif" );

			o.reset = function()
			{
				this.agility = 10;
				this.power = 30;
			};

			o.setLock = function( x )
			{
				this.vectorX = (x-this.x)/this.agility;
			};

			Striker.objects["enemyShot"+i] = o;
		}

		// add enemies
		for( var i = Striker.enemies; i--; )
		{
			var o = new StrikerObject();

			o.flags.enemy = true;
			o.images.fly = new StrikerImageList(
				"css/images/enemy.gif" );
			o.images.explode = new StrikerImageList(
				"css/images/enemy-explode2.gif",
				"css/images/enemy-explode1.gif",
				"css/images/enemy-explode0.gif" );

			o.reset = function()
			{
				this.x = Math.floor( Math.random()*
					(Striker.pageWidth-this.images.fly.getImage().width) );
				this.y = -this.images.fly.getImage().height;
				this.vectorX = Math.random()-.5;
				this.vectorY = 10+(Math.random()*6);
				this.agility = 20;
				this.power = 90;
			};

			o.killed = function()
			{
				this.activate();
			};

			Striker.objects["enemy"+i] = o;
		}

		// add player shot
		for( var i = Striker.playerShots; i--; )
		{
			var o = new StrikerObject();

			o.flags.shot = true;
			o.images.fly = new StrikerImageList(
				"css/images/player-missile.gif" );
			o.images.explode = new StrikerImageList(
				"css/images/impact.gif" );

			o.reset = function()
			{
				this.agility = 10;
				this.power = 30;
			};

			Striker.objects["playerShot"+i] = o;
		}

		// add player
		{
			var o = new StrikerObject();

			o.images.fly = new StrikerImageList(
				"css/images/player.gif" );
			o.images.pitchLeft = new StrikerImageList(
				"css/images/player-pitch-left.gif" );
			o.images.pitchRight = new StrikerImageList(
				"css/images/player-pitch-right.gif" );
			o.images.explode = new StrikerImageList(
				"css/images/player-explode2.gif",
				"css/images/player-explode1.gif",
				"css/images/player-explode0.gif" );

			o.reset = function()
			{
				this.x = Striker.pageWidth>>1;
				this.y = Striker.pageHeight-this.images.fly.getImage().height;
				this.agility = 12;
				this.power = 90;
				this.ceaseFire = 0;
			};

			o.setCourse = function( x, y )
			{
				this.vectorX = (x-this.x)/this.agility;
				this.vectorY = (y-this.y)/this.agility;

				if( this.power <= 0 )
					return;

				if( this.vectorX < -2 )
					this.setImage( this.images.pitchLeft.getImage() );
				else if( this.vectorX > 2 )
					this.setImage( this.images.pitchRight.getImage() );
				else
					this.setImage( this.images.fly.getImage() );
			};

			Striker.objects.player = o;
		}
	},

	/**
	 * Start the game
	 *
	 * @access public
	 */
	start : function()
	{
		if( !Striker.isComplete() )
		{
			Striker.timerId = setTimeout( Striker.start, 100 );
			return;
		}

		if( document.layers )
			document.captureEvents( Event.MOUSEMOVE | Event.KEYUP );

		document.onmousemove = Striker.mouseMove;
		document.onkeyup = Striker.keyUp;
		document.onmousedown = Striker.keyUp;

		Striker.score = 0;

		for( var o in Striker.objects )
			if( !Striker.objects[o].flags.shot )
				Striker.objects[o].activate();

		Striker.run();
	},

	/**
	 * Stop the game
	 *
	 * @access public
	 */
	stop : function()
	{
		for( var o in Striker.objects )
			Striker.objects[o].deactivate();

		document.onmousemove = null;
		document.onkeyup = null;
		document.onmousedown = null;

		clearTimeout( Striker.timerId );
		Striker.timerId = 0;
	},

	/**
	 * Handle mouse moves
	 *
	 * @access public
	 * @param e - event
	 */
	mouseMove : function( e )
	{
		var x;
		var y;

		if( window.opera )
		{
			x = event.clientX;
			y = event.clientY;
		}
		else if( document.all )
		{
			if( document.documentElement &&
				document.documentElement.scrollTop )
			{
				x = event.clientX+document.documentElement.scrollLeft;
				y = event.clientY+document.documentElement.scrollTop;
			}
			else
			{
				x = event.clientX+document.body.scrollLeft;
				y = event.clientY+document.body.scrollTop;
			}
		}
		else
		{
			x = e.pageX;
			y = e.pageY;
		}

		Striker.objects.player.setCourse(
			x-(Striker.objects.player.w>>1),
			y-(Striker.objects.player.h>>1) );
	},

	/**
	 * Handle key ups
	 *
	 * @access public
	 * @param e - event
	 */
	keyUp : function( e )
	{
		for( var i = Striker.playerShots; i--; )
			if( !Striker.objects["playerShot"+i].active )
			{
				Striker.objects.player.fire(
					Striker.objects["playerShot"+i],
					-32 );

				return;
			}
	},

	/**
	 * Returns true as soon as all images are completely loaded
	 *
	 * @access private
	 * @return true if all images are loaded
	 */
	isComplete : function()
	{
		for( var o in Striker.objects )
			if( !Striker.objects[o].isComplete() )
				return false;

		return true;
	},

	/**
	 * Run game
	 *
	 * @access private
	 */
	run : function()
	{
		for( var o in Striker.objects )
		{
			o = Striker.objects[o];

			if( !o.active )
				continue;

			if( o.flags.enemy )
			{
				if( o.flags.shot )
				{
					// lock on player
					if( o.y < Striker.objects.player.y )
						o.setLock(
							Striker.objects.player.x+
								(Striker.objects.player.w>>1) );
				}
				else
				{
					// fire when player in front
					if( o.ceasingFire == 0 &&
						Math.abs(
							o.x-
							Striker.objects.player.x ) < 128 &&
						o.y < Striker.objects.player.y )
						for( var i = Striker.enemyShots; i--; )
							if( !Striker.objects["enemyShot"+i].active )
							{
								++Striker.score;

								Striker.objects["enemyShot"+i].setLock(
									Striker.objects.player.x+
										(Striker.objects.player.w>>1) );

								o.fire(
									Striker.objects["enemyShot"+i],
									8 );

								break;
							}
				}

				// check if the object is hit by a player shot
				for( var i = Striker.playerShots; i--; )
					if( Striker.objects["playerShot"+i].active &&
						o.overlaps(
							Striker.objects["playerShot"+i] ) )
					{
						o.damage( 0xffff );
						Striker.objects["playerShot"+i].damage( 0xffff );
						Striker.score += 50;
					}

				// check if the object hits the player
				if( o.active &&
					o.power > 0 &&
					o.overlaps(
						Striker.objects.player ) )
				{
					Striker.objects.player.damage( o.power );
					o.damage( 0xffff );
				}
			}

			o.fly();
		}

		if( !Striker.objects.player.active )
		{
			Striker.stop();
			Striker.restore();
			return;
		}

		Striker.timerId = setTimeout( Striker.run, 25 );
	}
};
