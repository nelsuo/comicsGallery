// the semi-colon before function invocation is a safety net against concatenated 
// scripts and/or other plugins which may not be closed properly.
;(function ( $, window, document, undefined ) {

    // undefined is used here as the undefined global variable in ECMAScript 3 is
    // mutable (ie. it can be changed by someone else). undefined isn't really being
    // passed in so we can ensure the value of it is truly undefined. In ES5, undefined
    // can no longer be modified.

    // window and document are passed through as local variables rather than globals
    // as this (slightly) quickens the resolution process and can be more efficiently
    // minified (especially when both are regularly referenced in your plugin).

    // Create the defaults once
    var pluginName = 'comicsGallery',
        defaults = {        	
            outerPanelWidth: "auto",
            outerPanelHeight: "auto",
            innerPanelWidth: "auto",
            innerPanelHeight: "auto",
            cyclic: false,
            cyclicRandom: false,
            cyclicTimeInterval: 2000
        };

    // The actual plugin constructor
    function Plugin( element, options ) {
        this.element = element;

        // jQuery has an extend method which merges the contents of two or 
        // more objects, storing the result in the first object. The first object
        // is generally empty as we don't want to alter the default options for
        // future instances of the plugin
        this.options = $.extend( {}, defaults, options) ;
        
        

        this._defaults = defaults;
        this._name = pluginName;
		
        this.init();
    }

    Plugin.prototype.init = function () {
        // Place initialization logic here
        // You already have access to the DOM element and the options via the instance, 
        // e.g., this.element and this.options   
        
        var board = {
			square: 0,		
			squares: null,
			element: null,
			options: null,
			
			init: function (element, options) {
				board.element = element;
				board.squares = board.element.children();
				board.options = options;		
				board.initStructure();		
				board.positionElements();
				
				dim = board.findDimensions();
				board.setDimensions(dim);
				
				board.positionBlackout(board.square);
				board.initButtons();
				
				if (board.options.cyclic == true) {
					board.cyclic();
				}
			},
			
			initStructure: function () {
				board.element.append($('<div class="comicsGallery_window">' +
		        	'<div class="bLeft blackout left"></div>' +		
					'<div class="bRight blackout right"></div>' +
					'<div class="bTop blackout top"></div>' +
					'<div class="bBottom blackout bottom"></div>' +          	
		        	'<div class="comicsGallery_board">' +        	
		        	'</div>' +        	        	
		        	'<a class="comicsGallery_navigation previous" href="#">Previous</a>' +        		      		
		        	'<a class="comicsGallery_navigation next" href="#">Next</a>' +
		        '</div>'));
		        
		        board.squares.appendTo(board.element.find('.comicsGallery_board'));
			},
			
			positionElements: function () {
				el = board.element;
		        var l=0, t=0, tMax=0;                
		        board.squares.each(function () {        	
		        	w = $(this).width(); h = $(this).height();        	   	
		        	if (l + w > board.options.innerPanelWidth) {        		
		        		if (l == 0) {
		        			board.debug('critical error: element to large!'); return;
		        		}	
		        		t = t + tMax;
		        		tMax = 0;
		        		l = 0;
		        	}
		        	$(this).css('left', l + 'px'); $(this).css('top', t + 'px');
		        	l += w;        	
		        	if (h > tMax) { tMax = h; }
		        });
			},
			
			initButtons: function () {
				board.element.find('.comicsGallery_navigation.previous').unbind('click').bind('click', function () {
					if (board.square == 0) {
						board.square = board.squares.length;
					}
					board.positionBlackout(--board.square);
				});
				
				board.element.find('.comicsGallery_navigation.next').unbind('click').bind('click', function () {
					if (board.square == board.squares.length-1) {
						board.square = -1;
					}
					board.positionBlackout(++board.square);
				});
			},
			
			findDimensions: function (n) {
				maxHeight = 0; maxWidth = 0;
				board.squares.each(function () {
					if ($(this).height() > maxHeight) {
						maxHeight = $(this).height();
					}
					if ($(this).width() > maxWidth) {
						maxWidth = $(this).width();
					}	
				});		
				return {h: maxHeight, w: maxWidth};
			},
			
			setDimensions: function (dim) {		
				_window = board.element.find('.comicsGallery_window');
				if (board.options.outerPanelWidth == 'auto') { _window.css('width', dim.w); } 
				else { _window.css('width', board.options.outerPanelWidth);	}	
				if (board.options.outerPanelHeight == 'auto') { _window.css('height', dim.h); } 
				else { _window.css('height', board.options.outerPanelHeight); }
				
				_board = board.element.find('.comicsGallery_board');		
				if (board.options.innerPanelWidth == 'auto') { _board.width(dim.w*10); } 
				else { _board.css('width', board.options.innerPanelWidth);	}	
				if (board.options.innerPanelHeight == 'auto') { _board.height(dim.h*10); } 
				else { _board.css('height', board.options.outerPanelHeight); }
				
				 
			},
			
			positionBlackout: function (n) {
				
				el = $(board.squares.get(n));
				
				bPosition = board.positionCenter(el);
				_window = board.element.find('.comicsGallery_window');		
				
				gapLeft = (_window.width() - el.width()) / 2;		
				gapTop = _window.height() - (Math.ceil((_window.height() - el.height()) / 2) * 2) - el.height();
				
				board.element.find('.bLeft').css('right', (_window.width() - Math.ceil(_window.width() - el.width()) / 2) + 'px');
				board.element.find('.bLeft').css('bottom', Math.ceil((_window.height() - el.height()) / 2) + 'px');
				
				board.element.find('.bRight').css('left', (_window.width() - Math.ceil(_window.width() - el.width()) / 2) + 'px');
				board.element.find('.bRight').css('top', Math.ceil((_window.height() - el.height()) / 2) + 'px');
				
				board.element.find('.bTop').css('bottom', (_window.height() - Math.ceil(_window.height() - el.height()) / 2) + 'px');
				board.element.find('.bTop').css('left', Math.ceil((_window.width() - el.width()) / 2) + 'px');
				
				board.element.find('.bBottom').css('top', (_window.height() - Math.ceil(_window.height() - el.height()) / 2) + 'px');
				board.element.find('.bBottom').css('right', Math.ceil((_window.width() - el.width()) / 2) + 'px');
				
				
			},
			
			positionCenter: function (el) {
				p = el.position();
				_board = board.element.find('.comicsGallery_board');
				_window = board.element.find('.comicsGallery_window');		
				pLeft = (_window.width() / 2 - el.width() / 2 - p.left);
				pTop = (_window.height() / 2 - el.height() / 2 - p.top);
						
				_board.css('left', pLeft + 'px').css('top', pTop + 'px');
				
				return {top: pTop, left: pLeft};
			},
			
			cyclic: function () {
				window.setInterval(function() {
					if (!board.options.cyclicRandom) {
						if (board.square == board.squares.length-1) { board.square = -1 }
						n = ++board.square;
					} else {
						n = board.random(0, board.squares.length-1);
							
					}
					board.positionBlackout(n);
				}, board.options.cyclicTimeInterval);	
			},
			
			random: function (min, max) {		
				return Math.floor(Math.random() * (max - min + 1) + min);
			},
			
			debug: function (error) {		
		        console.log(error);        
			}
		};  
          
        board.init($(this.element), this.options);
        
             
    };

    // A really lightweight plugin wrapper around the constructor, 
    // preventing against multiple instantiations
    $.fn[pluginName] = function ( options ) {
    	
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {            	            	
                $.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
            }
        });
    }

})( jQuery, window, document );


