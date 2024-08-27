Validator = {
	isCarattare: function(value, check) {
		for (var i = 0; i < value.length; i++) {
			if (check.indexOf(value.charAt(i)) >= 0) {
				return true;
			}
		}
		return false;
	},
	validatorType: [
			'timesimple',
			'datasimple',
			'email',
			'euro',
			'nickname',
			'stringbase',
			'password',
			'confermapassword',
			'telefono',
			'piva',
			'int',
			'sdi',
			'pivait',
			'codicefiscaleit',
			'codicefiscale'
		],
	check_valida_per_nazione: function(field) {
		var data_check = field.attr('data-check');
		if (data_check == null || data_check == '') {
			return false;
		}
		var data_check_from = field.attr('data-check-from');
		if (data_check_from) {
			var input = field.closest('form').find('[name="' + data_check_from + '"]');
		}
		else {
			var cont = field.closest('.data-check-nazione');
			if (cont.length == 0) {
				return false;
			}
			var input = cont.find('select.data-check-nazione');
			if (input.length == 0 || (input.closest('.field-uguale').length > 0 && input.closest('.field-uguale').css('display') == 'none')) {
				input = $('.data-global-check-nazione');
			}
		}
		if (input.length == 0) {
			return false;
		}
		var val = input.val();
		if (val == '') {
			return false;
		}
		data_check = data_check.split(',');
		for (var i = 0; i < data_check.length; i++) {
			if (val == data_check[i]) {
				return true;
			}
		}
		return false;
	}
};

Validator.action = {
	valida: function(field, validator) {
		field = $(field);
		if (field.attr('type') == 'file') {
			var val = field.val();
		}
		else {
			var val = Utility.trim(field.val());
			field.val(val);
		}
		var wrapper = field.closest('.' + Params.html_field_wrapper);
		var resp = Validator.action['check_' + validator](field, field.val(), wrapper);
		return Validator.action.fieldMessage(wrapper, resp);
	},
	fieldMessage: function(wrapper, resp) {
		if (resp.valido) {
			wrapper.removeClass('field-error');
			return true;
		}
		else {
			if (resp.msg != null) {
				var text = wrapper.find('.error-text');
				if (text) {
					text.remove();
				}
				wrapper.addClass('field-error');
				wrapper.append('<span class="error-text">' + resp.msg + '</span>');
			}
			return false;
		}
	},
	check_required: function(field, value, wrapper) {
		if (wrapper.hasClass('field-error')) {
			return {valido:false};
		}
		if (value == '' || value == null) {
			return {valido:false, msg: Label['campoObbligatorio']};
		}
		if (field.attr('type') == 'checkbox') {
			if (field.hasClass('valida-singlecheck')) {
				if (field.closest('.field-line').find('input.valida-singlecheck:checked').length == 0) {
					return {valido:false, msg: Label['campoObbligatorio']};
				}
			}
			else {
				if (!field.prop('checked')) {
					return {valido:false, msg: Label['campoObbligatorio']};
				}
			}
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
			check = /^(-)?[0-9]+,?[0-9]{2}$/i;
			if (!check.test(value)) {
				return {valido:false, msg: Label['euroNonValido']};
			}
		}
		return {valido:true};
	},
	check_telefono: function(field, value, wrapper) {
		if (value != '') {
			var check = /^\+[0-9]{2,3}-[0-9]{2,5}-[0-9]{2,12}$/i;
			if (!check.test(value)) {
				return {valido:false, msg: Label['telefonoNonValido']};
			}
		}
		return {valido:true};
	},
	check_sdi: function(field, value, wrapper) {
		if (value != '') {
			var check = /[a-zA-Z0-9]$/i;
			if (!check.test(value)) {
				return {valido:false, msg: Label['sdiNonValido']};
			}
			if (value.length != 7) {
				return {valido:false, msg: Label['sdiNonValido']};
			}
		}
		return {valido:true};
	},
	check_int: function(field, value, wrapper) {
		if (value != '') {
			var check = /[0-9]$/i;
			if (!check.test(value)) {
				return {valido:false, msg: Label['intNonValido']};
			}
		}
		return {valido:true};
	},
	check_pivait: function(field, value, wrapper) {
		if (value != '' && Validator.check_valida_per_nazione(field)) {
			var check = /^[a-zA-Z]*[0-9]+$/i;
			if (!check.test(value)) {
				return {valido:false, msg: Label['pivaNonValido']};
			}
			if (value.length != 11) {
				return {valido:false, msg: Label['pivaNonValido']};
			}
			
			function validaPIVA(pi) {
				if( pi == '' )  return '';
				if( ! /^[0-9]{11}$/.test(pi) )
					return false;
				var s = 0;
				for( i = 0; i <= 9; i += 2 )
					s += pi.charCodeAt(i) - '0'.charCodeAt(0);
				for(var i = 1; i <= 9; i += 2 ){
					var c = 2*( pi.charCodeAt(i) - '0'.charCodeAt(0) );
					if( c > 9 )  c = c - 9;
					s += c;
				}
				var atteso = ( 10 - s%10 )%10;
				if( atteso != pi.charCodeAt(10) - '0'.charCodeAt(0) )
					return false;
				return true;
			}
			if (!validaPIVA(value)) {
				return {valido:false, msg: Label['pivaNonValido']};
			}
		}
		return {valido:true};
	},
	check_codicefiscaleit: function(field, value, wrapper) {
		if (value != '' && Validator.check_valida_per_nazione(field)) {
			if (value.length == 11) {
				if( ! /^[0-9]{11}$/.test(value) ) {
					return {valido:false, msg: Label['codiceFiscaleNonValido']};
				}
				return {valido:true};
			}
			if (value.length != 16) {
				return {valido:false, msg: Label['codiceFiscaleNonValido']};
			}
			var check = /^([A-Za-z]{6}[0-9lmnpqrstuvLMNPQRSTUV]{2}[abcdehlmprstABCDEHLMPRST]{1}[0-9lmnpqrstuvLMNPQRSTUV]{2}[A-Za-z]{1}[0-9lmnpqrstuvLMNPQRSTUV]{3}[A-Za-z]{1})|([0-9]{11})$/i;
			if (!check.test(value)) {
				return {valido:false, msg: Label['codiceFiscaleNonValido']};
			}
			
			function validaCodiceFiscale(cf) {
				var i, s, set1, set2, setpari, setdisp;

				set1 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
				set2 = "ABCDEFGHIJABCDEFGHIJKLMNOPQRSTUVWXYZ";
				setpari = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
				setdisp = "BAKPLCQDREVOSFTGUHMINJWZYX";
				s = 0;
				for( i = 1; i <= 13; i += 2 )
					s += setpari.indexOf( set2.charAt( set1.indexOf( cf.charAt(i) )));
				for( i = 0; i <= 14; i += 2 )
					s += setdisp.indexOf( set2.charAt( set1.indexOf( cf.charAt(i) )));
				if( s%26 != cf.charCodeAt(15)-'A'.charCodeAt(0) )
					return false;
				return true;
			}
			
			value = value.toUpperCase();
			if (!validaCodiceFiscale(value)) {
				return {valido:false, msg: Label['codiceFiscaleNonValido']};
			}
		}
		return {valido:true};
	},
	check_piva: function(field, value, wrapper) {
		if (value != '') {
			var check = /^[a-zA-Z]*[0-9]+$/i;
			if (!check.test(value)) {
				return {valido:false, msg: Label['pivaNonValido']};
			}
		}
		return {valido:true};
	},
	check_codicefiscale: function(field, value, wrapper) {
		if (value != '') {
			var check = /^([A-Za-z]{6}[0-9lmnpqrstuvLMNPQRSTUV]{2}[abcdehlmprstABCDEHLMPRST]{1}[0-9lmnpqrstuvLMNPQRSTUV]{2}[A-Za-z]{1}[0-9lmnpqrstuvLMNPQRSTUV]{3}[A-Za-z]{1})|([0-9]{11})$/i;
			if (!check.test(value)) {
				return {valido:false, msg: Label['codiceFiscaleNonValido']};
			}
		}
		return {valido:true};
	},
	check_email: function(field, value, wrapper) {
		if (value != '') {
			if (value.indexOf(':') >= 0) {
				value = value.substr(1);
				if (value == 'root') {
					return {valido:true};
				}
			}
			var check = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
			if (!check.test(value)) {
				return {valido:false, msg: Label['indirizzoEmailNonValido']};
			}
		}
		return {valido:true};
	},
	check_nickname: function(field, value, wrapper) {
		if (value != '') {
			if (value.length < 6) {
				return {valido:false, msg: Label['nicknameCorto']};
			}
			var check = /^[a-zA-Z0-9\_\-]+$/i;
			if (!check.test(value)) {
				return {valido:false, msg: Label['nicknameNonValido']};
			}
		}
		return {valido:true};
	},
	check_stringbase: function(field, value, wrapper) {
		if (value != '') {
			var check = /^[a-zA-ZÀ-ÖØ-öø-ÿ\s\']+$/i;
			if (!check.test(value)) {
				return {valido:false, msg: Label['stringbaseNonValido']};
			}
		}
		return {valido:true};
	},
	check_password: function(field, value, wrapper) {
		if (value != '') {
			if (Params.password_strong) {
				if (value.length < 8) {
					return {valido:false, msg: Label['passwordCorta8']};
				}
				
				if (!Validator.isCarattare(value, 'qwertyuiopasdfghjklzxcvbnm') ||
					!Validator.isCarattare(value, 'QWERTYUIOPASDFGHJKLZXCVBNM') ||
					!Validator.isCarattare(value, '1234567890') ||
					!Validator.isCarattare(value, '!$%&-_?=^@#:')) {
					return {valido:false, msg: Label['passwordNonValidaStrong']};
				}
			}
			else {
				if (value.length < 6) {
					return {valido:false, msg: Label['passwordCorta']};
				}
				if (value.indexOf(' ') >= 0) {
					return {valido:false, msg: Label['passwordNonValida']};
				}
			}
		}
		return {valido:true};
	},
	check_timesimple: function(field, value, wrapper) {
		if (value != '') {
			var check = /^[0-9]{1,2}(\:)[0-9]{1,2}/i;
			if (!check.test(value)) {
				return {valido:false, msg: Label['timesimpleNonValida']};
			}
			var part = value.split(':');
			part[0] = parseInt(part[0]);
			part[1] = parseInt(part[1]);
			if (part[0] > 23) {
				return {valido:false, msg: Label['timesimpleNonValida']};
			}
			if (part[1] > 59) {
				return {valido:false, msg: Label['timesimpleNonValida']};
			}
			if (part[0] < 10) {
				part[0] = '0' + part[0];
			}
			if (part[1] < 10) {
				part[1] = '0' + part[1];
			}
			value = part.join(':');
			field.val(value);
		}
		return {valido:true};		
	},
	check_datasimple: function(field, value, wrapper) {
		if (value != '') {
			var check = /^[0-9]{1,2}(-|\/)[0-9]{1,2}(-|\/)[0-9]{4}/i;
			if (!check.test(value)) {
				return {valido:false, msg: Label['datasimpleNonValida']};
			}
			value = value.replace(/-/gi, '/');
			var part = value.split('/');
			part[0] = parseInt(part[0]);
			part[1] = parseInt(part[1]);
			if (part[0] < 1 || part[0] > 31 || part[1] < 1 || part[1] > 12) {
				return {valido:false, msg: Label['datasimpleNonValida']};
			}
			switch (part[1]) {
				case 2:
					if (part[0] > 29) {
						return {valido:false, msg: Label['datasimpleNonValida']};
					}
					break;
				case 4:
				case 6:
				case 9:
				case 11:	
					if (part[0] > 30) {
						return {valido:false, msg: Label['datasimpleNonValida']};
					}
					break;
			}
			field.val(value);
		}
		return {valido:true};	
	},
	check_confermapassword: function(field, value, wrapper) {
		var password = field.closest('form').find('.valida-check-password').val();
		if (password != value) {
			return {valido:false, msg: Label['confermaPasswordNonValida']};	
		}
		if (value != '') {
			if (password == value) {
				return {valido:true};
			}
			var resp = Validator.action.check_password(field, value);
			if (!resp.valido) {
				return {valido:false, msg: Label['confermaPasswordNonValida']};
			}
		}
		return {valido:true};	
	}
};


Validator.checkIsValidForm = function(form) {
	function check(type) {
		var ok = true;
		form.find('.valida-' + type).each(function(i) {
			ok = Validator.action.valida($(this), type) && ok;
		});	
		switch (type) {
		case 'required':
			form.find('[required]').each(function(i) {
				ok = Validator.action.valida($(this), type) && ok;
			});	
			break;
		case 'email':
			form.find('[type="email"]').each(function(i) {
				ok = Validator.action.valida($(this), type) && ok;
			});
			break;
		}
		return ok;
	}
	
	var ok = true;
	for (var i = 0; i < Validator.validatorType.length; i++) {
		ok = check(Validator.validatorType[i]) && ok;
	}
	
	ok = check('data') && ok;
	ok = check('required') && ok;
	
	if (ok) {
		var errorCheckboxGroup = [];
		form.find('.checkbox-group[data-minsel]').each(function() {
			var min = $(this).attr('data-minsel');
			if (min == null || min == '' || min <= 0) {
				return;
			}
			if ($(this).find('.image-checkbox-checked').length < min) {					
				errorCheckboxGroup.push('<br>almeno ' + min + ' voce per <strong>' + $(this).parent().find('.checkbox-group-title').html() + '</strong>');
			}
		});
	}
	
	return ok;
}


$(function(){
	$('body').on('keyup', 'textarea.valida-required,.valida-required[type=text],.valida-required[type=hidden],.valida-required[type=password],[required]', function(event) {
		if (event.keyCode == 13) {
			return;
		}
		var wrapper = $(this).closest('.field-error');
		if (wrapper.length > 0) {
			$(this).val(Utility.trim($(this).val()));
			if ($(this).val().length > 0) {
				wrapper.removeClass('field-error');
			}
		}
	});
	$('body').on('change', 'select.valida-required,select[required]', function(event) {
		var wrapper = $(this).closest('.field-line');
		if (wrapper.hasClass('field-error')) {
			if ($(this).val().length > 0) {
				wrapper.removeClass('field-error');
			}
		}
	});
		
	$('body').on('keyup','.valida-digiteuro', function() {
		var val = Utility.trim($(this).val()).replace(/[^0-9\-\,]/g, '');
		if (val != '') {
			var part = val.split(',');
			if (part.length >= 2) {
				var num_dec = $(this).attr('data-num-dec');
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
	
	function formatDataSimple(value, keyCode) {
		if (keyCode == 8) {
			return value;
		}
		switch(value.length) {
		case 1:
			if (value.charAt(0) == '/') {
				return '';
			}
			if (parseInt(value.charAt(0)) > 3) {
				return '0' + value + '/';
			}
			break;
		case 2:
			if (value.charAt(1) == '/') {
				if (value.charAt(0) == '0') {
					return '0';
				}
				value = '0' + value;
			}
			if (parseInt(value) > 31) {
				return value.charAt(0);
			}
			if (value == '00') {
				return '0';
			}
			value += '/';
			return value;
		case 4:
			if (value.charAt(3) == '/') {
				return value.substr(0, 3);
			}
			if (parseInt(value.charAt(3)) > 1) {
				value = value.substr(0, 2) + '/0' + value.substr(3, 1);
				return value + '/';
			}
			break;
		case 5:
			if (value.charAt(4) == '/') {
				if (value.charAt(3) == 0) {
					return value.substr(0, 4);
				}
				value = value.substr(0, 2) + '/0' + value.substr(3, 1);
			}
			else {
				if (value.substr(3, 2) == '00') {
					return value.substr(0, 4);
				}
				if (parseInt(value.substr(3, 2)) > 12) {
					return value.substr(0, 4);
				}
			}
			value += '/';
			return value;
		default:
			if (value.length > 6) {
				if (value.charAt(value.length - 1) == '/') {
					return value.substr(0, value.length - 1);
				}
				switch(value.length) {
				case 7:
					if (parseInt(value.charAt(6)) > 2 || 
						parseInt(value.charAt(6)) < 1) {
						return value.substr(0, 6);
					}
					break;
				case 8:
					if (parseInt(value.charAt(6)) == 1 &&
						parseInt(value.charAt(7)) != 9) {
						return value.substr(0, 7);
					}
					if (parseInt(value.charAt(6)) == 2 &&
						parseInt(value.charAt(7)) != 0) {
						return value.substr(0, 7);
					}
				}
			}
		}

		return value;
	}
	
	$('body').on('keyup','.valida-digitdatasimple', function(e) {
		var val = Utility.trim($(this).val());
		val = formatDataSimple(val, e.keyCode)
		$(this).val(val);
	});
	$('body').on('keyup','.valida-digitnumber', function() {
		$(this).val(Utility.trim($(this).val()).replace(/[^\d.]/g, ''));
	});
	$('body').on('keyup','.valida-digitalphanum', function() {
		$(this).val(Utility.trim($(this).val()).replace(/[^a-zA-Z0-9]/g, ''));
	});
	$('body').on('keyup','.valida-digitalpha', function() {
		$(this).val(Utility.trim($(this).val()).replace(/[^a-zA-Z]/g, ''));
	});	
	$('body').on('keyup','.valida-digitnickname', function() {
		$(this).val(Utility.trim($(this).val()).replace(/[^a-zA-Z0-9\-\_]/g, ''));
	});
	$('body').on('keyup','.valida-digitstringbase', function() {
		$(this).val($(this).val().replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ\s\']/g, ''));
	});
	$('body').on('keyup','.valida-digittelefono', function() {
		$(this).val(Utility.trim($(this).val()).replace(/[^0-9\+\-]/g, ''));
	});
	$('body').on('keyup','.valida-digitint', function() {
		$(this).val(Utility.trim($(this).val()).replace(/[^0-9]/g, ''));
	});
	$('body').on('keyup','.valida-digitemail', function() {
		$(this).val(Utility.trim($(this).val()).replace(/[^a-zA-Z0-9\-\_\.\@]/g, ''));
	});
	$('body').on('keyup','.valida-digittime', function() {
		$(this).val(Utility.trim($(this).val()).replace(/[^0-9\:]/g, ''));
	});
	
	$('body').on('blur','.valida-digiteuro', function() {
		var val = Utility.trim($(this).val()).replace(/[^0-9\-\,]/g, '');
		if (val != '') {
			var part = val.split(',');
			if (part.length >= 2) {
				var num_dec = $(this).attr('data-num-dec');
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
	$('body').on('blur','.valida-digitnumber', function() {
		$(this).val(Utility.trim($(this).val()).replace(/[^\d.]/g, ''));
	});
	$('body').on('blur','.valida-digitalphanum', function() {
		$(this).val(Utility.trim($(this).val()).replace(/[^a-zA-Z0-9]/g, ''));
	});
	$('body').on('blur','.valida-digitalpha', function() {
		$(this).val(Utility.trim($(this).val()).replace(/[^a-zA-Z]/g, ''));
	});	
	$('body').on('blur','.valida-digitnickname', function() {
		$(this).val(Utility.trim($(this).val()).replace(/[^a-zA-Z0-9\-\_]/g, ''));
	});
	$('body').on('blur','.valida-digitstringbase', function() {
		$(this).val(Utility.trim($(this).val()).replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ\s\']/g, ''));
	});
	$('body').on('blur','.valida-digittelefono', function() {
		$(this).val(Utility.trim($(this).val()).replace(/[^0-9\+\-]/g, ''));
	});
	$('body').on('blur','.valida-digitint', function() {
		$(this).val(Utility.trim($(this).val()).replace(/[^0-9]/g, ''));
	});
	$('body').on('blur','.valida-digitemail', function() {
		$(this).val(Utility.trim($(this).val()).replace(/[^a-zA-Z0-9\-\_\.\@]/g, ''));
	});
	$('body').on('blur','.valida-digittime', function() {
		$(this).val(Utility.trim($(this).val()).replace(/[^0-9\:]/g, ''));
	});
	
	function valida(i) {
		return function() {
			Validator.action.valida($(this), Validator.validatorType[i]);
		}
	}
	
	for (var i = 0; i < Validator.validatorType.length; i++) {
		$('body').on('blur', '.valida-' + Validator.validatorType[i], valida(i));
	}
	
	function countChar(val, check) {
		var num = 0;
		for (var i = 0, len = val.length; i < len; i++) {
			if (check.indexOf(val.charAt(i)) >= 0) {
				num++;
			}
		}
		return num;	
	}	
	function countNotChar(val, check) {
		var num = 0;
		for (var i = 0, len = val.length; i < len; i++) {
			if (check.indexOf(val.charAt(i)) < 0) {
				num++;
			}
		}
		return num;		
	}
	function countRepeatChar(val) {
		var map = [];
		for (var i = 0, len = val.length; i < len; i++) {
			if (map['_' + val.charAt(i)] == null) {
				map['_' + val.charAt(i)] = 0;
			}
			map['_' + val.charAt(i)]++;
		}		

		var num_rep = 0;
		var num_rep_max = 1;
		for (var i = 0, len = val.length; i < len; i++) {
			if (map['_' + val.charAt(i)] > 1) {
				num_rep++;
				if (map['_' + val.charAt(i)] > num_rep_max) {
					num_rep_max = map['_' + val.charAt(i)];
				}
			}
		}
		return num_rep * num_rep_max;		
	}
	
	$('.valida-strong').each(function() {
		$(this).on('keyup', function() {
			var strong = '';
			var punti = 110;
			var val = $(this).val();
			
			if (val.length <= 6) {
				punti = 0;
			}
			else {
				var check_num = '0123456789';
				var check_alpha_lw = 'abcdefghilmnopqrstuvzxywkj';
				var check_alpha_up = check_alpha_lw.toUpperCase();
				var check_all = check_num + check_alpha_lw + check_alpha_up;
				
				punti = val.length * 4;
				var num_number = countChar(val, check_num);
				if (num_number >= 3 && num_number <= val.length / 2) {
					punti += 5;
				}
				num = countNotChar(val, check_all);
				if (num >= 2 && num <= val.length / 3) {
					punti += 5;
				}
				
				var num_alpha_lw = countChar(val, check_alpha_lw);
				var num_alpha_up = countChar(val, check_alpha_up);
				if (num_alpha_lw > 0 && num_alpha_up > 0) {
					punti += 10;
				}
				
				punti -= countRepeatChar(val);
				
				var num_no_char = countNotChar(val, check_all);
				if (num_number > 0 && num_alpha_lw > 0) {
					punti += 15;
				}
				if (num_number > 0 && num_no_char > 0) {
					punti += 15;
				}
				if (num_alpha_lw > 0 && num_no_char > 0) {
					punti += 15;
				}
				
				if (num_number == val.length || 
					num_alpha_lw == val.length) {
					punti -= 10;
				}
			}
			
			if (punti < 34) {
				strong = 'weak';
			}
			else if (punti < 68) {
				strong = 'good';
			}
			else if (punti < 90) {
				strong = 'strong';
			}	
			else {
				strong = 'very-strong';
			}
			var cont = $(this).closest('.field-line');
			cont.addClass('info-valida-strong');
			cont.attr('data-punti', punti);
			cont.attr('data-strong', strong);
			
			if (Params.password_strong) {				
				if (cont.find('.info-password-strong-content').length == 0) {
					cont.addClass('info-password-strong');
					cont.append([
						'<div class="info-password-strong-content">',
							'<div class="info-password-strong-item" data-requisito="lunghezza_8">', Label['passwordCorta8'], '</div>',
							'<div class="info-password-strong-item" data-requisito="numero">', Label['password_is_numero'], '</div>',
							'<div class="info-password-strong-item" data-requisito="lettera_minuscola">', Label['password_is_lettera_minuscola'], '</div>',
							'<div class="info-password-strong-item" data-requisito="lettera_maiuscola">', Label['password_is_lettera_maiuscola'], '</div>',
							'<div class="info-password-strong-item" data-requisito="speciale">', Label['password_is_speciale'], ' !$%&-_?=^@#:</div>',
						'</div>',
					].join(''))
				}
				
				var list = [
					{key: 'lunghezza_8', isValid: function() {
						return val.length >= 8;
					}},
					{key: 'numero', isValid: function() {
						return Validator.isCarattare(val, '1234567890');
					}},
					{key: 'lettera_minuscola', isValid: function() {
						return Validator.isCarattare(val, 'qwertyuiopasdfghjklzxcvbnm');
					}},
					{key: 'lettera_maiuscola', isValid: function() {						
						return Validator.isCarattare(val, 'QWERTYUIOPASDFGHJKLZXCVBNM');
					}},
					{key: 'speciale', isValid: function() {
						return Validator.isCarattare(val, '!$%&-_?=^@#:');
					}}
				];
				
				var count = 0;
				list.forEach((check) => {
					var item = cont.find('[data-requisito="' + check.key + '"]');
					console.log(item.length)
					if (check.isValid()) {
						count++;
						item.addClass('strong-item-check');
					}
					else {
						item.removeClass('strong-item-check');
					}
				});
			}
		});
	});
});
