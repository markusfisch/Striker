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
 * App
 */
var App =
{
	/**
	 * Briefing element
	 *
	 * @access private
	 * @var object
	 */
	briefing : null,

	/**
	 * Load
	 */
	load : function()
	{
		App.briefing = document.getElementById( "Briefing" );

		if( !App.briefing )
			return;

		Striker.restore = App.restore;
		Striker.init();
	},

	/**
	 * Run game
	 *
	 * @return false on success (means event doesn't need to be propagated)
	 */
	play : function()
	{
		App.briefing.style.display = "none";
		document.body.style.overflow = "hidden";

		Striker.start();

		return false;
	},

	/**
	 * Restore
	 */
	restore : function()
	{
		App.briefing.style.display = "block";
		document.body.style.overflow = "auto";

		if( Striker.score > 0 )
		{
			var who = "";

			// update scale
			{
				var m = 0;
				var s = document.getElementById( "Scale" );

				for( var n = 0; n < s.childNodes.length; ++n )
					if( s.childNodes[n].tagName == "LI" )
						++m;

				var l = Math.ceil( (m/20000)*Striker.score );

				if( l < 1 )
					l = 1;

				if( l > m )
					l = m;

				l = "L"+l;

				for( var n = 0; n < s.childNodes.length; ++n )
				{
					if( s.childNodes[n].tagName != "LI" )
						continue;

					if( s.childNodes[n].id == l )
					{
						var a = s.childNodes[n].getElementsByTagName( "a" );

						if( a.length > 0 )
						{
							var w = a[0].innerHTML.split( " " );

							if( w.length > 0 )
								who = w[0];
						}

						s.childNodes[n].className = "Highlight";
					}
					else
						s.childNodes[n].className = "";
				}
			}

			// display scores
			{
				var e = document.getElementById( "Score" );

				e.innerHTML = "You made <strong>"+
					Striker.score+
					"</strong> points, "+who+"!";
			}
		}
	}
}

window.onload = function()
{
	App.load();
};
