// -----------------------------------
// Slidebars
// Development version, do not use this in your site, use the latest in the distribution folder.
// http://plugins.adchsm.me/slidebars/
//
// Written by Adam Smith
// http://www.adchsm.me/
//
// Released under MIT License
// http://plugins.adchsm.me/slidebars/license.txt
//
// ---------------------
// Index of Slidebars.js
//
// 001 - Default Settings
// 002 - Feature Detection
// 003 - User Agents
// 004 - Setup
// 005 - Animation
// 006 - Operations
// 007 - API
// 008 - User Input

//Dojo Port by Jeff Keller
define(['dojo/_base/lang',
	'dojo/dom-geometry',
	'dojo/dom-style',
	'dojo/has',
	'dojo/on',
	'dojo/query',
	'dojo/NodeList-dom',
	'dojo/NodeList-manipulate',
	'dojo/NodeList-traverse',
	'./NodeList-jquery-extensions'
	],function(lang,domGeom,domStyle,has,on,query){
	//workaround helper method for getting width of nodes with display:none;
	var cssShow = { position: "absolute", visibility: "hidden", display: "block" };
	//returns an object with w/h/t/l properties
	var getPositionWhenHidden = function( elem, options ) {
		var ret, name,
			old = {};

		// Remember the old values, and insert the new ones
		for ( name in options ) {
			old[ name ] = elem.style[ name ];
			elem.style[ name ] = options[ name ];
		}
		ret = domGeom.position(elem);

		// Revert the old values
		for ( name in options ) {
			elem.style[ name ] = old[ name ];
		}

		return ret;
	};
	//Slidebars function
	return function(options){
		// ----------------------
		// 001 - Default Settings
		var settings = lang.extend( {
			siteClose: true, // true or false - Enable closing of Slidebars by clicking on #sb-site.
			scrollLock: false, // true or false - Prevent scrolling of site when a Slidebar is open.
			disableOver: false, // integer or false - Hide Slidebars over a specific width.
			hideControlClasses: false, // true or false - Hide controls at same width as disableOver.
			webApp: false // true, false or 'detect' - Enable web app feature, or detect for use with iOS fullscreen view.
		}, options );

		var test = document.createElement('div').style, // Create element to test on.
		supportTransition = false, // Variable for testing transitions.
		supportTransform = false; // variable for testing transforms.

		// Test for CSS Transitions
		if (test.MozTransition === '' || test.WebkitTransition === '' || test.OTransition === '' || test.transition === '') supportTransition = true;

		// Test for CSS Transforms
		if (test.MozTransform === '' || test.WebkitTransform === '' || test.OTransform === '' || test.transform === '') supportTransform = true;

		// -----------------
		// 003 - User Agents

		var ua = navigator.userAgent, // Get user agent string.
		android = false, // Variable for storing android version.
		iOS = false; // Variable for storing iOS version.
		
		if (/Android/.test(ua)) { // Detect Android in user agent string.
			android = ua.substr(ua.indexOf('Android')+8, 3); // Set version of Android.
		} else if (/(iPhone|iPod|iPad)/.test(ua)) { // Detect iOS in user agent string.
			iOS = ua.substr(ua.indexOf('OS ')+3, 3).replace('_', '.'); // Set version of iOS.
		}
		
		if (android && android < 3 || iOS && iOS < 5) query('html').addClass('sb-static'); // Add helper class for older versions of Android & iOS.

		// -----------
		// 004 - Setup

		// Site container
		var $site = query('#sb-site, .sb-site-container'); // Cache the selector.

		// Left Slidebar	
		if (query('.sb-left').length) { // Check if the left Slidebar exists.
			var $left = query('.sb-left'), // Cache the selector.
			leftActive = false; // Used to check whether the left Slidebar is open or closed.
		}

		// Right Slidebar
		if (query('.sb-right').length) { // Check if the right Slidebar exists.
			var $right = query('.sb-right'), // Cache the selector.
			rightActive = false; // Used to check whether the right Slidebar is open or closed.
		}
				
		var init = false, // Initialisation variable.
		windowWidth = domGeom.getMarginBox(window).w; // Get width of window.
		$controls = query('.sb-toggle-left, .sb-toggle-right, .sb-open-left, .sb-open-right, .sb-close'), // Cache the control classes.
		$slide = query('.sb-slide'); // Cache users elements to animate.

		// Initailise Slidebars
		function initialise() {
			if (!settings.disableOver || (typeof settings.disableOver === 'number' && settings.disableOver >= windowWidth)) { // False or larger than window size. 
				init = true; // true enabled Slidebars to open.
				query('html').addClass('sb-init'); // Add helper class.
				if (settings.hideControlClasses) $controls.removeClass('sb-hide'); // Remove class just incase Slidebars was originally disabled.
				css(); // Set required inline styles.
			} else if (typeof settings.disableOver === 'number' && settings.disableOver < windowWidth) { // Less than window size.
				init = false; // false stop Slidebars from opening.
				query('html').removeClass('sb-init'); // Remove helper class.
				if (settings.hideControlClasses) $controls.addClass('sb-hide'); // Hide controls
				$site.css('minHeight', ''); // Remove minimum height.
				if (leftActive || rightActive) close(); // Close Slidebars if open.
			}
		}
		initialise();
		
		// Inline CSS
		function css() {
			// Set minimum height.
			$site.css('minHeight', ''); // Reset minimum height.
			var height = domGeom.getMarginBox(query('html')[0]).h;
			$site.css('minHeight', height + 'px'); // Set minimum height of the site to the minimum height of the html.
			
			// Custom Slidebar widths.
			if ($left && $left.hasClass('sb-width-custom')){
				$left.css('width', $left.attr('data-sb-width')); // Set user custom width.	
			} 
			if ($right && $right.hasClass('sb-width-custom')) {
				$right.css('width', $right.attr('data-sb-width')); // Set user custom width.
			}
			// Set off-canvas margins for Slidebars with push and overlay animations.
			if ($left && ($left.hasClass('sb-style-push') || $left.hasClass('sb-style-overlay'))) {
				var width = getPositionWhenHidden($left[0],cssShow).w;
				width = Math.round(width)+'px';
				$left.css('marginLeft', '-' + width);
			}
			if ($right && ($right.hasClass('sb-style-push') || $right.hasClass('sb-style-overlay'))){
				var width = getPositionWhenHidden($right[0],cssShow).w;
				width = Math.round(width)+'px';
				$right.css('marginRight', '-' + width);	
			} 
			
			// Site scroll locking.
			if (settings.scrollLock) {
				query('html').addClass('sb-scroll-lock');
			}
		}
		// Resize Functions
		on(window,'resize',function(){
			var resizedWindowWidth = domGeom.getMarginBox(window).w; //query(window).width(); // Get resized window width.
			if (windowWidth !== resizedWindowWidth) { // Slidebars is running and window was actually resized.
				windowWidth = resizedWindowWidth; // Set the new window width.
				initialise(); // Call initalise to see if Slidebars should still be running.
				if (leftActive){ 
					open('left');
				} // If left Slidebar is open, calling open will ensure it is the correct size.
				if (rightActive){ 
					open('right');
				} // If right Slidebar is open, calling open will ensure it is the correct size.
			}
		});
		// I may include a height check along side a width check here in future.

		// ---------------
		// 005 - Animation

		var animation; // Animation type.

		// Set animation type.
		if (supportTransition && supportTransform) { // Browser supports css transitions and transforms.
			animation = 'translate'; // Translate for browsers that support it.
			if (android && android < 4.4) animation = 'side'; // Android supports both, but can't translate any fixed positions, so use left instead.
		} else {
			animation = 'jQuery'; // Browsers that don't support css transitions and transitions.
		}

		// Animate mixin.
		function animate(object, amount, side) {
			//debugger;
			//TODO just fix users of this method to provide px
			if((''+amount).indexOf('px')==-1){
				amount = amount+'px';	
			}
			
			// Choose selectors depending on animation style.
			var selector;
			if (object.hasClass('sb-style-push')) {
				selector = $site.add(object).add($slide); // Push - Animate site, Slidebar and user elements.
			} else if (object.hasClass('sb-style-overlay')) {
				selector = object; // Overlay - Animate Slidebar only.
			} else {
				selector = $site.add($slide); // Reveal - Animate site and user elements.
			}
			
			// Apply animation
			if (animation === 'translate') {
				selector.css('transform', 'translate(' + amount + ')'); // Apply the animation.
				selector.css('-webkit-transform', 'translate(' + amount + ')');

			} else if (animation === 'side') {		
				if (amount[0] === '-'){
					amount = amount.substr(1); // Remove the '-' from the passed amount for side animations.
				}
				if (amount !== '0px'){
					selector.css(side, '0'); // Add a 0 value so css transition works.	
				} 
				setTimeout(function() { // Set a timeout to allow the 0 value to be applied above.
					selector.css(side, amount); // Apply the animation.
				}, 1);

			} 

			
			// If closed, remove the inline styling on completion of the animation.
			setTimeout(function() {
				if (amount === '0px') {
					selector.removeAttr('style');
					css();
				}
			}, 400);
		}

		// ----------------
		// 006 - Operations

		// Open a Slidebar
		function open(side) {
			// Check to see if opposite Slidebar is open.
			if (side === 'left' && $left && rightActive || side === 'right' && $right && leftActive) { // It's open, close it, then continue.
				close();
				setTimeout(proceed, 400);
			} else { // Its not open, continue.
				proceed();
			}

			// Open
			function proceed() {
				if (init && side === 'left' && $left) { // Slidebars is initiated, left is in use and called to open.
					query('html').addClass('sb-active sb-active-left'); // Add active classes.
					$left.addClass('sb-active');
					var width = getPositionWhenHidden($left[0]).w;
					width = Math.round(width)+'px';
					animate($left, width, 'left'); // Animation
					setTimeout(function() { leftActive = true; }, 400); // Set active variables.
				} else if (init && side === 'right' && $right) { // Slidebars is initiated, right is in use and called to open.
					query('html').addClass('sb-active sb-active-right'); // Add active classes.
					$right.addClass('sb-active')
					var width = getPositionWhenHidden($right[0]).w;;
					width = Math.round(width)+'px';
					animate($right, '-' + width, 'right'); // Animation
					setTimeout(function() { rightActive = true; }, 400); // Set active variables.
				}
			}
		}
			
		// Close either Slidebar
		function close(link) {
			if (leftActive || rightActive) { // If a Slidebar is open.
				if (leftActive) {
					animate($left, '0px', 'left'); // Animation
					leftActive = false;
				}
				if (rightActive) {
					animate($right, '0px', 'right'); // Animation
					rightActive = false;
				}
			
				setTimeout(function() { // Wait for closing animation to finish.
					query('html').removeClass('sb-active sb-active-left sb-active-right'); // Remove active classes.
					if ($left) $left.removeClass('sb-active');
					if ($right) $right.removeClass('sb-active');
					if (typeof link !== 'undefined') window.location = link; // If a link has been passed to the function, go to it.
				}, 400);
			}
		}
		
		// Toggle either Slidebar
		function toggle(side) {
			if (side === 'left' && $left) { // If left Slidebar is called and in use.
				if (!leftActive) {
					open('left'); // Slidebar is closed, open it.
				} else {
					close(); // Slidebar is open, close it.
				}
			}
			if (side === 'right' && $right) { // If right Slidebar is called and in use.
				if (!rightActive) {
					open('right'); // Slidebar is closed, open it.
				} else {
					close(); // Slidebar is open, close it.
				}
			}
		}

		// ---------
		// 007 - API
		
		this.slidebars = {
			open: open, // Maps user variable name to the open method.
			close: close, // Maps user variable name to the close method.
			toggle: toggle, // Maps user variable name to the toggle method.
			init: function() { // Returns true or false whether Slidebars are running or not.
				return init; // Returns true or false whether Slidebars are running.
			},
			active: function(side) { // Returns true or false whether Slidebar is open or closed.
				if (side === 'left' && $left) return leftActive;
				if (side === 'right' && $right) return rightActive;
			},
			destroy: function(side) { // Removes the Slidebar from the DOM.
				if (side === 'left' && $left) {
					if (leftActive) close(); // Close if its open.
					setTimeout(function() {
						$left.remove(); // Remove it.
						$left = false; // Set variable to false so it cannot be opened again.
					}, 400);
				}
				if (side === 'right' && $right) {
					if (rightActive) close(); // Close if its open.
					setTimeout(function() {
						$right.remove(); // Remove it.
						$right = false; // Set variable to false so it cannot be opened again.
					}, 400);
				}
			}
		};

		// ----------------
		// 008 - User Input
		
		function eventHandler(event, selector) {
			event.stopPropagation(); // Stop event bubbling.
			event.preventDefault(); // Prevent default behaviour.
		}
		var eventName = has('touch') ? 'touchend' : 'click';
		// Toggle left Slidebar
		query('.sb-toggle-left').on(eventName, function(event) {
			eventHandler(event, query(this)); // Handle the event.
			toggle('left'); // Toggle the left Slidbar.
		});
		
		// Toggle right Slidebar
		query('.sb-toggle-right').on(eventName, function(event) {
			eventHandler(event, query(this)); // Handle the event.
			toggle('right'); // Toggle the right Slidbar.
		});
		
		// Open left Slidebar
		query('.sb-open-left').on(eventName, function(event) {
			eventHandler(event, query(this)); // Handle the event.
			open('left'); // Open the left Slidebar.
		});
		
		// Open right Slidebar
		query('.sb-open-right').on(eventName, function(event) {
			eventHandler(event, query(this)); // Handle the event.
			open('right'); // Open the right Slidebar.
		});
		
		// Close Slidebar
		query('.sb-close').on(eventName, function(event) {
			var tag = event.currentTarget.tagName;
			if (tag==='A' || query('a',event.currentTarget).length > 0 ) { // Is a link or contains a link.
				if ( event.type === 'click' ) { // Make sure the user wanted to follow the link.
					event.preventDefault(); // Stop default behaviour.
					var href = ( query(this).is('a') ? query(this).attr('href') : query(this).find('a').attr('href') ); // Get the href.
					close( href ); // Close Slidebar and pass link.
				}
			} else { // Just a normal control class.
				eventHandler(event, query(this)); // Handle the event.
				close(); // Close Slidebar.
			}
		});
		
		// Close Slidebar via site
		$site.on(eventName, function(event) {
			if (settings.siteClose && (leftActive || rightActive)) { // If settings permit closing by site and left or right Slidebar is open.
				eventHandler(event, query(this)); // Handle the event.
				close(); // Close it.
			}
		});
}
});