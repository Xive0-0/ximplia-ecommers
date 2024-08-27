$(function() {
	$('.input-datepicker').datepicker({
		format: 'dd/mm/yyyy',
		weekStart: 1
	}).on('changeDate', function() {
		$(this).parent().addClass('keypress');
		$(this).datepicker('hide');
	}).on('show', function() {
		$(this).closest('.field-line').addClass('focus');
	}).on('hide', function() {
		$(this).closest('.field-line').removeClass('focus');
	});
	
	$('.h-return-submit').each(function() {
		var btn = $(this);
		var form = btn.closest('form');
		form.attr('onsubmit', 'return false;');
		form.append('<input type="image" src="/assets/blank.gif" style="border:none; width:1px; height:1px; margin:0; padding:0;line-height:0;font-size:0;border-radius:0;">');
		form.submit(function() {
			if (form.attr('onsubmit') != '') {
				btn.click();
			}
		});
	});
	
	$('body').on('checkbox-checked', '.h-checkbox-select-all', function(e) {
		if ($(this).closest('.h-list-fixed-header').length > 0) {
			var table = $(this).closest('.h-layout-content-wrapper').find('> table');
		}
		else {
			var table = $(this).closest('table');
		}
		var list = table.find('tbody .h-checkbox');
		if (!$(this).hasClass('h-checkbox-checked')) {
			list.each(function() {
				$(this).closest('tr').removeClass('h-list-row-selected');
				$(this).removeClass('h-checkbox-checked');
				$(this).find('input').val('');
			});
		}
		else {
			list.each(function() {
				$(this).closest('tr').addClass('h-list-row-selected');
				$(this).addClass('h-checkbox-checked');
				$(this).find('input').val($(this).data('value'));
			});
		}
	});
	
	$('body').on('click', '.h-checkbox', function(e) {	
		if ($(this).closest('.tree-level-onlyone').length > 0 ||
			$(this).closest('.tree-level-onlyone-multiple').length > 0) {
			if ($(this).hasClass('h-checkbox-checked')) {
				if ($(this).closest('.tree-level-onlyone-deselect').length > 0) {
					$(this).find('input').val('');
					$(this).removeClass('checkbox-checked');
				}				
			}
			else {
				if ($(this).closest('.tree-level-onlyone-multiple').length == 0) {
					$(this).closest('.tree-level-onlyone').find('.h-checkbox-checked').not($(this)).each(function() {
						$(this).removeClass('h-checkbox-checked');
						$(this).find('input').val('');					
					});	
				}
			}
		}
		else if ($(this).closest('.tree-level-single').length > 0) {
			if ($(this).hasClass('h-checkbox-checked')) {
				$(this).closest('li').find('.h-checkbox-checked').each(function() {
					$(this).removeClass('h-checkbox-checked');
					$(this).find('input').val('');
				});
			}
			else {
				$(this).closest('.tree-level-single').find('.h-checkbox-checked').each(function() {
					$(this).removeClass('h-checkbox-checked');
					$(this).find('input').val('');
				});
				
				var elem = $(this).closest('li');
				do {
					elem = elem.find('.h-checkbox:eq(0)');
					elem.addClass('h-checkbox-checked');
					elem.find('input').val(elem.attr('data-value'));	
					elem = elem.closest('ul').closest('li');
				}
				while (elem.length > 0);
			}
			return;
		}	
	
		var obj = $(this).actionParams();
		var val = '';
		if ($(this).hasClass('h-checkbox-checked')) {
			$(this).removeClass('h-checkbox-checked');
		}
		else {
			$(this).addClass('h-checkbox-checked');
			val = $(this).attr('data-value');
		}
		$(this).find('input').val(val);
		
		if (obj.update) {
			$(obj.update.elem).attr('data-load-params', '{"' + obj.update.paramName + '": "' + val + '"}');
		}
		if (obj.reload) { 
			$(obj.reload).loadWindow();
		}
		if (obj.callback) { 
			H.callback[obj.callback]($(this));
		}
		
		var closest = $(this).closest('.h-list');
		if (closest.length > 0) {
			$(this).closest('tr').addClassCheckHas('h-list-row-selected');
			if (!closest.hasClass('h-list-multiple-selection')) {
				if (closest.hasClass('h-list-slingle-selection') || (!e.ctrlKey && !e.shiftKey)) {
					closest.find('.h-checkbox-checked').not($(this)).each(function() {
						$(this).removeClass('h-checkbox-checked');
						$(this).find('input').val('');
						$(this).closest('tr').addClassCheckHas('h-list-row-selected');
					})
				}				
			}
		}

		if ($(this).closest('.tree-level-multi').length > 0) {
			if ($(this).hasClass('h-checkbox-checked')) {
				var elem = $(this).closest('ul').closest('li');
				if (elem.length > 0) {
					elem = elem.find('.h-checkbox:eq(0)');
					if (!elem.hasClass('h-checkbox-checked')) {
						elem.click();
					}
				}
			}
			else {
				$(this).closest('li').find('ul:eq(0) > li .h-checkbox-checked').click();
			}
		}
		
		$(this).trigger('checkbox-checked');
	});
	
	$('body').on('click','.h-action-submit',function() {
		var thisBtn = $(this);
		if (thisBtn.hasClass('form-submit-loading')) {
			return;
		}
		
		var form = $(this).closest('form');
		form.off('do-submit');
		form.off('remove-loading');
		
		form.removeClass('form-error');
		form.find('.field-error').removeClass('field-error');
		
		function printFormErrorMessage(text) {
			if (text == null || text.length == 0) {
				text = 'Server non raggiungibile o errore interno, riprovare pi&ugrave; tardi.';
			}
			if (thisBtn.closest('.h-box-wrapper').length > 0) {
				$(thisBtn.closest('.h-layout-content')).scrollTop(0);
			}
			else {
				$(document).scrollTop(form.offset().top);
			}
			form.trigger('remove-loading');
			var msgObj = form.find('.form-error-message');
			if (msgObj.length == 0) {
				msgObj = $('<div class="form-error-message"></div>');
				form.find('fieldset:first-child').prepend(msgObj);
			}
			msgObj.html(text);
			form.addClass('form-error');
			
			if (opt.buttonLogin == null) {
				$('body').message({message: text, type: 'error'});
			}
		}

		form.on('remove-loading', function() {
			thisBtn.parent().removeClass('form-submit-loading');
		});
		
		var fieldFormValidi = false;
		var opt = thisBtn.actionParams();
		if (H.Validator.checkIsValidForm(form)) {
			if (opt.valida != null) {
				if (H.validator[opt.valida](form)) {
					fieldFormValidi = true;
				}
			}
			else {
				fieldFormValidi = true;
			}
		}
		
		if (opt.check) {
			var resp = $(opt.check.in).selectionInList(opt.check);
			if (resp == null) {
				return;
			}
		}		
		
		if (fieldFormValidi) {
			if (opt.buttonLogin == null) {
				var loading = opt.onComplete.closeWin == null ? $('body') : thisBtn.closest('.h-box-wrapper');
				loading = loading.loading(opt.loadinMessage);
			}
			else {
				thisBtn.parent().addClass('form-submit-loading');
				thisBtn.parent().find('.loading').remove();
				var loading = $('<img class="loading" src="' + H.imagesUrl + '/loading.gif" alt="loading">');
				thisBtn.parent().append(loading);
			}

			form.on('remove-loading', function() {
				loading.remove();
			});
			
			if (opt.onComplete && opt.onComplete.update) {
				$(opt.onComplete.update).load(opt.url + '?_hpage=' + (H.countAjax++), form.serializeObject(), function() {
					thisBtn.parent().removeClass('form-submit-loading');
					loading.remove();
				});
			}
			else {
				form.on('do-submit', function() {
					if (opt.method && opt.method == 'get') {
						if (opt.target) {
							loading.remove();
							form.attr('target', opt.target);
							if (opt.onComplete.closeWin) {
								thisBtn.closest('.h-box-wrapper').find('.h-close-box').click();
							}
						}
						form.attr('method', 'get');
						form.attr('action', opt.url);
						form.submit();
						return;
					}
					var formData = form.serializeObject();
					if (opt.params) {
						$.each(opt.params, function(k, v) {
							formData[k] = v;
						});
					}
					H.ajax(opt.url, {
						data: formData,
						success: function (data) {
							loading.remove();
							if (data.invalid_auth != null && data.invalid_auth) {
								$('body').loading();
								location.href = H.loginUrl;
							}
							else if (data.success) {
								if (opt.onComplete.clearSelection && opt.onComplete.clearSelection != '') {
									$(opt.onComplete.clearSelection).clearSelectionInList();
								}
								if (opt.onComplete.replace_item && data.item) {
									var cont = $('<table>' + data.item + '</table>');
									var id = opt.onComplete.replace_item.split(',');								
									for (var i = 0; i < id.length; i++) {
										var item = $('tr[data-id=' + id[i] + ']');					
										item.replaceWith(cont.find('tr[data-id=' + id[i] + ']'));
										var edit = $('tr[data-id=' + id[i] + ']').closest('.h-edit-table');
										if (edit.length > 0) {
											edit.editTable();
										}
									}
								}
								
								if (opt.onComplete.callback) {
									if (H.callback[opt.onComplete.callback] != null) {
										if (H.callback[opt.onComplete.callback](thisBtn, data)) {
											return;
										}
									}
								}
								
								if (opt.onComplete.download) {
									function doDownload(url, params) {
										var target = H.id();
										var cont = $('<div style="display: none;" class="download-wrapper"/>');
										var form = $('<form action="' + url + '" target="' + target + '" method="post"/>');
										cont.append('<iframe name="' + target + '"/>')
											.append(form);
										if (params) {
											for (var key in params) {
												if (params.hasOwnProperty(key)) {
													form.append('<input type="hidden" name="' + key + '" value="' + params[key] + '"/>');
												}
											}
										}
										$('body').append(cont);
										form.submit();
									}
									doDownload(opt.onComplete.download, {file: data.file});
								}
								if (opt.onComplete.hide && opt.onComplete.show) {
									$(opt.onComplete.hide).fadeOut(300, function() {
										$(this).remove();
										$(opt.onComplete.show).fadeIn(300);
									});
								}
								else if (opt.onComplete.closeWin) {
									var message = opt.onComplete.message;
									if (message == null) {
										if (data.message == null) {
											message = 'Dati salvati correttamente';
										}
										else {
											message = data.message;
										}
									}
									$('body').message({message: message, type: 'confirm'});
									thisBtn.closest('.h-box-wrapper').find('.h-close-box').click();
									
									if (opt.onComplete.reload && opt.onComplete.reload != '-') {										
										if (typeof opt.onComplete.reload === 'string') {
											opt.onComplete.reload = [opt.onComplete.reload];
										}
										for (var i = 0; i < opt.onComplete.reload.length; i++) {
											$(opt.onComplete.reload[i]).loadWindow();
										}										
									}
									if (opt.onComplete.reloadCombo && opt.onComplete.reloadCombo != '') {
										var select = $('[data-callback-id=' + opt.onComplete.reloadCombo + ']');
										var multipleCheckOptions = select.attr('data-multiple-check-options');
										if (multipleCheckOptions != null && multipleCheckOptions != '') {
											var newItem = '<div class="h-checkbox-wrapper" data-id="' + data.item.id + '"><span class="h-checkbox" data-value="' + data.item.id + '"><input type="hidden" name="' + multipleCheckOptions + '" value="" /></span> <strong>' + data.item.nome + '</strong></div>';
											if (select.hasClass('tree')) {
												select = select.find('[data-id=' + opt.onComplete.parentId + ']').parent();
												select.append('<li>' + newItem + '</li>');
											}
											else {
												select.append(newItem);
											}
										}
										else {
											select.find('option:eq(0)').after('<option value="' + data.item.id + '">' + data.item.nome + '</option>');
											select.val(data.item.id);
										}
									}
									if (opt.onComplete.reloadPage) {
										$('body').loading();
										location.href = '' + location.href;
									}
								}
								else {
									$('body').loading();
									if (data.onComplete != null && data.onComplete != '') {
										opt.onComplete = data.onComplete;
									}
									location.href = opt.onComplete;
								}
							}
							else {
								if (data.fields_errors) {
									thisBtn.parent().removeClass('form-submit-loading');
									form.addClass('form-error');
									var fields = data.fields_errors;
									printFormErrorMessage('I campi evidenziati in rosso contengono degli errori');
									for (var key in fields) {
										if (fields.hasOwnProperty(key)) {
											var field = form.find('[name=' + key + ']');
											var wrapper = field.closest('.field-line');
											wrapper.fieldError(fields[key]);
										}
									}
								}
								else {
									printFormErrorMessage(data.message);
								}
							}
						},
						error: function() {
							printFormErrorMessage();
						}
					});
				});
				if (opt.confirm) {			
					H.alert({
						message: opt.confirm,
						closeBtn: 'Annulla',
						closeBtnCallback: function() {
							loading.remove();
						},
						buttons: [
							{
								text: 'Procedi', 
								close: true, 
								color: 'blu', 
								action: function(box) {
									form.trigger('do-submit');
								}
							}
						]
					});				
				}
				else {
					if (opt.submitOnCallback) {
						H.callback[opt.submitOnCallback](form);
					}
					else {
						form.trigger('do-submit');
					}
				}
			}
		}
		else {
			printFormErrorMessage('I campi evidenziati in rosso contengono degli errori');
		}
	});

	$('body').on('click','.h-action-upload-file-reset',function() {
		var $this = $(this);
		if ($this.closest('.field-line-file').length) {
			$this.closest('.field-line-file').find('.field-file').val('');
			$this.closest('.field-line-file').find('.field-file-name').val('');
			$this.closest('.field-line-file').find('.field-anteprima').html('');	
		}
		else {
			$this.closest('.field-line-image').find('.field-file').val('');
			$this.closest('.field-line-image').find('.field-file-name').val('');
			$this.closest('.field-line-image').attr('data-file', '');			
		}
	});
	
	$('body').on('change','[data-hide-on-change]',function() {
		var elem = $(this).closest('.hide-on-change').find($(this).data('hide-on-change'));
		elem = $(elem);
		if ($(this).val() == '') {
			elem.css({display: 'block'});
		}
		else {
			elem.css({display: 'none'});
		}
	});
	
	$('body').on('click','.h-action-upload-file',function() {
		var thisBtn = $(this);
		var opt = thisBtn.actionParams();	
		if (opt.select) {
			var selectionId = $(opt.select.from).selectionInList(opt.select);
			if (selectionId == null || selectionId == '') {
				return;
			}
			opt.params = opt.params == null ? [] : opt.params;
			opt.params.push({
				name: 'id',
				value: selectionId
			});
		}
		var id = 'upload_' + H.id();
		var html = [
			'<form id="',id ,'" enctype="multipart/form-data" style="display: none;">',
			'<input name="file" type="file" />',
			'</form>'
		];	
		
		$('body').append(html.join(''));	
		var form = $('#' + id);
		var inputField = form.find('input[name=file]');

		if (opt.params) {
			for (var i = 0; i < opt.params.length; i++) {
				form.append('<input name="' + opt.params[i].name + '" value="' + opt.params[i].value + '">');
			}
		}
		if (opt.anteprima) {
			form.append('<input name="anteprima" value="1">');
		}
		var box = $('<div />');

		inputField.fileupload({
			url: opt.url,
			dataType: 'json',
			add: function (e, data) {
				var valido = true;
				var fileName = inputField.val();
				if (opt.fileType) {
					var i = fileName.lastIndexOf('.');
					if (i > 0) {
						var estensione = fileName.substr(i+1).toLowerCase();
						var trovato = false;
						for (var i = 0; i < opt.fileType.length && !trovato; i++) {
							if (opt.fileType[i] == estensione) {
								trovato = true;
							}
						}
						if (!trovato) {
							H.alert({
								message: 'Inserire un formato valido: ' + opt.fileType.join(', '),
								closeBtn: 'Ok'
							});
							valido = false;
						}
					}
					else {
						valido = false;
					}
				}
				if (valido) {
					var html = [
						'<div class="h-layout-content-wrapper h-layout-show-topbar h-layout-show-bottombar">',
							'<div class="h-layout-topbar">',
								'<div class="h-layout-content-wrapper">',
									'Upload file',
								'</div>',
							'</div>',
							'<div class="h-layout-content">',
								'<div class="h-layout-content-padding">',
								'Caricamento file in corso, non aggiornare la pagina, attendere il caricamento.',
								'<div class="progress">',
									'<div class="progress-line-wrapper">',
										'<div class="progress-line"></div>',
									'</div>',
									'<div class="progress-text">0%</div>',
								'</div>',
								'</div>',
							'</div>',
							'<div class="h-layout-bottombar">',
								'<div class="h-layout-content-wrapper h-alert-button-bar">',
								'<a href="javascript:void(0);" class="h-bar-button h-bar-button-blu h-close-box">Annulla upload</a>',							
								'</div>',
							'</div>',
						'</div>'
					];
					
					box.html(html.join('')).box({
						width: 300,
						height: 200,
						overlay: true,
						onClose: function() {
							data.abort();						
						}
					});
						
					data.submit();
				}
				else {
					data.abort();
				}
			},      
			start: function (e) {
			}, 			
			fail: function (e) {
				box.box('close', false);
				form.remove();
				
				H.alert({
					message: 'ERRORE:<br>errore nel caricamento del file, impossibile procedere',
					closeBtn: 'Ok'
				});
			}, 
			done: function (e, data) {
				data = data.result;	
				if (data.data) {
					$.each(data.data, function(k, v) {
						data[k] = v;
					});
				}
				
				box.box('close', false);
				form.remove();				
				if (data.success) {
					if (thisBtn.closest('.field-line-image').length > 0 && data.fileName) {
						thisBtn.closest('.field-line-image').find('.field-anteprima').attr('src', data.tempThumbImage);
						thisBtn.closest('.field-line-image').find('.field-file').val(data.tempFile);
						thisBtn.closest('.field-line-image').attr('data-file', data.tempFile);
						thisBtn.closest('.field-line-image').find('.field-file').trigger('blur');
						thisBtn.closest('.field-line-image').find('.field-file-name').val(data.fileName);
					}
					else if (thisBtn.closest('.field-line-file').length > 0 && data.fileName) {
						thisBtn.closest('.field-line-file').find('.field-anteprima').html(data.fileName);
						thisBtn.closest('.field-line-file').find('.field-file').val(data.tempFile);
						thisBtn.closest('.field-line-file').find('.field-file').trigger('blur');
						thisBtn.closest('.field-line-file').find('.field-file-name').val(data.fileName);
					}
					
					if (data.message == null || data.message == '') {
						data.message = 'Upload completato con successo';
					}
					$('body').message({message: data.message, type: 'confirm'});
					if (opt.onComplete) {
						if (opt.onComplete.reload && opt.onComplete.reload != '-') {
							if (typeof opt.onComplete.reload == 'string') {
								opt.onComplete.reload = [opt.onComplete.reload];
							}
							for (var i = 0; i < opt.onComplete.reload.length; i++) {
								$(opt.onComplete.reload[i]).loadWindow();
							}
						}
						else if (opt.onComplete.callback) {
							if (H.callback[opt.onComplete.callback] != null) {
								H.callback[opt.onComplete.callback](thisBtn, data);
							}
						}
					}
				}
				else {
					if (data.message == null) {
						H.alert({
							message: 'ERRORE:<br>File troppo grande, massimo consentito 100MB',
							closeBtn: 'Ok'
						});
					}
					else {
						H.alert({
							message: 'ERRORE:<br>' + data.message,
							closeBtn: 'Ok'
						});
					}
				}

			},
			progressall: function (e, data) {
				var width = Math.round(data.loaded * 100 / data.total);
				if (width > 100) {
					width = 100;
				}
				else if (width < 1) {
					width = 1
				}
				if (width == 100) {
					$('.progress').html('<span>elaborazione immagine in corso</span>');
				}
				else {
					$('.progress-line').css({width: (width*2) + 'px'});
					$('.progress-text').html(width + '%');
				}
			}
		});
		
		inputField.click();		
	});
});