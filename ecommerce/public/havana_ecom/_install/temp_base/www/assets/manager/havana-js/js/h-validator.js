H.Validator = {
	validatorType: [
			'orasimple',
			'datasimple',
			'email',
			'intn',
			'int',
			'int_s',
			'euro_s',
			'euro',
			'cap',
			'sigla',
			'float',
			'url',
			'sdi',
			'suburl',
			'urlyoutube',
			'nickname',
			'password',
			'confermapassword',
			'datagiorno',
			'datamese',
			'dataanno',
			'sesso',
			'telefono',
			'telefonosimple',
			'imagename',
			'codicefiscale',
			'rgb'
		],
	labels: {
		orasimpleNonValida: 'Orario non valido, inserire hh:mm',
		telefonoNonValido: 'Il numero di telefono deve essere nel seguente formato +##-####-######',
		telefonoSimpleNonValido: 'Il numero di telefono deve essere nel seguente formato +############',
		codiceFiscaleNonValido: 'Codice fiscale non valido',
		erroreServer: 'Errore interno impossibile procedere',
		campiEvidenziatiInRossoContengonoErrori: 'I campi evidenziati in rosso contengono degli errori, impossibile procedere con l\'invio dei dati',
		campoObbligatorio: 'Campo obbligatorio',
		indirizzoEmailNonValido: 'Indirizzo di posta elettronica non valido',
		alphanumcharNonValido: 'Valore non valido, &egrave; possibile inserire solo lettere, numeri e i caratteri _ (underscore), - (trattino)',
		nicknameNonValido: 'Nickname non valido, &egrave; possibile inserire solo lettere, numeri e i caratteri _ (underscore), - (trattino)',
		nicknameCorto: 'Il nickname deve essere di almeno 6 caratteri',
		passwordNonValida: 'Non sono ammessi spazi all\'interno della password',
		passwordCorta: 'La password deve essere lunga almeno 6 caratteri',
		dataNonValida: 'La data inserita non &egrave; valida',
		capNonValido: 'CAP non valido',
		siglaNonValido: 'Sigla non valida',
		sessoNonValido: 'Inserire S o F',
		intNonValido: 'Inserire un numero intero valido',
		int_sNonValido: 'Inserire un numero intero valido o il valore *',
		floatNonValido: 'Inserire un numero decimale valido #,##',
		euroNonValido: 'Inserire un valore in euro corretto #,##',
		euro_sNonValido: 'Inserire un valore in euro corretto #,## o il valore *',
		urlNonValido: 'Indirizzo non valido, inserire ad esempio http://www.nomedominio.it',
		urlYoutubeNonValido: 'Indirizzo non valido',
		imagenameNonValido: 'Nome immagine non valido, si possono inserire solo lettere, numeri e trattino',
		datasimpleNonValida: 'data non valida, inserire gg/mm/aaaa',
		confermaPasswordNonValida: 'Conferma password non corrispondente',
		sdiNonValido: 'Codice destinatario SDI non valido',
		rgbNonValido: 'Valore colore RGB non valido'
	},
	isYouTubeUrl: function(url) {
		if (url == null || url == '') {
			return false;
		}
		
		var value = url.toLowerCase();
		value = H.Utility.trim(value);
		if (value.indexOf('https:') >= 0) {
			value.value = 'http' + value.substr(5);
		}
		var tmmUrl = [
			'player.vimeo.com',
			'vimeo.com',
			'youtube.com',
			'youtu.be',
			'youtube.com'
		];		
		var youtubeUrl = [];
		
		for (var i = 0; i < tmmUrl.length; i++) {
			youtubeUrl.push(youtubeUrl[i]);
			youtubeUrl.push('http://' + tmmUrl[i]);
			youtubeUrl.push('https://' + tmmUrl[i]);
			if (tmmUrl[i].split('.').length == 2) {
				youtubeUrl.push('www.' + tmmUrl[i]);
				youtubeUrl.push('http://www.' + tmmUrl[i]);
				youtubeUrl.push('https://www.' + tmmUrl[i]);
			}
		}
		
		for (var i = 0; i < youtubeUrl.length; i++) {
			if (value == youtubeUrl[i]) {
				return false;
			}
			if (value.indexOf(youtubeUrl[i]) == 0) {
				return true;
			}				
		}
		return false;	
	}
};

H.Validator.action = {
	valida: function(field, validator) {
		field = $(field);
		if (field.attr('type') == 'file') {
			var val = field.val();
		}
		else {
			var val = H.Utility.trim(field.val());
			field.val(val);
		}
		var wrapper = field.closest('.field-line');
		var resp = H.Validator.action['check_' + validator](field, field.val(), wrapper);

		return H.Validator.action.fieldMessage(wrapper, resp);
	},
	fieldMessage: function(wrapper, resp) {
		if (resp.valido) {
			wrapper.fieldError(false);
			return true;
		}
		else {
			if (resp.msg != null) {
				wrapper.fieldError(resp.msg);
			}
			return false;
		}
	},
	check_required: function(field, value, wrapper) {
		if (field.closest('.edit-lang-wrapper').length &&
			field.closest('.field-line.edit-lang').length == 0) {
			return {valido:true};
		}
		if (wrapper.hasClass('field-error')) {
			return {valido:false};
		}
		if (value == '') {
			return {valido:false, msg: H.Validator.labels.campoObbligatorio};
		}
		if (field.hasClass('valida-data')) {
			var giorno = wrapper.find('.valida-datagiorno');
			var mese = wrapper.find('.valida-datamese');
			var anno = wrapper.find('.valida-dataanno');
			giorno.val(H.Utility.trim(giorno.val()));
			mese.val(H.Utility.trim(mese.val()));
			anno.val(H.Utility.trim(anno.val()));
			if (giorno.val() == '' || mese.val() == '' || anno.val() == ''||
				isNaN(giorno.val()) || isNaN(mese.val()) || isNaN(anno.val())) {
				return {valido:false, msg: H.Validator.labels.campoObbligatorio};
			}
		}
		else {
			if (field.attr('type') == 'checkbox') {
				if (field.hasClass('valida-singlecheck')) {
					if (field.closest('.field-line').find('input.valida-singlecheck:checked').length == 0) {
						return {valido:false, msg: H.Validator.labels.campoObbligatorio};
					}
				}
				else {
					if (!field.prop('checked')) {
						return {valido:false, msg: H.Validator.labels.campoObbligatorio};
					}
				}
			}
		}
		return {valido:true};	
	},
	check_sdi: function(field, value, wrapper) {
		if (value != '') {
			var check = /[a-zA-Z0-9]$/i;
			if (!check.test(value)) {
				return {valido:false, msg: H.Validator.labels.sdiNonValido};
			}
			if (value.length != 7) {
				return {valido:false, msg: H.Validator.labels.sdiNonValido};
			}
		}
		return {valido:true};
	},
	check_orasimple: function(field, value, wrapper) {
		if (value != '') {
			var check = /^[0-9]{1,2}(:)[0-9]{1,2}/i;
			if (value.length != 5 || !check.test(value)) {
				return {valido:false, msg: H.Validator.labels.orasimpleNonValida};
			}
			var part = value.split(':');
			part[0] = parseInt(part[0]);
			part[1] = parseInt(part[1]);
			if (part[0] < 0 || part[0] > 23 || part[1] < 0 || part[1] > 59) {
				return {valido:false, msg: H.Validator.labels.orasimpleNonValida};
			}
		}
		return {valido:true};	
	},
	check_rgb: function(field, value, wrapper) {
		if (value != '') {
			var check = /^[0-9abcdefABCDEF]+$/i;
			if (!check.test(value) || value.length != 6) {
				return {valido:false, msg: H.Validator.labels.rgbNonValido};
			}
		}
		return {valido:true};
	},
	check_int: function(field, value, wrapper) {
		if (value != '') {
			var check = /^[0-9]+$/i;
			if (!check.test(value)) {
				return {valido:false, msg: H.Validator.labels.intNonValido};
			}			
		}
		return {valido:true};
	},
	check_intn: function(field, value, wrapper) {
		if (value != '') {
			var check = /^[0-9\-]+$/i;
			if (!check.test(value)) {
				return {valido:false, msg: H.Validator.labels.intNonValido};
			}			
		}
		return {valido:true};
	},
	check_int_s: function(field, value, wrapper) {
		if (value != '' && value != '*') {
			return H.Validator.action.check_int(field, value, wrapper);
		}
		return {valido:true};
	},
	check_euro_s: function(field, value, wrapper) {
		if (value != '' && value != '*') {
			return H.Validator.action.check_euro(field, value, wrapper);
		}
		return {valido:true};
	},
	check_euro: function(field, value, wrapper) {
		if (value != '') {
			var check = /^[0-9]+$/i;
			if (check.test(value)) {
				return {valido:true};
			}
			value = value.replace('\.', '');
			var num_dec = field.attr('data-num-dec');
			if (num_dec == null || num_dec == '' || isNaN(num_dec)) {
				num_dec = 2
			}
			check = new RegExp("^(-)?[0-9]+,?[0-9]{" + num_dec + "}$", "i");
			if (!check.test(value)) {
				return {valido:false, msg: H.Validator.labels.euroNonValido};
			}
		}
		return {valido:true};
	},
	check_telefono: function(field, value, wrapper) {
		if (value != '') {
			var check = /^\+[0-9]{2,3}-[0-9]{2,5}-[0-9]{2,12}$/i;
			if (!check.test(value)) {
				return {valido:false, msg: H.Validator.labels.telefonoNonValido};
			}
		}
		return {valido:true};
	},
	check_telefonosimple: function(field, value, wrapper) {
		if (value != '') {
			var check = /^\+[0-9]+$/i;
			if (!check.test(value) || value.length < 8) {
				return {valido:false, msg: H.Validator.labels.telefonoSimpleNonValido};
			}
		}
		return {valido:true};
	},	
	check_codicefiscale: function(field, value, wrapper) {
		if (value != '') {
			var check = /^([A-Za-z]{6}[0-9lmnpqrstuvLMNPQRSTUV]{2}[abcdehlmprstABCDEHLMPRST]{1}[0-9lmnpqrstuvLMNPQRSTUV]{2}[A-Za-z]{1}[0-9lmnpqrstuvLMNPQRSTUV]{3}[A-Za-z]{1})|([0-9]{11})$/i;
			if (!check.test(value)) {
				return {valido:false, msg: H.Validator.labels.codiceFiscaleNonValido};
			}
		}
		return {valido:true};
	},
	check_sesso: function(field, value, wrapper) {
		if (value != '') {
			value = value.toLowerCase();
			if (value != 'm' && value != 'f') {
				return {valido:false, msg: H.Validator.labels.sessoNonValido};
			}
		}
		return {valido:true};
	},
	check_datagiorno: function(field, value, wrapper) {
		if (value != '') {
			var check = /^[0-9]+$/i;
			if (!check.test(value) || value < 0 || value > 31) {
				return {valido:false, msg: H.Validator.labels.dataNonValida};
			}
		}
		return {valido:true};
	},
	check_datamese: function(field, value, wrapper) {
		if (value != '') {
			var check = /^[0-9]+$/i;
			if (!check.test(value) || value < 0 || value > 12) {
				return {valido:false, msg: H.Validator.labels.dataNonValida};
			}
		}
		return {valido:true};
	},
	check_dataanno: function(field, value, wrapper) {
		if (value != '') {
			var check = /^[0-9]+$/i;
			var data = new Date();
			if (!check.test(value) || value < 1900 || value > data.getFullYear()) {
				return {valido:false, msg: H.Validator.labels.dataNonValida};
			}
		}
		return {valido:true};
	},
	formatUrl: function(field, value) {
		var url = value.toLowerCase();
		if (url.indexOf('http://') == 0 || url.indexOf('https://') == 0 || url.indexOf('ftp://') == 0) {
			return value;
		}
		value = 'http://' + value;
		if (field != null) {
			field.val(value);
		}
		return value;
	},
	check_url: function(field, value, wrapper) {
		if (value != '') {
			value = H.Validator.action.formatUrl(field, value);
			var check = /(((https?)|(ftp)):\/\/([\-\w]+\.)+\w{2,3}(\/[%\-\w]+(\.\w{2,})?)*(([\w\-\.\?\\\/+@&#;`~=%!]*)(\.\w{2,})?)*\/?)/i;
			if (!check.test(value)) {
				return {valido:false, msg: H.Validator.labels.urlNonValido};
			}
		}
		return {valido:true};
	},	
	check_urlyoutube: function(field, value, wrapper) {
		if (value != '') {
					
			if (field != null &&
				value.toLowerCase().indexOf('https://') < 0 &&
				value.toLowerCase().indexOf('http://') < 0) {
				value = 'https://www.youtube.com/embed/' + value;
				field.val(value);
			}
			
			value = H.Validator.action.formatUrl(field, value);
			var check = /(((https?)|(ftp)):\/\/([\-\w]+\.)+\w{2,3}(\/[%\-\w]+(\.\w{2,})?)*(([\w\-\.\?\\\/+@&#;`~=%!]*)(\.\w{2,})?)*\/?)/i;
			if (!check.test(value)) {
				return {valido:false, msg: H.Validator.labels.urlYoutubeNonValido};
			}
			
			if (H.Validator.isYouTubeUrl(value)) {
				return {valido:true};
			}

			return {valido:false, msg: H.Validator.labels.urlYoutubeNonValido};
		}
		return {valido:true};
	},
	check_email: function(field, value, wrapper) {
		if (value != '' && !value.startsWith(':') && value != 'root') {
			var check = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
			if (!check.test(value)) {
				return {valido:false, msg: H.Validator.labels.indirizzoEmailNonValido};
			}
		}
		return {valido:true};
	},
	check_imagename: function(field, value, wrapper) {
		if (value != '') {
			var check = /^[a-z0-9\-]+$/i;
			if (!check.test(value)) {
				return {valido:false, msg: H.Validator.labels.imagenameNonValido};
			}
		}
		return {valido:true};
	},
	check_suburl: function(field, value, wrapper) {
		if (value != '') {
			var check = /^[a-z0-9\_\-\/\.\+\{\}]+$/i;
			if (!check.test(value)) {
				return {valido:false, msg: H.Validator.labels.nicknameNonValido};
			}
		}
		return {valido:true};
	},
	check_float: function(field, value, wrapper) {
		if (value != '') {
			var check = /^(-)?[0-9]+(\,)?[0-9]*$/i;
			if (!check.test(value)) {
				return {valido:false, msg: H.Validator.labels.floatNonValido};
			}
		}
		return {valido:true};
	},
	check_nickname: function(field, value, wrapper) {
		if (value != '') {
			if (value.length < 6) {
				return {valido:false, msg: H.Validator.labels.nicknameCorto};
			}
			var check = /^[a-zA-Z0-9\_\-]+$/i;
			if (!check.test(value)) {
				return {valido:false, msg: H.Validator.labels.nicknameNonValido};
			}
		}
		return {valido:true};
	},	
	check_alphanumchar: function(field, value, wrapper) {
		if (value != '') {
			var check = /^[a-zA-Z0-9\_\-]+$/i;
			if (!check.test(value)) {
				return {valido:false, msg: H.Validator.labels.alphanumcharNonValido};
			}
		}
		return {valido:true};
	},	
	check_cap: function(field, value, wrapper) {
		if (value != '') {
			var check = /^[0-9]+$/i;
			if (!check.test(value) || value.length != 5) {
				return {valido:false, msg: H.Validator.labels.capNonValido};
			}
		}
		return {valido:true};
	},
	check_sigla: function(field, value, wrapper) {
		if (value != '') {
			var check = /^[a-zA-Z0-9]+$/i;
			if (!check.test(value) || value.length != 2) {
				return {valido:false, msg: H.Validator.labels.siglaNonValido};
			}
		}
		return {valido:true};
	},
	check_password: function(field, value, wrapper) {
		if (value != '') {
			if (value.length < 6) {
				return {valido:false, msg: H.Validator.labels.passwordCorta};
			}
			if (value.indexOf(' ') >= 0) {
				return {valido:false, msg: H.Validator.labels.passwordNonValida};
			}
		}
		return {valido:true};
	},
	check_datasimple: function(field, value, wrapper) {
		if (value != '') {
			var check = /^[0-9]{1,2}(-|\/)[0-9]{1,2}(-|\/)[0-9]{4}/i;
			if (!check.test(value)) {
				return {valido:false, msg: H.Validator.labels.datasimpleNonValida};
			}
			value = value.replace(/-/gi, '/');
			var part = value.split('/');
			part[0] = parseInt(part[0]);
			part[1] = parseInt(part[1]);
			if (part[0] < 1 || part[0] > 31 || part[1] < 1 || part[1] > 12) {
				return {valido:false, msg: H.Validator.labels.datasimpleNonValida};
			}
			switch (part[1]) {
				case 2:
					if (part[0] > 29) {
						return {valido:false, msg: H.Validator.labels.datasimpleNonValida};
					}
					break;
				case 4:
				case 6:
				case 9:
				case 11:	
					if (part[0] > 30) {
						return {valido:false, msg: H.Validator.labels.datasimpleNonValida};
					}
					break;
			}
			field.val(value);
		}
		return {valido:true};	
	},
	check_data: function(field, value, wrapper) {
		var giorno = wrapper.find('.valida-datagiorno');
		var mese = wrapper.find('.valida-datamese');
		var anno = wrapper.find('.valida-dataanno');
		giorno.val(H.Utility.trim(giorno.val()));
		mese.val(H.Utility.trim(mese.val()));
		anno.val(H.Utility.trim(anno.val()));
		
		if (giorno.val() == '' || mese.val() == '' || anno.val() == '' ||
			isNaN(giorno.val()) || isNaN(mese.val()) || isNaN(anno.val())) {
			return {valido:false, msg: H.Validator.labels.dataNonValida};
		}
		var source_date = new Date(anno.val(), mese.val() - 1, giorno.val());
		if(anno.val() != source_date.getFullYear() || (mese.val() - 1) != source_date.getMonth() ||
			giorno.val() != source_date.getDate()) {
			return {valido:false, msg: H.Validator.labels.dataNonValida};
		}
		return {valido:true}; 
	},
	check_confermapassword: function(field, value, wrapper) {
		var password = field.closest('form').find('.valida-check-password').val();
		if (password != value) {
			return {valido:false, msg: H.Validator.labels.confermaPasswordNonValida};	
		}
		if (value != '') {
			if (password == value) {
				return {valido:true};
			}
			var resp = H.Validator.action.check_password(field, value);
			if (!resp.valido) {
				return {valido:false, msg: H.Validator.labels.confermaPasswordNonValida};
			}
		}
		return {valido:true};	
	}
};


H.Validator.checkIsValidForm = function(form) {
	function check(type) {
		var ok = true;
		form.find('.valida-' + type).each(function(i) {
			ok = H.Validator.action.valida($(this), type) && ok;
		});
		return ok;
	}
	
	var ok = true;
	for (var i = 0; i < H.Validator.validatorType.length; i++) {
		ok = check(H.Validator.validatorType[i]) && ok;
	}
	
	ok = check('data') && ok;
	ok = check('required') && ok;
	
	return ok;
}


$(function() {
	$('body').on('keyup', 'textarea.valida-required,.valida-required[type=text],.valida-required[type=hidden],.valida-required[type=password]', function(event) {
		if (event.keyCode == 13) {
			return;
		}
		var wrapper = $(this).closest('.field-line');
		if (wrapper.hasClass('field-error')) {
			$(this).val(H.Utility.trim($(this).val()));
			if ($(this).val().length > 0) {
				wrapper.removeClass('field-error');
			}
			if ($(this).closest('form').find('.field-error').length == 0) {
				$(this).closest('form').removeClass('form-error');
			}
		}
	});

	$('body').on('keyup','.valida-digitnumberneg', function() {
		var val = H.Utility.trim($(this).val());
		if (val.lastIndexOf('-') > 0) {
			val = val.replace(/[^\d.]/g, '')
		}
		else {
			val.replace(/[^\-\d.]/g, '');
		}
		$(this).val(val);
	});	
	$('body').on('keyup','.valida-digittime', function() {
		$(this).val(H.Utility.trim($(this).val()).replace(/[^0-9\:]/g, ''));
	});
	$('body').on('keyup','.valida-digitint', function() {
		$(this).val(H.Utility.trim($(this).val()).replace(/[^0-9]/g, ''));
	});
	$('body').on('keyup','.valida-digitintn', function() {
		$(this).val(H.Utility.trim($(this).val()).replace(/[^0-9\-]/g, ''));
	});
	$('body').on('keyup','.valida-digitnumber', function() {
		$(this).val(H.Utility.trim($(this).val()).replace(/[^\d.]/g, ''));
	});	
	$('body').on('keyup','.valida-digitrgb', function() {
		$(this).val(H.Utility.trim($(this).val()).replace(/[^\0-9abcdefABCDEF]/g, ''));
	});
	$('body').on('keyup','.valida-digitsex', function() {
		$(this).val(H.Utility.trim($(this).val()).replace(/[^MFmf]/g, ''));
	});
	$('body').on('keyup','.valida-digitalphanum', function() {
		$(this).val(H.Utility.trim($(this).val()).replace(/[^a-zA-Z0-9]/g, ''));
	});
	$('body').on('keyup','.valida-digitfloat', function() {
		$(this).val(H.Utility.trim($(this).val()).replace(/[^0-9\-\,]/g, ''));
	});
	$('body').on('keyup','.valida-digitalpha', function() {
		$(this).val(H.Utility.trim($(this).val()).replace(/[^a-zA-Z]/g, ''));
	});	
	$('body').on('keyup','.valida-digitcap', function() {
		$(this).val(H.Utility.trim($(this).val()).replace(/[^0-9]/g, ''));
	});	
	$('body').on('keyup','.valida-digitnickname', function() {
		$(this).val(H.Utility.trim($(this).val()).replace(/[^a-zA-Z0-9\-\_]/g, ''));
	});
	$('body').on('keyup','.valida-digittelefono', function() {
		$(this).val(H.Utility.trim($(this).val()).replace(/[^0-9\+\-]/g, ''));
	});
	$('body').on('keyup','.valida-digittelefonosimple', function() {
		$(this).val(H.Utility.trim($(this).val()).replace(/[^0-9\+]/g, ''));
	});
	
	$('body').on('keyup','.valida-digiteuro', function() {
		var val = H.Utility.trim($(this).val()).replace(/[^0-9\-\,]/g, '');
		if (val != '') {
			var part = val.split(',');
			if (part.length >= 2) {
				var num_dec = field.attr('data-num-dec');
				if (num_dec == null || num_dec == '' || isNaN(num_dec)) {
					num_dec = 2
				}
				else {
					num_dec = parseInt(num_dec);
				}
				if (part[1].length > num_dec) {
					val = val.substr(0, val.length - 1);
				}
			}
		}
		$(this).val(val);
	});
	$('body').on('keyup','.valida-digitint-star', function() {
		var val = H.Utility.trim($(this).val()).replace(/[^0-9\*]/g, '');
		if (val != '') {
			if (val.indexOf('*') >= 0) {
				val = '*';
			}
			else {
				var part = val.split(',');
				if (part.length >= 2) {
					var num_dec = field.attr('data-num-dec');
					if (num_dec == null || num_dec == '' || isNaN(num_dec)) {
						num_dec = 2
					}
					else {
						num_dec = parseInt(num_dec);
					}
					if (part[1].length > num_dec) {
						val = val.substr(0, val.length - 1);
					}
				}
			}
		}
		$(this).val(val);
	});
	$('body').on('keyup','.valida-digiteuro-star', function() {
		var val = H.Utility.trim($(this).val()).replace(/[^0-9\-\,\*]/g, '');
		if (val.indexOf('*') >= 0) {
			val = '*';
		}
		$(this).val(val);
	});
	
	$('body').on('keyup','.valida-suburl', function() {
		var val = H.Utility.trim($(this).val()).toLowerCase();
		if (val == '/') {
			val = '';
		}
		$(this).val(val.replace(/[^a-z0-9\_\-\/\.\+\{\}]/g, ''));
	});
	$('body').on('keyup','.valida-imagename', function() {
		var val = H.Utility.trim($(this).val()).toLowerCase();
		if (val == '/') {
			val = '';
		}
		$(this).val(val.replace(/[^a-z0-9\-]/g, ''));
	});
	
	function valida(i) {
		return function() {
			H.Validator.action.valida($(this), H.Validator.validatorType[i]);
		}
	}
	
	for (var i = 0; i < H.Validator.validatorType.length; i++) {
		$('body').on('blur', '.valida-' + H.Validator.validatorType[i], valida(i));
	}
});
