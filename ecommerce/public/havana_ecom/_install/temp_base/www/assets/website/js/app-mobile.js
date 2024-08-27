function j_event(callback, parametro) {
	AppProxy.event.fire(callback, parametro);
}

var VoidProxy = {
	getType: function() {
		return '-';
	},
	titolo: function(titolo) {
	},
	download: function(opt) {
	},
	versione: function(callback) {
	},
	token: function(callback) {
	},
	login: function(parametro) {
	},
	registrati: function(parametro) {
	},
	alert: function(opt) {
	},
	confirm: function(opt) {
	},
	action: function(opt) {
	},
	loading: function(show) {
	},
	reset: function(sessionid) {
	},
	reload: function() {
	},
	image: function(opt) {
	},
	gallery: function(opt) {
	},
	qrcode: function(opt) {
	},
	link: function(url) {
	},
	email: function(opt) {
	},
	phone: function(numero) {
	},
	share: function(url) {
	},
	logout: function() {
	},
	position: function(callback) {
	},
	go_to: function(indirizzo) {
	},
	carrello: function(numero) {
	}
};

var WebProxy = {
	getType: function() {
		return 'web';
	},
	titolo: function(titolo) {
	},
	download: function(opt) {
	},
	versione: function(callback) {
		j_event(callback, 'web');
	},
	token: function(callback) {
	},
	login: function(parametro) {
		location.href = '/_app/account/login';
	},
	registrati: function(parametro) {
		location.href = '/_app/account/registrati';
	},
	alert: function(opt) {
		alert(opt.testo);
	},
	confirm: function(opt) {
	},
	action: function(opt) {
	},
	loading: function(show) {
		if (show) {
			Loading.show();
		}
		else {
			Loading.hide();
		}
	},
	reset: function(sessionid) {
	},
	reload: function() {
		location.reload();
	},
	image: function(opt) {
	},
	gallery: function(opt) {
	},
	qrcode: function(opt) {
		var _play = true;
		$('#canvas').remove();
		var cont = $('.qrcode-camera-content').html('');

		cont.append('<div class="camera-content-loading-message" style="font-weight: bold; margin-bottom 20px; color: #fe2b2b;">🎥 Impossibile accedere alla telecamera, verificare l\'abilitazione dei permessi</div>');
		cont.append('<div style="width: 100%; height: 350px; overflow: hidden; margin: auto;"><canvas id="canvas" hidden></canvas></div>');
		var video = document.createElement("video");
		var canvasElement = document.getElementById("canvas");
		var canvas = canvasElement.getContext("2d");

		function drawLine(begin, end, color) {
			canvas.beginPath();
			canvas.moveTo(begin.x, begin.y);
			canvas.lineTo(end.x, end.y);
			canvas.lineWidth = 4;
			canvas.strokeStyle = color;
			canvas.stroke();
		}
		var _requestID = null;
		
		navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(function(stream) {
			video.srcObject = stream;
			video.setAttribute("playsinline", true); 
			video.play();
			_requestID = requestAnimationFrame(tick);
		});

		function tick() {
			if (!_play) {
				return;
			}
			$('.camera-content-loading-message').html('⌛ Caricamento video...')
			if (video.readyState === video.HAVE_ENOUGH_DATA) {
				$('.camera-content-loading-message').remove();
				canvasElement.hidden = false;

				canvasElement.height = video.videoHeight;
				canvasElement.width = video.videoWidth;
				canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
				var imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
				var code = jsQR(imageData.data, imageData.width, imageData.height, {
					inversionAttempts: "dontInvert",
				});
				if (code) {
					drawLine(code.location.topLeftCorner, code.location.topRightCorner, "#FF3B58");
					drawLine(code.location.topRightCorner, code.location.bottomRightCorner, "#FF3B58");
					drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, "#FF3B58");
					drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, "#FF3B58");
					if (code.data && code.data.length > 10) {
						cancelAnimationFrame(_requestID);
						_play = false;
						video.remove();
						video = null;
						$('.qrcode-camera-content').html('');
						j_event(opt.callback, opt.prefisso + code.data);
					}
				}
			}
			_requestID = requestAnimationFrame(tick);
		}
	},
	link: function(url) {
	},
	email: function(opt) {
	},
	phone: function(numero) {
	},
	share: function(url) {
	},
	logout: function() {
		location.href = '/_app/account/logout';
	},
	position: function(callback) {
	},
	go_to: function(indirizzo) {
	},
	carrello: function(numero) {
		$('.appweb-carrello').attr('data-numero', numero);
		$('.appweb-carrello span').html(numero);
	}
};

var AndroidProxy = {
	getType: function() {
		return 'android';
	},
	titolo: function(titolo) {
	},
	download: function(opt) {
		app.download(opt.url, opt.check_session);
	},
	versione: function(callback) {
		app.versione(callback);
	},
	token: function(callback) {
		app.token(callback);
	},
	login: function(parametro) {
		app.login(parametro);
	},
	registrati: function(parametro) {
		app.registrati(parametro);
	},
	alert: function(opt) {
		app.alert(opt.titolo, opt.testo);
	},
	confirm: function(opt) {
		app.confirm(opt.titolo, opt.testo, opt.callback_si, opt.callback_no);
	},
	action: function(opt) {
		app.action(opt.titolo, opt.testo, JSON.stringify(opt.lista));
	},
	loading: function(show) {
		app.loading(show);
	},
	reset: function(sessionid) {
		app.reset(sessionid);
	},
	reload: function() {
		app.reload();
	},
	image: function(opt) {
		app.image(opt.url, opt.check_session, opt.titolo);
	},
	gallery: function(opt) {
		app.gallery(JSON.stringify(opt.lista), opt.check_session, opt.titolo);
	},
	qrcode: function(opt) {
		app.qrcode(opt.prefisso, opt.callback, opt.titolo);
	},
	link: function(url) {
		app.link(url);
	},
	email: function(opt) {
		app.email(opt.e_mail, opt.oggetto);
	},
	phone: function(numero) {
		app.phone(numero);
	},
	share: function(url) {
		app.share(url);
	},
	logout: function() {
		app.logout();
	},
	position: function(callback) {
		app.position(callback);
	},
	go_to: function(indirizzo) {
		app.go_to(indirizzo);
	},
	carrello: function(numero) {
		app.carrello(numero);
	}
};

var IosProxy = {
	getType: function() {
		return 'ios';
	},
	titolo: function(titolo) {
		window.webkit.messageHandlers.titolo.postMessage(titolo);
	},
	download: function(opt) {
		window.webkit.messageHandlers.download.postMessage(opt);
	},
	versione: function(callback) {
		window.webkit.messageHandlers.versione.postMessage(callback);
	},
	token: function(callback) {
		window.webkit.messageHandlers.token.postMessage(callback);
	},
	login: function(parametro) {
		window.webkit.messageHandlers.login.postMessage(parametro);
	},
	registrati: function(parametro) {
		window.webkit.messageHandlers.registrati.postMessage(parametro);
	},
	alert: function(opt) {
		window.webkit.messageHandlers.alert.postMessage(opt);
	},
	confirm: function(opt) {
		window.webkit.messageHandlers.confirm.postMessage(opt);
	},
	action: function(opt) {
		opt.lista = JSON.stringify(opt.lista);
		window.webkit.messageHandlers.action.postMessage(opt);
	},
	loading: function(show) {
		window.webkit.messageHandlers.loading.postMessage(show);
	},
	reset: function(sessionid) {
		window.webkit.messageHandlers.reset.postMessage(sessionid);
	},
	reload: function() {
		window.webkit.messageHandlers.reload.postMessage(null);
	},
	image: function(opt) {
		window.webkit.messageHandlers.image.postMessage(opt);
	},
	gallery: function(opt) {
		opt.lista = JSON.stringify(opt.lista);
		window.webkit.messageHandlers.gallery.postMessage(opt);
	},
	qrcode: function(opt) {
		window.webkit.messageHandlers.qrcode.postMessage(opt);
	},
	link: function(url) {
		window.webkit.messageHandlers.link.postMessage(url);
	},
	email: function(opt) {
		window.webkit.messageHandlers.email.postMessage(opt);
	},
	phone: function(numero) {
		window.webkit.messageHandlers.phone.postMessage(numero);
	},
	share: function(url) {
		window.webkit.messageHandlers.share.postMessage(url);
	},
	logout: function() {
		window.webkit.messageHandlers.logout.postMessage(null);
	},
	position: function(callback) {
		window.webkit.messageHandlers.position.postMessage(callback);
	},
	go_to: function(indirizzo) {
		window.webkit.messageHandlers.go_to.postMessage(indirizzo);
	},
	carrello: function(numero) {
		window.webkit.messageHandlers.carrello.postMessage(numero);
	}
};

var AppProxy = {
	init: function() {
		switch (Params.app) {
		case 'web':
			this.proxy = WebProxy;
			break;
		case 'app':
			var userAgent = window.navigator.userAgent.toLowerCase(),
				ios = /iphone|ipod|ipad/.test(userAgent);
			if (ios) {
				this.proxy = IosProxy;
			}
			else {
				this.proxy = AndroidProxy;
			}
			break;
		default:
			this.proxy = VoidProxy;
		}
	},
	event: {
		_catchAll: false,
		fire: function(callback, parametro) {
			if (callback == null || callback == '') {
				return;
			}
			if (this._catchAll) {
				$('body').trigger('j_event:-', [parametro, callback]);
			}
			$('body').trigger('j_event:' + callback, [parametro]);
		},
		on: function(callback, action) {
			if (!this._catchAll && callback == '-') {
				this._catchAll = true;
			}
			$('body').on('j_event:' + callback, function(e, parametro, parametro2) {
				action(parametro, parametro2);
			});
		},
		off: function(callback) {
			$('body').off('j_event:' + callback);
		}
	},
	getType: function() {
		return this.proxy.getType();
	},
	titolo: function(titolo) {		
		titolo = titolo == null ? '' : titolo;
		this.proxy.titolo(titolo);
	},
	download: function(opt) {
		var estensione = opt.url.toLowerCase().split('.');
		estensione = estensione[estensione.length - 1];
		switch(estensione) {
		case 'pdf':
			opt.tipo = 'pdf';
			break;
		case 'jpg':
		case 'jpeg':
		case 'gif':
		case 'png':
			opt.tipo = 'image';
			break;
		case 'mp4':
			opt.tipo = 'video';
			break;
		default:
			opt.tipo = '';
			break;
		}
		this.proxy.download(opt);
	},
	versione: function(callback) {
		this.proxy.versione(callback);
	},
	token: function(callback) {
		this.proxy.token(callback);
	},
	login: function(parametro) {
		parametro = parametro == null ? '' : parametro;
		this.proxy.login(parametro);
	},
	registrati: function(parametro) {
		parametro = parametro == null ? '' : parametro;
		this.proxy.registrati(parametro);
	},
	alert: function(opt) {
		opt.titolo = opt.titolo == null ? '' : opt.titolo;
		opt.testo = opt.testo == null ? '' : opt.testo;
		this.proxy.alert(opt);
	},
	confirm: function(opt) {
		opt.titolo = opt.titolo == null ? '' : opt.titolo;
		opt.testo = opt.testo == null ? '' : opt.testo;
		opt.callback_si = opt.callback_si == null ? '' : opt.callback_si;
		opt.callback_no = opt.callback_no == null ? '' : opt.callback_no;
		this.proxy.confirm(opt);
	},
	action: function(opt) {
		opt.titolo = opt.titolo == null ? '' : opt.titolo;
		opt.testo = opt.testo == null ? '' : opt.testo;
		opt.lista = opt.lista == null ? [] : opt.lista;
		this.proxy.action(opt);
	},
	loading: function(show) {
		this.proxy.loading(show);
	},
	reset: function(sessionid) {
		this.proxy.reset(sessionid);
	},
	reload: function() {
		this.proxy.reload();
	},
	image: function(opt) {
		opt.titolo = opt.titolo == null ? '' : opt.titolo;
		opt.check_session = opt.check_session == null ? false : opt.check_session;
		this.proxy.image(opt);
	},
	gallery: function(opt) {
		opt.titolo = opt.titolo == null ? '' : opt.titolo;
		opt.check_session = opt.check_session == null ? false : opt.check_session;
		opt.lista = opt.lista == null ? [] : opt.lista;
		this.proxy.gallery(opt);
	},
	qrcode: function(opt) {
		opt.prefisso = opt.prefisso == null ? '' : opt.prefisso;
		opt.titolo = opt.titolo == null ? '' : opt.titolo;
		this.proxy.qrcode(opt);
	},
	link: function(url) {
		if (url.indexOf('://') < 0) {
			url = 'http://' + url;
		}
		this.proxy.link(url);
	},
	email: function(opt) {
		this.proxy.email(opt);
	},
	phone: function(numero) {
		this.proxy.phone(numero);
	},
	share: function(url) {
		if (url.indexOf('://') < 0) {
			url = 'http://' + url;
		}
		this.proxy.share(url);
	},
	logout: function() {
		this.proxy.logout();
	},
	position: function(callback) {
		this.proxy.position(callback);
	},
	go_to: function(indirizzo) {
		this.proxy.go_to(indirizzo);
	},
	carrello: function(numero) {
		this.proxy.carrello(numero);
	}
};

AppProxy.init();

function load_layer(load_url, ex_url, check_error, on_complete) {
	var url = '/_app/' + load_url;
	if ($('body').data('device') == 'app') {
		url = '/it' + url;
	}
	AppProxy.loading(true);
	
	$('<div/>').load(url, function() {
		var layer = $([
			'<div class="window-layer">',
				'<div class="form-base">',
					$(this).html(),
				'</div>',				
				'<a class="app-button action-salva"><strong>Salva</strong></a>',	
				'<br><br>',
				'<a class="app-button app-button-white action-close"><strong>Annulla</strong></a>',						
			'</div>'
		].join(''));
		show_layer(ex_url, layer, check_error, on_complete);
		AppProxy.loading(false);
	});	
}

function show_layer(ex_url, layer, check_error, on_complete) {
	$('.window-layer').remove();
	$('#main').css({display: 'none'});
	
	$('body').append(layer);

	layer.find('input,textarea,select').each(function() {
		if ($(this).val() != '') {
			$(this).closest('.field-line').addClass('keypress');
		}
		$(this).on('keyup', function() {
			var line = $(this).closest('.field-line');
			if ($(this).val() == '') {
				line.removeClass('keypress');
			}
			else {
				line.addClass('keypress');
			}
		});
		$(this).on('focus', function() {
			$(this).closest('.field-line').addClass('focus');
			$(this).closest('.field').addClass('focus');
		});
		$(this).on('blur', function() {
			var line = $(this).closest('.field-line');
			$(this).closest('.field').removeClass('focus');
			line.removeClass('focus');
			var val = Utility.trim($(this).val());
			if (val == '') {
				line.removeClass('keypress');
			}
			else {
				line.addClass('keypress');
			}
		});
	});
	
	layer.find('.appweb-menu .has-childs > a').on('click', function() {
		var li = $(this).closest('li');
		if (li.hasClass('show-submenu')) {
			li.removeClass('show-submenu');
			li.find('.show-submenu').removeClass('show-submenu');
		}
		else {
			li.addClass('show-submenu');
		}
	});

	layer.find('.app-checkbox').on('click', function() {
		var cont = $(this).closest('.app-checkbox-group');
		var val = $(this).attr('checkbox');
		if (val != 'checked') {
			if (cont.length > 0) {
				cont.find('.app-checkbox').each(function() {
					$(this).find('input').val('');
					$(this).attr('checkbox', '');
				});
			}
			$(this).attr('checkbox', 'checked');
			$(this).find('input').val($(this).data('value'));
		}
		else {
			$(this).find('input').val('');
			$(this).attr('checkbox', '');
		}
	});	
	
	layer.find('.input-datepicker').datepicker({
		format: 'dd/mm/yyyy',
		weekStart: 1
	}).on('changeDate', function() {
		$(this).parent().addClass('keypress');
	}).on('show', function() {
		$(this).closest('.field-line').addClass('focus');
	}).on('hide', function() {
		$(this).closest('.field-line').removeClass('focus');
	});
	
	layer.find('.action-close').on('click', function() {
		$('#main').css({display: 'block'});
		layer.remove();
	});	
	
	layer.find('.anteprima-scatta-foto').on('click', function() {
		var form = $(this).closest('form');
		var inputField = form.find('input[name="file"]');
		var anteprima_img = form.find('.anteprima-scatta-foto');

		inputField.fileupload({
			url: '/_app/upload-image',
			autoUpload: false,
			dataType: 'json',
			add: function (e, data) {
				var valido = true;
				var fileName = inputField.val();
				var fileType = ['jpg', 'jpeg', 'png', 'gif'];
				var i = fileName.lastIndexOf('.');
				if (i > 0) {
					var estensione = fileName.substr(i+1).toLowerCase();
					var trovato = false;
					for (var i = 0; i < fileType.length && !trovato; i++) {
						if (fileType[i] == estensione) {
							trovato = true;
						}
					}
					if (!trovato) {
						$('body').message({message: 'Inserire un formato valido', type: 'error'});
					}
				}
				else {
					valido = false;
				}

				if (valido) {					
					data.submit();
				}
				else {
					data.abort();
				}
			},      
			start: function (e) {
				AppProxy.loading(true);
			}, 			
			fail: function (e) {
				AppProxy.loading(false);
				$('body').message({message: ' errore nel caricamento del file, impossibile procedere', type: 'error'});
			}, 
			done: function (e, data) {
				AppProxy.loading(false);
				data = data.result;	
							
				if (data.success) {
					anteprima_img.addClass('is-image');
					anteprima_img.css({backgroundImage: 'url(/temp/app/300x300/' + data.data.file_temp + ')'});
					layer.find('input[name="immagine"]').val(data.data.file_temp);
					layer.find('input[name="immagine:name"]').val(data.data.file_name);
				}
				else {
					if (data.message == null) {
						$('body').message({message: 'File troppo grande massimo 10MB', type: 'error'});
					}
					else {
						$('body').message({message: data.message, type: 'error'});
					}
				}

			},
			progressall: function (e, data) {

			}
		});
		inputField.trigger('click');
	});	
	
	layer.find('.action-salva').on('click', function() {
		var form = layer.find('.form-data');
		form.find('.field-error').removeClass('field-error');
		if (!Validator.checkIsValidForm(form)) {
			$('body').message({message: 'I campi evidenziati in rosso contengono errore', type: 'error'});
			return;
		}
		if (check_error) {
			var err = check_error(form);
			if (err) {
				$('body').message({message: err, type: 'error'});
				return;
			}
		}
		
		var url = '/_app/' + ex_url;
		if ($('body').data('device') == 'app') {
			url = '/it' + url;
		}
		AppProxy.loading(true);
		$.xajax(url, {
			data: form.serializeObject(),
			success: function (data) {
				AppProxy.loading(false);
				if (data.success) {
					if (on_complete) {
						on_complete(data);
					}
					$('body').message({message: 'Dati salvati correttamente'});
					$('#main').css({display: 'block'});
					layer.remove();		
				}
				else {
					if (data.message == null) {
						$('body').message({message: 'Errore in fase di salvataggio', type: 'error'});
					}
					else {
						$('body').message({message: data.message, type: 'error'});
					}					
				}
			},
			error: function() {
				AppProxy.loading(false);
				$('body').message({message: 'Linea internet non disponibile', type: 'error'});
			}
		});
	});	
	$('body,html,.window-layer').scrollTop(0);
}

$(function(){	
	$('body').on('click', '[tab-open]', function() {
		if (!$(this).hasClass('show')) {
			var tab = $(this).closest('[tab]');
			tab.find('> [tab-body].show, > [tab-header] .show').removeClass('show');
			$(this).addClass('show');
			tab.find('> [tab-body="' + $(this).attr('tab-open') + '"]').addClass('show');
		}
	});
	
	$('body').on('update-info-cart', function(e, cart) {
		if (cart && !isNaN(cart.number)) {
			AppProxy.carrello(parseInt(cart.number));
		}
	});
});