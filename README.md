# dojo-slidebars
This is dojo port of [Adam Smith's](http://www.adchsm.me/) Slidebar plugin for Jquery.  It has a dependency on Dojo 1.8+.

To run examples, dojo should be installed through bower:

	$ bower install


To use slidebars, simply include slidebars.css and require in the slidebars module, and run the resulting function.

	require(['slidebars/slidebars','dojo/domReady!'],function(slidebars){
		slidebars();
	});


# Original SlideBars Readme

Slidebars is a jQuery framework for quickly and easily implementing app style off-canvas space into your website.

See the [Slidebars website](http://plugins.adchsm.me/slidebars/) for information on getting started, usage documentation and compatibility tables.

Slidebars is stable, but still in early development. It's markup, installation and functionality is likely to change at any time, therefore I advise you to read up on any usage changes when updating to ensure it goes smoothly.
