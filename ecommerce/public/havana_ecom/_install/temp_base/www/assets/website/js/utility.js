function _ga(arg1, arg2, arg3, arg4, arg5) {
	try {
		if (typeof ga !== 'undefined') {
			ga(arg1, arg2, arg3, arg4, arg5);
		}
	}
	catch(e) {}	
	
	try {
		if (typeof fbq !== 'undefined') { 
			fbq('track', arg4);
		}
	}
	catch(e) {}
	
	try {
		if (typeof pintrk !== 'undefined') { 
			pintrk('track', arg4);
		}
	}
	catch(e) {}
	
	try {
		if (typeof gtag !== 'undefined') { 
			if (arg3 == 'registrati') {
				arg3 = 'sign_up';
			}
			gtag('event', arg3);
		}
	}
	catch(e) {}
}

var Utility = {
	normalizza_carattere: function(val) {
		switch(val) {
		case 'a':
		case 'b':
		case 'c':
		case 'd':
		case 'e':
		case 'f':
		case 'g':
		case 'h':
		case 'i':
		case 'l':
		case 'm':
		case 'n':
		case 'o':
		case 'p':
		case 'q':
		case 'r':
		case 's':
		case 't':
		case 'u':
		case 'v':
		case 'z':
		case 'x':
		case 'w':
		case 'j':
		case 'k':
		case 'y':
		case ' ':
		case '0':
		case '1':
		case '2':
		case '3':
		case '4':
		case '5':
		case '6':
		case '7':
		case '8':
		case '9':
			return val;
		case 'ì':
			return 'i';
		case 'é':
		case 'è':
			return 'e';
		case 'à':
			return 'a';
		case 'ò':
			return 'o';
		case 'ù':
			return 'u';
		default:
			return ' ';
		}
	},
	normalizza: function(val) {
		if (val == '') {
			return '';
		}
		val = val.toLowerCase();
		var new_val = [];
		var v = '';
		for (var i = 0; i < val.length; i++) {
			new_val.push(Utility.normalizza_carattere(val.charAt(i)));
		}
		return Utility.trim(new_val.join(''));
	},
	isMobile: function() {
		var isMobile = false;
		if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
			|| /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) {
			isMobile = true;
		}
		return isMobile;
	},
	setCookie: function(cname, cvalue, exdays) {
		var d = new Date();
		d.setTime(d.getTime() + (exdays*24*60*60*1000));
		var expires = "expires="+d.toUTCString();
		document.cookie = cname + "=" + cvalue + "; " + expires + "; path=/";
	},
	getCookie: function(cname) {
		var name = cname + "=";
		var ca = document.cookie.split(';');
		for(var i=0; i<ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1);
			if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
		}
		return "";
	},
	trim: function(value) {
		if (value == null || value.length == 0) {
			return '';
		}
		return value.replace(/\s+$|^\s+/g, '');
	},
	getURLParameter: function(sParam) {
	    var sPageURL = window.location.search.substring(1);
	    var sURLVariables = sPageURL.split('&');
	    for (var i = 0; i < sURLVariables.length; i++) {
	        var sParameterName = sURLVariables[i].split('=');
	        if (sParameterName[0] == sParam) {
	            return decodeURIComponent(sParameterName[1]);
	        }
	    }
		return null;	
	},
	confirm: function(text) {
		if ($('body').data('device') == 'app') {
			return true;
		}
		else {
			return confirm(text);
		}
	},
	alert: function(text, onConfirm) {
		if ($('body').data('device') == 'app') {
			AppProxy.alert({testo: text});
		}
		else {
			alert(text);
		}
		onConfirm();
	},
	location: {
		getHash: function() {
			return location.hash.replace('#', '');
		},
		resetHash: function() {
			Utility.location.setHash('');
		},
		setHash: function(value) {
			location.hash = value;	
		}
	},
	checkSubmit: function() {
		var a = Math.floor(Math.random() * 1000);
		var c = Math.floor(Math.random() * 1000);
		var b = a + c;
		var e = (a - c) * 100;
		var d = ([('' + a), ('' + b), ('' + c), ('' + e)].join('')).length;
		return {
			a: a,
			b: b,
			c: c,
			d: d,
			e: e
		}
	}
};

var Loading = {
	show: function() {
		$('body').addClass('loading');
	},
	hide: function() {
		if ($('.no-hide-loading').length > 0) {
			return;
		}
		$('body').removeClass('loading');
	}
};

(function( $ ){	
	function urlEventTracker(url) {
		if (!url || typeof Params === 'undefined') {
			return;
		}
		url = url.toLowerCase();
		if (url.charAt(0) != '/') {
			url = '/' + url;
		}
		if (url.indexOf('/' + Params.url_lang + '/') == 0) {
			url = url.substr(3);
		}
		var i = url.indexOf('?');
		if (i > 0) {
			url = url.substr(0, i);
		}
		var i = url.indexOf('.php');
		if (i > 0) {
			url = url.substr(0, i);
		}
		switch(url) {
		case '/account/ex-newsletter':
			gtag('event', 'sign_up_newsletter');
			break;
		case '/account/ex-avvisa-prodotto-disponibile':
			var data = {};
			$('.gtag-track-field').each(function() {
				data[$(this).attr('name')] = $(this).val();
			});
			gtag('event', 'request_product', data);
			break;
		case '/ex-scrivi-collezione':
		case '/ex-scrivi-landing-page':
		case '/ex-scrivi-page':
			gtag('event', 'generate_lead');
			break;
		}
	}

	$.countId = 0;
	$.xajax = function(url, opt) {
		opt = opt == null ? {} : opt;
		if (url.indexOf('?') > 0) {
			url += '&';
		}
		else {
			url += '?';
		}
		
		var check = Utility.checkSubmit();
		opt.data = opt.data ? opt.data : {};
		opt.data.__a = check.a;
		opt.data.__b = check.b;
		opt.data.__c = check.c;
		opt.data.__d = check.d;
		opt.data.__e = check.e;
		
		opt.url = url + '_hjson=' + ($.countId++);
		opt.type = 'post';
		opt.contenttype = 'application/json; charset=utf-8';
		opt.dataType = opt.dataType == null ? 'json' : opt.dataType;
		
		var callback_success = opt.success;
		if (opt.dataType == 'json' && callback_success) {
			opt.success = function(resp) {
				urlEventTracker(url);
				resp = resp ? resp : {};
				if (resp.data) {
					$.each(resp.data, function(k, v) {
						resp[k] = v;
					});
				}
				callback_success(resp);
			};
		}
		else {
			opt.success = function(resp) {
				urlEventTracker(url);
				if (callback_success) {
					callback_success(resp);
				}
			}
		}
		$.ajax(opt);
	};

	$.fn.serializeObject = function() {
		var o = {};
		var a = this.serializeArray();
		$.each(a, function() {
			if (o[this.name] !== undefined) {
				if (!o[this.name].push) {
					o[this.name] = [o[this.name]];
				}
				o[this.name].push(this.value || '');
			} else {
				o[this.name] = this.value || '';
			}
		});
		return o;
	};
	$.fn.actionParams = function(name, params, update) {
		name = name == null ? 'data-action' : name;
		if (params == null) {
			var attr = $(this).attr(name);
			if (attr == null || attr == '') {
				return {};
			}
			var obj = null;
			try {
				obj = $.parseJSON(attr);
			}
			catch(e) {
				alert(e + '\n\n' + attr);
			}
			if (obj == null) {
				return {};
			}
			return obj;
		}
		else {
			update = update == null ? false : update;
			if (update) {
				var old = $(this).actionParams(name);
				params = $.extend(old, params);
			}
			$(this).attr(name, JSON.stringify(params));
			return params;
		}
	};
	$.fn.message = function(params, timeout, bottomOnMobile) {
		if (typeof params === 'string') {
			params = {message: params};
		}
		bottomOnMobile = bottomOnMobile == null ? false : bottomOnMobile;
		var wrapper = $('<div class="message-wrapper"><div class="message-wrapper-inner">' + params.message + '</div></div>');

		wrapper.addClass('message-wrapper-' + (params.type == null ? 'confirm' : params.type));
		if (bottomOnMobile && $(window).width() <= 650 || Params.force_message_position == 'bottom') {
			wrapper.css({bottom: -wrapper.outerHeight()});
			wrapper.animate({
					bottom: parseInt(wrapper.css('top'),10) == 0 ? -wrapper.outerHeight() : 0
				}, 300);			
		}
		else {
			wrapper.css({top: -wrapper.outerHeight()});
			wrapper.animate({
					top: parseInt(wrapper.css('top'),10) == 0 ? -wrapper.outerHeight() : 0
				}, 300);
		}
			
		wrapper.click(function () {
			wrapper.fadeOut(300, function() {
				$(this).remove();
			});
		});
		timeout = timeout == null ? 8 : timeout;
		setTimeout(function() {
			wrapper.click();
		}, timeout * 1000);
		
		$(this).append(wrapper);
	};
	$.fn.center = function (obj, type) {
		var loc = obj.offset();
		if (loc == null) {
			var top = $(window).height() / 2;
			var left = $(window).width() / 2;
		}
		
		else {
			switch(type.x) {
			case 'right':
				var left = loc.left + obj.outerWidth() - $(this).outerWidth();
				break;
			case 'left':
				var left = loc.left;
				break;
			default:
				var left = obj.outerWidth()/ 2 + loc.left - $(this).outerWidth()/2;
				break;
			}
			switch(type.y) {
			case 'top':
				var top = loc.top;
				break;
			case 'bottom':
				var top = loc.top + obj.outerHeight() - $(this).outerHeight();
				break;
			default:
				var top = obj.outerHeight()/ 2 - $(this).outerHeight()/2  + loc.top;
				break;
			}
		}
		if (left < 0) {
			left = 0;
		}
		if (top < 0) {
			top = 0;
		}
		$(this).css({top: top + 'px', left: left + 'px'});
		return $(this);
	};
	$.fn.centerBottom = function (obj) {
		var loc = obj.offset();
		$(this).css('top',(obj.outerHeight() + loc.top) + 'px');
		$(this).css('left',(loc.left + obj.outerWidth()/2 - $(this).outerWidth()/2) + 'px');
		return $(this);
	};
})( jQuery );