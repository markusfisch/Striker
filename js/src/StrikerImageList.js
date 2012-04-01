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
 * Image list
 *
 * @access public
 * @param ... - URL's of image files
 */
function StrikerImageList()
{
	/**
	 * Array of images
	 *
	 * @access public
	 */
	this.images = [];

	for( var i = 0;
		i < StrikerImageList.arguments.length;
		++i )
		this.add( StrikerImageList.arguments[i] );
}

/**
 * Add image to list
 *
 * @access public
 * @param src - URL of image file
 */
StrikerImageList.prototype.add = function( src )
{
	var n = this.images.length;

	this.images[n] = new Image();
	this.images[n].src = src;
};

/**
 * Returns true when all images are completely loaded
 *
 * @access public
 * @return true when all images are loaded
 */
StrikerImageList.prototype.isComplete = function()
{
	for( var i = 0; i < this.images.length; ++i )
		if( !this.images[i].complete )
			return false;

	return true;
};

/**
 * Return image object
 *
 * @access public
 * @param n - frame number (optional)
 * @return image object
 */
StrikerImageList.prototype.getImage = function()
{
	var n = 0;

	if( this.getImage.arguments.length > 0 &&
		(n = this.getImage.arguments[0]) >= 0 &&
		n >= this.images.length )
		n = 0;

	return this.images[n];
};
