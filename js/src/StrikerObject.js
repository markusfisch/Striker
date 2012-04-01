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
 * A Striker game object
 */
function StrikerObject()
{
	/**
	 * Flags
	 *
	 * @access public
	 */
	this.flags = {};

	/**
	 * Images of object in different game stages
	 *
	 * @access public
	 */
	this.images = {};

	/**
	 * True when object is active
	 *
	 * @access public
	 */
	this.active = false;

	/**
	 * Horizontal coordinate of object on screen
	 *
	 * @access public
	 */
	this.x = 0;

	/**
	 * Vertical coordinate of object on screen
	 *
	 * @access public
	 */
	this.y = 0;

	/**
	 * Width of object in pixels
	 *
	 * @access public
	 */
	this.w = 0;

	/**
	 * Height of object in pixels
	 *
	 * @access public
	 */
	this.h = 0;

	/**
	 * Vector of movement in horizontal direction
	 *
	 * @access public
	 */
	this.vectorX = 0;

	/**
	 * Vector of movement in vertical direction
	 *
	 * @access public
	 */
	this.vectorY = 0;

	/**
	 * This value tells how fast the change in direction is
	 *
	 * @access public
	 */
	this.agility = 0;

	/**
	 * Structural power of object
	 *
	 * @access private
	 */
	this.power = 0;

	/**
	 * How many cycles ceasing fire after a shot
	 *
	 * @access private
	 */
	this.ceaseFire = 16;

	/**
	 * Number of cycles left to cease fire
	 *
	 * @access private
	 */
	this.ceasingFire = 0;

	/**
	 * Number of cycles left this objects will keep exploding
	 *
	 * @access private
	 */
	this.exploding = 0;

	/**
	 * Document division
	 *
	 * @access private
	 */
	this.div = 0;

	// initialize
	{
		var nextFreeId = document.getElementsByTagName( "div" ).length;
		var d = document.createElement( "div" );

		d.id = "StrikerObject"+nextFreeId;
		d.style.position = "absolute";
		d.style.visibility = "hidden";
		document.body.appendChild( d );

		this.div = d.style;
	}
}

/**
 * Return true when images are loaded
 *
 * @access public
 * @return true when images are loaded
 */
StrikerObject.prototype.isComplete = function()
{
	for( var n in this.images )
		if( !this.images[n].isComplete() )
			return false;

	return true;
};

/**
 * (Re-)Activate object
 *
 * @access public
 */
StrikerObject.prototype.activate = function()
{
	this.reset();
	this.reposition( this.x, this.y );
	this.setImage( this.images.fly.getImage() );

	this.active = true;
	this.exploding = 0;
	this.ceasingFire = 0;

	this.div.visibility = 'visible';
};

/**
 * Deactivate object
 *
 * @access public
 */
StrikerObject.prototype.deactivate = function()
{
	this.active = false;
	this.div.visibility = 'hidden';
	this.div.left = "0px";
	this.div.top = "0px";
};

/**
 * Set course towards the given coordinates
 *
 * @access public
 * @param x - x coordinate
 * @param y - y coordinate
 */
StrikerObject.prototype.setCourse = function( x, y )
{
	if( y > Striker.pageHeight )
		y = Striker.pageHeight;
	else if( y < 0 )
		y = 0;

	this.vectorX = (x-this.x)/this.agility;
	this.vectorY = (y-this.y)/this.agility;
};

/**
 * Fly
 *
 * @access public
 */
StrikerObject.prototype.fly = function()
{
	this.x += this.vectorX;
	this.y += this.vectorY;

	if( !this.inRange() )
	{
		this.killed();
		return;
	}

	this.reposition( this.x, this.y );

	if( this.ceasingFire > 0 )
		this.ceasingFire--;

	if( this.power <= 0 &&
		this.exploding == 0 )
	{
		this.killed();
		return;
	}

	if( this.exploding > 0 )
	{
		this.setImage( this.images.explode.getImage( this.exploding>>2 ) );
		this.exploding--;
	}
};

/**
 * Give object damage
 *
 * @access public
 * @param amount - amount of damage
 */
StrikerObject.prototype.damage = function( amount )
{
	if( this.exploding > 0 ||
		(this.power -= amount) > 0 )
		return;

	this.exploding = this.images.explode.images.length<<2;
	this.ceasingFire = 0xffff;
};

/**
 * Fire some object off the position of this object
 *
 * @access public
 * @param o - object to fire
 * @param vectorY - vertical vector of missile
 */
StrikerObject.prototype.fire = function( o, vectorY )
{
	if( this.ceasingFire > 0 )
		return;

	this.ceasingFire = this.ceaseFire;

	o.x = this.x+(this.w>>1);
	o.y = this.y+(this.h>>1);
	o.vectorY = this.vectorY+vectorY;
	o.activate();
};

/**
 * Returns true when the given object overlaps this one
 *
 * @access public
 * @param o - other object
 * @return true if overlapping
 */
StrikerObject.prototype.overlaps = function( o )
{
	if( this.x > o.x-this.w &&
		this.x < o.x+o.w &&
		this.y > o.y-this.h &&
		this.y < o.y+o.h )
		return true;

	return false;
};

/**
 * Returns true as long as the positoin of the object is within the range
 * of the game; this is a virtual method
 *
 * @access private
 * @return true when object is in game range
 */
StrikerObject.prototype.inRange = function()
{
	if( this.y < -200 ||
		this.y > Striker.pageHeight+200 )
		return false;

	return true;
};

/**
 * Reset object variables; this is a virtual method
 *
 * @access private
 */
StrikerObject.prototype.reset = function()
{
	this.x = Math.random()*Striker.pageWidth;
	this.y = Math.random()*Striker.pageHeight;
};

/**
 * This method executes actions after the object was killed; this is a
 * virtual method
 *
 * @access private
 */
StrikerObject.prototype.killed = function()
{
	this.deactivate();
};

/**
 * Reposition division
 *
 * @access private
 * @param x - x coordinate
 * @param y - y coordinate
 */
StrikerObject.prototype.reposition = function( x, y )
{
	if( !isNaN( x ) )
		this.div.left = Math.round( x )+"px";

	if( !isNaN( y ) )
		this.div.top = Math.round( y )+"px";
};

/**
 * Set image
 *
 * @access private
 * @param image - image object
 */
StrikerObject.prototype.setImage = function( image )
{
	this.w = image.width;
	this.h = image.height;

	this.div.width = image.width+"px";
	this.div.height = image.height+"px";
	this.div.backgroundImage = "url("+image.src+")";
};
