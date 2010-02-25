/* ------------------------------------------------------------------------
	prettySociable plugin.
	Version: 1.2.1
	Description: Include this plugin in your webpage and let people
	share your content like never before.
	Website: http://no-margin-for-errors.com/projects/prettySociable/
	
	Thank You: 
	Chris Wallace, for the nice icons
	http://www.chris-wallace.com/2009/05/28/free-social-media-icons-socialize/
------------------------------------------------------------------------- */

	(function($) {
		$.prettySociable = {version: 1.21};

		$.prettySociable = function(settings) {
			$.prettySociable.settings = jQuery.extend({
				animationSpeed: 'fast', /* fast/slow/normal */
				opacity: 0.90, /* Value between 0 and 1 */
				share_label: 'Drag to share', /* Text displayed when a user rollover an item */
				label_position: 'top', /* top OR inside */
				share_on_label: 'Share on ', /* Text displayed when a user rollover a website to share */
				hideflash: false, /* Hides all the flash object on a page, set to TRUE if flash appears over prettySociable */
				hover_padding: 0,
				websites: {
					facebook : {
						'active': true,
						'encode':true, // If sharing is not working, try to turn to false
						'title': 'Facebook',
						'url': 'http://www.facebook.com/share.php?u=',
						'icon':'images/prettySociable/large_icons/facebook.png',
						'sizes':{'width':70,'height':70}
					},
					twitter : {
						'active': true,
						'encode':true, // If sharing is not working, try to turn to false
						'title': 'Twitter',
						'url': 'http://twitter.com/home?status=',
						'icon':'images/prettySociable/large_icons/twitter.png',
						'sizes':{'width':70,'height':70}
					},
					delicious : {
						'active': true,
						'encode':true, // If sharing is not working, try to turn to false
						'title': 'Delicious',
						'url': 'http://del.icio.us/post?url=',
						'icon':'images/prettySociable/large_icons/delicious.png',
						'sizes':{'width':70,'height':70}
					},
					digg : {
						'active': true,
						'encode':true, // If sharing is not working, try to turn to false
						'title': 'Digg',
						'url': 'http://digg.com/submit?phase=2&url=',
						'icon':'images/prettySociable/large_icons/digg.png',
						'sizes':{'width':70,'height':70}
					},
					linkedin : {
						'active': true,
						'encode':true, // If sharing is not working, try to turn to false
						'title': 'LinkedIn',
						'url': 'http://www.linkedin.com/shareArticle?mini=true&ro=true&url=',
						'icon':'images/prettySociable/large_icons/linkedin.png',
						'sizes':{'width':70,'height':70}
					},
					reddit : {
						'active': true,
						'encode':true, // If sharing is not working, try to turn to false
						'title': 'Reddit',
						'url': 'http://reddit.com/submit?url=',
						'icon':'images/prettySociable/large_icons/reddit.png',
						'sizes':{'width':70,'height':70}
					},
					stumbleupon : {
						'active': true,
						'encode':false, // If sharing is not working, try to turn to false
						'title': 'StumbleUpon',
						'url': 'http://stumbleupon.com/submit?url=',
						'icon':'images/prettySociable/large_icons/stumbleupon.png',
						'sizes':{'width':70,'height':70}
					},
					tumblr : {
						'active': true,
						'encode':true, // If sharing is not working, try to turn to false
						'title': 'tumblr',
						'url': 'http://www.tumblr.com/share?v=3&u=',
						'icon':'images/prettySociable/large_icons/tumblr.png',
						'sizes':{'width':70,'height':70}
					}
				},
				urlshortener : {
					/*
						To get started you'll need a free bit.ly user account and API key - sign up at:
					    http://bit.ly/account/register?rd=/ 
						Quickly access your private API key once you are signed in at:
					    http://bit.ly/account/your_api_key
					*/
					bitly : {
						'active' : false
					}
				},
				tooltip: {
						offsetTop:0,
						offsetLeft: 15
					},
				popup: {
					width: 900,
					height: 500
				},
				callback: function(){} /* Called when prettySociable is closed */
			}, settings);
			
			var websites, settings=$.prettySociable.settings, show_timer, ps_hover;
			
			// Preload the icons
			$.each(settings.websites,function(i){
				var preload = new Image();
				preload.src =this.icon;
			});
			
			// Bind the mouseover
			$('a[rel^=prettySociable]').hover(function(){ // HOVER
				_self = this; // Scoping
				_container = this;
				
				// If we're sharing an image or a video the self becomes the image and not the link
				if($(_self).find('img').size() > 0){
					_self = $(_self).find('img');
				}else if($.browser.msie){
					if($(_self).find('embed').size() > 0){
						_self = $(_self).find('embed');
						$(_self).css({'display':'block'});
					}
				}else{
					if($(_self).find('object').size() > 0){
						_self = $(_self).find('object');
						$(_self).css({'display':'block'});
					}
				}
				
				// Bring the hovered item up front
				$(_self).css({
					'cursor': 'move',
					'position': 'relative',
					'z-index': 1005
				});
				
				// Define the offset in the case the shared element has padding/borders
				offsetLeft = (parseFloat($(_self).css('borderLeftWidth'))) ? parseFloat($(_self).css('borderLeftWidth')) : 0;
				offsetTop = (parseFloat($(_self).css('borderTopWidth'))) ? parseFloat($(_self).css('borderTopWidth')) : 0;
				
				offsetLeft += (parseFloat($(_self).css('paddingLeft'))) ? parseFloat($(_self).css('paddingLeft')) : 0;
				offsetTop += (parseFloat($(_self).css('paddingTop'))) ? parseFloat($(_self).css('paddingTop')) : 0;
				
				// Add the shadow, then position it, then inject it
				ps_hover = $('<div id="ps_hover"> \
								<div class="ps_hd"> \
									<div class="ps_c"></div> \
								</div> \
								<div class="ps_bd"> \
									<div class="ps_c"> \
										<div class="ps_s"> \
										</div> \
									</div> \
								</div> \
								<div class="ps_ft"> \
									<div class="ps_c"></div> \
								</div> \
								<div id="ps_title"> \
									<div class="ps_tt_l"> \
										'+settings.share_label+' \
									</div> \
								</div> \
							</div>').css({
					'width': $(_self).width() + (settings.hover_padding+8)*2,
					'top': $(_self).position().top - settings.hover_padding-8 + parseFloat($(_self).css('marginTop')) + offsetTop,
					'left': $(_self).position().left - settings.hover_padding-8 + parseFloat($(_self).css('marginLeft')) + offsetLeft
				}).hide().insertAfter(_container).fadeIn(settings.animationSpeed);
				
				$('#ps_title').animate({top:-15},settings.animationSpeed);
				
				$(ps_hover).find('>.ps_bd .ps_s').height($(_self).height() + settings.hover_padding*2);
				
				// Fix for IE6
				fixCrappyBrowser('ps_hover',this);

				// Drag action!
				DragHandler.attach($(this)[0]);
			
				$(this)[0].dragBegin = function(e){
					_self = this; // scoping

					show_timer = window.setTimeout(function(){
						// Hide all flashes
						$('object,embed').css('visibility','hidden');
						
						$(_self).animate({'opacity':0},settings.animationSpeed);

						$(ps_hover).remove();

						// Build the overlay
						overlay.show();

						// Build the tooltip
						tooltip.show(_self);
						tooltip.follow(e.mouseX,e.mouseY);

						// Display the sharing icons
						sharing.show();
					},200);
				};
				
				$(this)[0].drag = function(e){
					tooltip.follow(e.mouseX,e.mouseY);
				}

				$(this)[0].dragEnd = function(element,x,y){
					// Show all flashes
					$('object,embed').css('visibility','visible');
					
					// Reposition it where it belongs
					$(this).attr('style',0);
					
					overlay.hide();
					
					tooltip.checkCollision(element.mouseX,element.mouseY);
				};
			},function(){ // OUT
				$(ps_hover).fadeOut(settings.animationSpeed,function(){ $(this).remove() });
			}).click(function(){
				clearTimeout(show_timer);
			});

			/* ------------------------------------------------------------------------
				Class: tooltip
				Description: Displays the tooltip on drag.
			------------------------------------------------------------------------- */
			var tooltip = {
				show : function(caller){
					// Save the link to share
					tooltip.link_to_share = ($(caller).attr('href') != "#") ? $(caller).attr('href') : location.href;

					// If we want to use Bit.ly to shorten our url :
					if (settings.urlshortener.bitly.active) {
						if (window.BitlyCB) {
							BitlyCB.myShortenCallback = function(data) {
								var result;
								for (var r in data.results) {
									result = data.results[r];
									result['longUrl'] = r;
									break;
								};
								tooltip.link_to_share = result['shortUrl']; // update the url variable
							};

							BitlyClient.shorten(tooltip.link_to_share, 'BitlyCB.myShortenCallback'); // Overwrite the link with the shortened one
						};
					};
					attributes = $(caller).attr('rel').split(';');
					// Rebuild as an array
					for (var i=1; i < attributes.length; i++) {
						attributes[i] = attributes[i].split(':');
					};

					// If no defined title, take the page title
					desc = ($('meta[name=Description]').attr('content')) ? $('meta[name=Description]').attr('content') : "";
					if(attributes.length==1) {
						attributes[1] = ['title',document.title];
						attributes[2] = ['excerpt',desc];
					}

					ps_tooltip = $('<div id="ps_tooltip"> \
									<div class="ps_hd"> \
										<div class="ps_c"></div> \
									</div> \
									<div class="ps_bd"> \
										<div class="ps_c"> \
											<div class="ps_s"> \
											</div> \
										</div> \
									</div> \
									<div class="ps_ft"> \
										<div class="ps_c"></div> \
									</div> \
					   			 </div>').appendTo('body');


					$(ps_tooltip).find('.ps_s').html("<p><strong>" + attributes[1][1] + "</strong><br />" + attributes[2][1]+"</p>");
					
					// Fix for IE6
					fixCrappyBrowser('ps_tooltip');
				},
				checkCollision : function(x,y){
					collision = "";
					scrollPos = _getScroll();
					$.each(websites,function(i){
						// If the mouse is inside one of the websites, save the object to trigger the share
						if((x + scrollPos.scrollLeft  > $(this).offset().left && x + scrollPos.scrollLeft < $(this).offset().left + $(this).width()) && (y + scrollPos.scrollTop > $(this).offset().top && y + scrollPos.scrollTop < $(this).offset().top + $(this).height())){
							collision = $(this).find('a');
						}
					});

					if(collision != "") {
						$(collision).click();
					}

					sharing.hide();
					$('#ps_tooltip').remove();
				},
				follow : function(x,y){
					scrollPos = _getScroll();
					
					settings.tooltip.offsetTop = (settings.tooltip.offsetTop) ? settings.tooltip.offsetTop : 0;
					settings.tooltip.offsetLeft = (settings.tooltip.offsetLeft) ? settings.tooltip.offsetLeft : 0;
					$('#ps_tooltip').css({
						'top': y + settings.tooltip.offsetTop + scrollPos.scrollTop,
						'left': x + settings.tooltip.offsetLeft + scrollPos.scrollLeft
					});
				}
			}



			/* ------------------------------------------------------------------------
				Class: Sharing
				Description: Display the websites icons
			------------------------------------------------------------------------- */
			var sharing = {
				show : function(){
					// Build the websites links
					websites_container = $('<ul />');
					$.each(settings.websites,function(i){
						var	_self = this; // Scoping
						
						if (_self.active) {
							// Build the link
							link = $('<a />')
							.attr({
								'href':'#'
							})
							.html('<img src="'+_self.icon+'" alt="' + _self.title + '" width="'+_self.sizes.width+'" height="'+_self.sizes.height+'" />')
							.hover(function(){
								sharing.showTitle(_self.title,$(this).width(),$(this).position().left,$(this).height(),$(this).position().top);
							},function(){
								sharing.hideTitle();
							})
							.click(function(){
								// Open the popup
								shareURL = (_self.encode) ? encodeURIComponent(tooltip.link_to_share) : tooltip.link_to_share;
								
								popup = window.open(_self.url+shareURL,"prettySociable","location=0,status=0,scrollbars=1,width="+settings.popup.width+",height="+settings.popup.height);
							});
							
							// Put in ion a list item then append it to the container
							$('<li>').append(link)
							.appendTo(websites_container);
						};
					});

					// Append it!
					$('<div id="ps_websites"><p class="ps_label"></p></div>').append(websites_container).appendTo('body');
					
					// Fix for IE6
					fixCrappyBrowser('ps_websites');
					
					scrollPos = _getScroll();
					
					// Center it
					$('#ps_websites').css({
						'top': $(window).height() / 2 - $('#ps_websites').height() / 2 + scrollPos.scrollTop,
						'left': $(window).width() / 2 - $('#ps_websites').width() / 2 + scrollPos.scrollLeft
					});
					
					// Save the websites in an array (used to check the collision)
					websites = $.makeArray($('#ps_websites li'));
				},
				hide : function(){
					$('#ps_websites').fadeOut(settings.animationSpeed,function(){ $(this).remove() });
				},
				showTitle : function(title,width,left,height,top){
					$label = $('#ps_websites .ps_label');
					
					// Put the text in
					$label.text(settings.share_on_label + title)
					
					// Position it
					$label
					.css({
							'left':left - $label.width() / 2 + width / 2,
							'opacity':0,
							'display':'block'
						})
					.stop().animate({
							'opacity' : 1,
							'top' : top - height + 45
						},settings.animationSpeed);
				},
				hideTitle : function(){
					// Position the label
					$('#ps_websites .ps_label')
					.stop().animate({
							'opacity' : 0,
							'top' : 10
						},settings.animationSpeed);
				}
			};



			/* ------------------------------------------------------------------------
				Class: overlay
				Description: Displays the darken overlay on drag
			------------------------------------------------------------------------- */
			var overlay = {
				show : function(){
					$('<div id="ps_overlay" />').css('opacity',0).appendTo('body').height($(document).height()).fadeTo(settings.animationSpeed,settings.opacity);
				},
				hide : function(){
					$('#ps_overlay').fadeOut(settings.animationSpeed,function(){ $(this).remove(); });
				}
			}



			/* ------------------------------------------------------------------------
				Class: DragHandler
				Description: Used to ... drag.
			------------------------------------------------------------------------- */
			var DragHandler = {
				// private property.
				_oElem : null,

				// public method. Attach drag handler to an element.
				attach : function(oElem) {
					oElem.onmousedown = DragHandler._dragBegin;

					// callbacks
					oElem.dragBegin = new Function();
					oElem.drag = new Function();
					oElem.dragEnd = new Function();

					return oElem;
				},

				// private method. Begin drag process.
				_dragBegin : function(e) {
					var oElem = DragHandler._oElem = this;

					if (isNaN(parseInt(oElem.style.left))) { oElem.style.left = '0px'; }
					if (isNaN(parseInt(oElem.style.top))) { oElem.style.top = '0px'; }

					var x = parseInt(oElem.style.left);
					var y = parseInt(oElem.style.top);

					e = e ? e : window.event;
					oElem.mouseX = e.clientX;
					oElem.mouseY = e.clientY;

					oElem.dragBegin(oElem, x, y);

					document.onmousemove = DragHandler._drag;
					document.onmouseup = DragHandler._dragEnd;
					
					return false;
				},

				// private method. Drag (move) element.
				_drag : function(e) {
					var oElem = DragHandler._oElem;

					var x = parseInt(oElem.style.left);
					var y = parseInt(oElem.style.top);

					e = e ? e : window.event;
					oElem.style.left = x + (e.clientX - oElem.mouseX) + 'px';
					oElem.style.top = y + (e.clientY - oElem.mouseY) + 'px';

					oElem.mouseX = e.clientX;
					oElem.mouseY = e.clientY;

					oElem.drag(oElem, x, y);

					return false;
				},

				// private method. Stop drag process.
				_dragEnd : function() {
					var oElem = DragHandler._oElem;

					var x = parseInt(oElem.style.left);
					var y = parseInt(oElem.style.top);

					oElem.dragEnd(oElem, x, y);

					document.onmousemove = null;
					document.onmouseup = null;
					DragHandler._oElem = null;
				}
			};
			
			/* ------------------------------------------------------------------------
				Function: _getScroll
				Return: The scroll position as json
			------------------------------------------------------------------------- */
			
			function _getScroll(){
				if (self.pageYOffset) {
					scrollTop = self.pageYOffset;
					scrollLeft = self.pageXOffset;
				} else if (document.documentElement && document.documentElement.scrollTop) { // Explorer 6 Strict
					scrollTop = document.documentElement.scrollTop;
					scrollLeft = document.documentElement.scrollLeft;
				} else if (document.body) {// all other Explorers
					scrollTop = document.body.scrollTop;
					scrollLeft = document.body.scrollLeft;	
				}

				return {scrollTop:scrollTop,scrollLeft:scrollLeft};
			};
			
			/* ------------------------------------------------------------------------
				Function: fixCrappyBrowser
				Description: PNG Fix.
			------------------------------------------------------------------------- */
			
			function fixCrappyBrowser(element,caller) {
				if($.browser.msie && $.browser.version == 6) {
					if(typeof DD_belatedPNG != 'undefined'){
						if(element == 'ps_websites'){
							$('#'+element+' img').each(function(){
								DD_belatedPNG.fixPng($(this)[0]);
							});
						}else{
							DD_belatedPNG.fixPng($('#'+element+' .ps_hd .ps_c')[0]);
							DD_belatedPNG.fixPng($('#'+element+' .ps_hd')[0]);
							DD_belatedPNG.fixPng($('#'+element+' .ps_bd .ps_c')[0]);
							DD_belatedPNG.fixPng($('#'+element+' .ps_bd')[0]);
							DD_belatedPNG.fixPng($('#'+element+' .ps_ft .ps_c')[0]);
							DD_belatedPNG.fixPng($('#'+element+' .ps_ft')[0]);
						}
					};
				};
			}
			
		};
	})(jQuery);