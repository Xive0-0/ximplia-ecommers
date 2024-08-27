if ((typeof Range !== 'undefined') && !Range.prototype.createContextualFragment) {
    Range.prototype.createContextualFragment = function(html) {
        var frag = document.createDocumentFragment(),
        div = document.createElement('div');
        frag.appendChild(div);
        div.outerHTML = html;
        return frag;
    };
}

var GoogleMap = {
	_load: false,
	_init: false,
	_list: [],
	add: function(callback) {
		if (this._init) {
			callback();
		}
		else {
			this._list.push(callback);
			this.load();
		}
	},
	init: function() {
		if (this._init) {
			return;
		}
		this._init = true;
		for (var i = 0; i < this._list.length; i++) {
			this._list[i]();
		}
		this._list = [];
	},
	load: function() {
		if (this._load) {
			return;
		}
		this._load = true;
		var scriptMap = document.createElement("script");
		scriptMap.setAttribute('type', 'text/javascript');
		scriptMap.setAttribute('async', true);
		scriptMap.setAttribute('src', 'https://maps.googleapis.com/maps/api/js?key=' + H.config.google_maps_geocoder_api_key_client + '&callback=initGoogleMap');
		document.body.appendChild(scriptMap);
	}
}

function initGoogleMap() {
	GoogleMap.init();
}

(function( $ ){	
	$.fn.googleMapPicker = function() {
		$(this).each(function() {
			var indirizzoField = $(this).data('indirizzo').split(',');
			var map = $(this).find('.map-google');
			var lat = $(this).find('input[name="latitudine"]').val();
			var lng = $(this).find('input[name="longitudine"]').val();
			var zoom = 13;
			var $this = $(this);
			if (lat == '' || lng == '') {
				lat = 41.9099528;
				lng = 12.3708478;
				zoom = 6;
			}
			else {
				lat = parseFloat(lat);
				lng = parseFloat(lng);				
			}
			
			GoogleMap.add(function() {
				function updatePosition(lat, lng) {
					lat = parseFloat(lat);
					lng = parseFloat(lng);
					map.setCenter({lat: lat, lng: lng});
					marker.setPosition({lat: lat, lng: lng});
					if (zoom < 13) {
						map.setZoom(13);
					}
					$this.find('input[name="latitudine"]').val(lat);
					$this.find('input[name="longitudine"]').val(lng);
				}
				
				map = new google.maps.Map(map.get(0), {
					zoom: zoom,
					center: {lat: lat, lng: lng}
				});
				var marker = new google.maps.Marker({
					position: {
						lat: lat,
						lng: lng
					},
					map: map,
					animation: google.maps.Animation.DROP,
					draggable: true
				});
				
				google.maps.event.addListener(marker, 'dragend', function() {
					updatePosition(this.getPosition().lat(), this.getPosition().lng());
				});
				
				$this.find('.google-wrapper-picker-update').on('click', function() {
					var address = [];
					$.each(indirizzoField, function(i, field) {
						address.push($this.find('input[name="' + field + '"]').val());
					});
					H.ajax('/manager/myarea/geocoder', {
						data: {
							address: address.join(', ')
						},
						success: function (data) {
							if (data.result) {
								updatePosition(data.result.lat, data.result.lng);
							}
							else {
								$('body').message({message: 'Posizione non rilevata', type: 'error'});
							}
						}
					});				
				});
			});			
		});
	};
	
	$.fn.serializeObject = function() {
		var o = {};
		var a = this.serializeArray();
		$.each(a, function() {
			if (o[this.name] !== undefined) {
				if (this.value != null && this.value != '') {
					if (!o[this.name].push) {
						o[this.name] = [o[this.name]];
					}
					o[this.name].push(this.value || '');
				}
			} else {
				if (this.value != null && this.value != '') {
					o[this.name] = this.value || '';
				}
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
			var obj = $.parseJSON(attr);
			obj = obj == null ? {} : obj;
			var lang = $(this).attr('data-params-lang');
			if (lang != null && lang != '') {
				if (obj.window) {
					obj.window.params = obj.window.params == null ? {} : obj.window.params;
					obj.window.params.lang = lang;
				}
				else {
					obj.params = obj.params == null ? {} : obj.params;
					obj.params.lang = lang;	
				}
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
	
	$.fn.inlineSvg = function() {
		$(this).find('img[src$=".svg"]').each(function(){
			var $img = $(this);
			var imgAlttext = $img.attr('data-alttext');
			var imgAction = $img.attr('data-action');
			var imgID = $img.attr('id');
			var imgClass = $img.attr('class');
			var imgURL = $img.attr('src');

			$.get(imgURL, function(data) {
				var $svg = $(data).find('svg');
				if(typeof imgID !== 'undefined') {
					$svg = $svg.attr('id', imgID);
				}
				if(typeof imgAlttext !== 'undefined') {
					$svg.attr('data-alttext', imgAlttext);
				}
				if(typeof imgAction !== 'undefined') {
					$svg.attr('data-action', imgAction);
				}
				if(typeof imgClass !== 'undefined') {
					$svg = $svg.attr('class', imgClass+' replaced-svg');
				}
				$svg = $svg.removeAttr('xmlns:a');
				$img.replaceWith($svg);
			}, 'xml');
		});
	};
})( jQuery );

var H = {
	validator: [],
	callback: [],
	countAjax: 0,
	countId: 0,
	id: function() {
		return 'h_unique_id_' + (H.countId++);
	},
	cookie: {
		set: function(cname, cvalue, exdays) {
			var d = new Date();
			d.setTime(d.getTime() + (exdays*24*60*60*1000));
			var expires = "expires="+d.toUTCString();
			document.cookie = cname + "=" + cvalue + "; " + expires + "; path=/";
		},
		get: function(cname) {
			var name = cname + "=";
			var ca = document.cookie.split(';');
			for(var i=0; i<ca.length; i++) {
				var c = ca[i];
				while (c.charAt(0)==' ') c = c.substring(1);
				if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
			}
			return "";
		}
	},
	ajax: function(url, opt) {
		opt = opt == null ? {} : opt;
		if (url.indexOf('?') < 0) {
			url += '?';
		}
		else {
			url += '&';
		}
		opt.url = url + '_hjson=' + (H.countAjax++);
		opt.type = 'post';
		opt.contenttype = opt.contenttype == null ? 'application/json; charset=utf-8' : opt.contenttype ;
		opt.dataType = opt.dataType == null ? 'json' : opt.dataType;
		if (opt.dataType == 'json' && opt.success) {
			var callback_success = opt.success;
			opt.success = function(resp) {
				resp = resp ? resp : {};
				if (resp.data) {
					$.each(resp.data, function(k, v) {
						resp[k] = v;
					});
				}
				callback_success(resp);
			};
		}
		$.ajax(opt);
	}
};

H.config = {};

H.Utility = {
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
			new_val.push(H.Utility.normalizza_carattere(val.charAt(i)));
		}
		return H.Utility.trim(new_val.join(''));
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
	            return sParameterName[1];
	        }
	    }
		return null;	
	}
};