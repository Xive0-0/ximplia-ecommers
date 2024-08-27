(function( $ ){	
	$.fn.showIf = function() {
		$(this).each(function() {
			var $this = $(this);
			var cont = $this.closest('.h-show-if-content');
			var opt = $this.actionParams();

			function show() {
				var toShow = null;
				for (var i = 0; i < opt.map.length; i++) {
					if (opt.map[i].key == $this.val()) {
						toShow = opt.map[i].cont;
					}
					for (var j = 0; j < opt.map[i].cont.length; j++) {
						cont.find(opt.map[i].cont[j]).css({display: 'none'});
					}
				}
				if (toShow != null) {
					for (var j = 0; j < toShow.length; j++) {
						cont.find(toShow[j]).css({display: 'block'});
					}
				}
			}
			show();
			$this.on('change', show);
		});
	};

	$.fn.chart = function() {
		var $this = $(this);
		if ($this.length == 0) {
			return;
		}

		function init() {
			$this.each(function() {
				var opt = $(this).actionParams();
				var type = opt.type;
				switch(type) {
				case 'linea':
					var chart_class = google.visualization.LineChart;
					if (opt.options.chartArea == null) {
						opt.options.chartArea = {left: '5%'};
					}
					break;
				case 'torta':
					var chart_class = google.visualization.PieChart;
					opt.options.chartArea = {width: '100%'};
					break;					
				case 'colonna':
					var chart_class = google.visualization.ColumnChart;
					opt.options.chartArea = {width: '85%'};
					break;				
				case 'barre':
					var chart_class = google.charts.Bar;
					opt.options.bars = 'horizontal';
					opt.options.chart = {title: opt.options.title};
					break;
				}
				var html = $(this).html();
				$(this).html('');
				$(this).css({display: 'block'});
				$(this).closest('.h-chart-wrapper').css({display: 'block'});
				var data = eval(html);
				data = google.visualization.arrayToDataTable(data);

				if (opt.format_euro) {
					var formatter = new google.visualization.NumberFormat({fractionDigits: 2, decimalSymbol: ',', groupingSymbol: '.'});
					formatter.format(data, 1);
				}
				
				var chart = new chart_class($(this)[0]);
				chart.draw(data, opt.options);
			});
		}
		if ($.fn.google_chart_is_loaded) {
			init();
		}
		else {
			$.fn.google_chart_is_loaded = true;
			google.charts.load('current', {'packages':['corechart', 'bar']});
			google.charts.setOnLoadCallback(init);	
		}
	};
	
	$.fn.calcoloScontoPercentualeEuro = function() {
		return $(this).each(function() {
			var $this = $(this);
			var separatore_decimali = $this.closest('.h-calcolo-sconto-percentuale-euro-wrapper').attr('separatore-decimali');
			if (separatore_decimali == null || separatore_decimali == '') {
				separatore_decimali = ',';
			}
			var separatore_migliaia = $this.closest('.h-calcolo-sconto-percentuale-euro-wrapper').attr('separatore-migliaia');
			if (separatore_migliaia == null || separatore_migliaia == '') {
				separatore_migliaia = '.';
			}
			var spedizione = $this.closest('.h-calcolo-sconto-percentuale-euro-wrapper').find('[data-type-sconto="spedizione"]');
			var prezzo = $this.closest('.h-calcolo-sconto-percentuale-euro-wrapper').find('[data-type-sconto="prezzo"]');
			var sconto_percentuale = $this.find('[data-type-sconto="sconto_percentuale"]');
			var sconto_euro = $this.find('[data-type-sconto="sconto_euro"]');
			var prezzo_scontato = $this.find('[data-type-sconto="prezzo_scontato"]');
			var num_decimali = prezzo_scontato.attr('data-num-dec');
			if (num_decimali == null || num_decimali == '' || isNaN(num_decimali)) {
				num_decimali = 2;
			}
			else {
				num_decimali = parseInt(num_decimali);
			}
			
			function put_float(elem, orig_value, format_euro, numero_decimali_forzato) {
				numero_decimali_forzato = numero_decimali_forzato == null ? num_decimali : numero_decimali_forzato;
				var value = '' + orig_value;
				value = value.replace('.', ',');
				var part = value.split(',');
				if (format_euro && part.length == 1) {
					if (numero_decimali_forzato > 0) {
						value += separatore_decimali;
						for (var i = 0; i < numero_decimali_forzato; i++) {
							value += '0';
						}
					}
				}
				else {
					if (part.length == 1) {
						value = part[0];
						if (format_euro) {
							value += separatore_decimali + '00';
						}
					}
					else {
						if (part[1].length > numero_decimali_forzato) {
							var c = Math.pow(10, numero_decimali_forzato);
							var orig_value = Math.round(orig_value * c) / c;
							value = '' + orig_value;
							value = value.replace('.', ',');
							part = value.split(',');
						}
						if (format_euro) {
							for (var i = (part[1] + '').length; i < numero_decimali_forzato; i++) {
								value += '0';
							}
						}
					}
				}
				elem.val(value);
			}
			
			function get_float(elem) {
				var val = H.Utility.trim(elem.val());
				if (val == '') {
					return 0;
				}
				val = val.replace(separatore_migliaia, '');
				val = val.replace(separatore_decimali, '.');
				if (isNaN(val)) {
					return 0;
				}
				return parseFloat(val);
			}
			
			function ricalcola_prezzo() {
				var val_prezzo = get_float(prezzo);
				var val_sconto_percentuale = get_float(sconto_percentuale);

				var val_sconto_euro = val_prezzo * (val_sconto_percentuale / 100);
				var val_prezzo_scontato = val_prezzo - val_sconto_euro;
				put_float(sconto_euro, val_sconto_euro, true);
				put_float(prezzo_scontato, val_prezzo_scontato, true);				
			}
			
			spedizione.on('blur', function() {
				var val_spedizione = get_float(spedizione);
				var val_prezzo = get_float(prezzo) + val_spedizione;
				put_float(prezzo, val_prezzo, true);
				ricalcola_prezzo();
			});
			prezzo.on('blur', ricalcola_prezzo);
			sconto_percentuale.on('blur', ricalcola_prezzo);
			sconto_euro.on('blur', function() {
				var val_prezzo = get_float(prezzo);
				var val_sconto_euro = get_float(sconto_euro);
				
				var val_sconto_percentuale = (100 * val_sconto_euro) / val_prezzo;
				var val_prezzo_scontato = val_prezzo - val_sconto_euro;
				put_float(prezzo_scontato, val_prezzo_scontato, true);
				put_float(sconto_percentuale, val_sconto_percentuale, false, 3);
			});			
			prezzo_scontato.on('blur', function() {
				var val_prezzo = get_float(prezzo);
				var val_prezzo_scontato = get_float(prezzo_scontato);
				var val_sconto_euro = val_prezzo - val_prezzo_scontato;
				
				var val_sconto_percentuale = (100 * val_sconto_euro) / val_prezzo;
				var val_prezzo_scontato = val_prezzo - val_sconto_euro;
				put_float(sconto_euro, val_sconto_euro, true);
				put_float(sconto_percentuale, val_sconto_percentuale, false, 3);
			});

			ricalcola_prezzo();
		});
	};
	$.fn.submitEditTableData = function() {
		var $this = $(this);
		var opt = $this.closest('.h-edit-table').actionParams();
		
		var closest = $this.closest('.h-edit-table-field-value-change');
		if (closest.length == 0) {
			return;
		}
		var data_value = $this.attr('data-id');
		if (data_value == null || data_value == '') {
			data_value = $this.html();
		}
		
		var id = $this.closest('tr').attr('data-id');
		H.ajax(opt.editTable.url, {
			data: {
				id: id,
				key: $this.attr('data-key'),
				value: data_value
			},
			success: function(data) {
				closest.removeClass('h-edit-table-field-value-change');
				closest.addClass('h-edit-table-field-value-change-saved');
			},
			error: function() {
				$('body').message({message: 'Errore salvataggio dati, connessione non disponibile, verrà effettuato un nuovo tentativo tra 10 secondi', type: 'error'});
				setTimeout(function() {
					$this.submitEditTableData();
				}, 10000);
			}
		});
	};
	$.fn.editTable = function() {
		$(this).each(function() {
			var $this = $(this);
			var list = [];
			$this.find('tbody tr').not('.h-edit-table-set').each(function() {
				var row = $(this);
				row.addClass('h-edit-table-set');
				row.find('.h-edit-table-value').each(function() {
					var value = $(this);
					var td = $(this).closest('td');
					td.addClass('h-edit-table-cell-edit-mode');
					if (td.hasClass('h-edit-table-cell-edit-view')) {
						return;
					}
					var type = value.attr('data-type');
					var typeKey = type;
					if (type == null || type == '') {
						type = 'input';
					}
					else {
						type = type.split('-')[0];
					}
					if (type == 'combo') {
						value.html($('.h-edit-table-combo[data-type=' + typeKey + '] option[value="' + value.text() + '"]').text());
					}
					
					td.on('click', function() {
						var field = $(this).find('.h-edit-table-cell-field');
						if (field.length == 0) {
							field = $('<div class="h-edit-table-cell-field" />');
							td.append(field);
							switch(type) {
							case 'combo':
								var input = $('.h-edit-table-combo[data-type=' + typeKey + ']').html();
								input = $(input);
								input.on('change', function() {
									if (value.attr('data-id') != $(this).val()) {
										td.removeClass('h-edit-table-field-value-change-saved');
										td.addClass('h-edit-table-field-value-change');
									}
									value.attr('data-id', $(this).val());
									value.html($(this).find( "option:selected" ).text());
									value.submitEditTableData();
									field.trigger('edit-table-value-change', [input]);
								});
								var gap = 1;
								break;
							default:
								var gap = 10;
								var input = $('<input type="text" name="edit_value">');
								input.on('blur', function() {
									if (value.html() != $(this).val()) {
										td.removeClass('h-edit-table-field-value-change-saved');
										td.addClass('h-edit-table-field-value-change');
									}
									value.html($(this).val());
									value.submitEditTableData();
									field.trigger('edit-table-value-change', [input]);
								});
							}
							field.append(input);
							input.css({width: field.innerWidth() - gap});
							input.on('blur', function() {
								td.removeClass('h-edit-table-cell-field-enable');
							});
						}
						else {
							var input = field.find('[name=edit_value]');
						}
						var data_value = value.attr('data-id');
						if (data_value == null || data_value == '') {
							data_value = value.html();
						}
						td.addClass('h-edit-table-cell-field-enable');
						input.focus();
						input.val(data_value);
					});
				});
				setTimeout(function() {
					row.trigger('edit-table-set-row');
				}, 5);				
			});
		});
		return $(this);
	};
	
	$.fn.manualScrollItems = function(cls) {
		$(this).each(function() {
			var $this = $(this);
			var width = 0;
			var widthItem = 0;
			$this.find(cls).each(function() {
				if (widthItem == 0) {
					widthItem = $(this).outerWidth(true);
				}
				width += widthItem;
			});
			var wrapper = $this.outerWidth(true);
			if (wrapper < width) {
				$this.find('.manualscroll-list').css({width: (width + 80) + 'px'});
				var btnLeft = $('<div class="manualscroll-arrow-left"></div>');
				var btnRight = $('<div class="manualscroll-arrow-right"></div>');
				$this.parent().append(btnLeft);
				$this.parent().append(btnRight);
				var animationActive = false;
				btnRight.on('click', function() {
					if (animationActive) {
						return;
					}
					animationActive = true;
					var scrollLeft = $this.scrollLeft() + widthItem;				
					$this.animate({scrollLeft: scrollLeft + 'px'}, 500, function() {
						if ($this.scrollLeft() > 0) {
							btnLeft.css({display: 'block'});
						}
						if ((width - wrapper) <= $this.scrollLeft()) {
							btnRight.css({display: 'none'});
						}
						animationActive = false;
					});
				});
				btnLeft.on('click', function() {
					if (animationActive) {
						return;
					}
					animationActive = true;
					var scrollLeft = $this.scrollLeft() - widthItem;		
					$this.animate({scrollLeft: scrollLeft + 'px'}, 500, function() {
						if ($this.scrollLeft() <= 0) {
							btnLeft.css({display: 'none'});
						}
						btnRight.css({display: 'block'});
						animationActive = false;
					});
				});
				btnRight.css({display: 'block'});
			}
		});
		return $(this);			
	};
	
	$.fn.tree = function (opt) {
		function genera(map, id, cont) {
			var list = map[id];
			if (list != null) {
				var ul = $('<ul/>');
				for (var i = 0; i < list.length; i++) {
					var li = $('<li/>');
					li.append(list[i]);
					ul.append(li);
					genera(map, list[i].attr('data-id'), li);
				}
				cont.append(ul);
			}
		}
	
		var map = [];
		$(this).find('.tree-item').each(function (){
			var parentId = $(this).attr('data-parent-id');
			if (map[parentId] == null) {
				map[parentId] = [];
			}
			map[parentId].push($(this));
		});
		genera(map, '0', $(this));
		
		$(this).find('.tree-item').each(function (){
			$(this).parent().addClass('tree-item-wrapper');
			var arrow = $('<span class="tree-arrow"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/><path d="M0 0h24v24H0z" fill="none"/></svg></span>');
			if ($(this).find('.tree-arrow-content').length) {
				var cont_arrow = $(this).find('.tree-arrow-content');
			}
			else {
				var cont_arrow = $(this).prepend(arrow);
			}
			cont_arrow.prepend(arrow);
			if ($(this).hasClass('tree-item-principale')) {
				var value = $(this).closest('.tree-item').find('.h-checkbox').attr('data-value');
				var input_name = $(this).closest('.tree-item').find('.h-checkbox input').attr('name');
				principale = $('<span class="tree-radio-principale" data-value="' + value + '"><input type="hidden" value="" name="tree_principale_' + input_name + '"></span>');
				cont_arrow.prepend(principale);
				principale.click(function() {
					$(this).closest('.tree').find('.tree-item-principale-line').removeClass('tree-item-principale-line');
					if ($(this).hasClass('checked')) {
						$(this).removeClass('checked');
						$(this).find('input').val('');
					}
					else {
						$(this).closest('.tree').find('.tree-radio-principale.checked input').val('');
						$(this).closest('.tree').find('.tree-radio-principale.checked').removeClass('checked');
						$(this).addClass('checked');
						$(this).find('input').val($(this).attr('data-value'));
						$(this).closest('.tree-item').addClass('tree-item-principale-line');
						$(this).parents('.tree-item-wrapper').each(function() {
							$(this).find('.tree-item').first().addClass('tree-item-principale-line');
						});						
					}
				});
			}
			
			if ($(this).closest('li').find('ul').length == 0) {
				arrow.addClass('tree-arrow-void');
			}
			else {
				$(this).next('ul').css({display: 'none'});
				arrow.click(function() {
					if ($(this).hasClass('show')) {
						var display = 'none';
						$(this).removeClass('show');
					}
					else {
						var display = 'block';
						$(this).addClass('show');
					}
					$(this).closest('.tree-item').next('ul').css({display: display});
				});
			}
		});

		var id_principale = $(this).attr('data-id-principale');
		if (id_principale != null && id_principale != '') {
			$(this).find('.tree-radio-principale[data-value=' + id_principale + ']').click();
		}
		
		if ($(this).hasClass('tree-level-onlyone') ||
			$(this).hasClass('tree-level-onlyone-multiple')) {
			var sel = $(this).find('.h-checkbox-checked');
			if (sel.length > 0) {
				var continua = false;
				do {
					continua = false;
					sel = sel.closest('ul');
					if (sel.length > 0) {
						sel = sel.prev('.tree-item');
						if (sel.length > 0) {
							sel = sel.find('.tree-arrow');
							if (sel.length > 0) {
								sel.click();
								continua = true;
							}
						}
					}
				}
				while (continua);
			}
		}
		var id_hide = $(this).attr('data-tree-id-hide');
		if (id_hide != null && id_hide != '') {
			$(this).find('.tree-item[data-id=' + id_hide + ']').css({display: 'none'});
		}
		
		if ($(this).closest('.tree-explode').length > 0) {
			$(this).find('.tree-arrow').trigger('click');
		}
	};
	
	$.fn.filterList = function () {
		var $this = $(this);
		var opt = $this.actionParams();
		var loadWin = $(opt.load);
		var inLoading = false;
		var to_loading = 0;
		
		function loadData() {
			var loadParams = {
				filter_list: $this.val()
			};
			var oldLoadParams = loadWin.attr('data-load-params');
			if (oldLoadParams != null && oldLoadParams != '') {
				oldLoadParams = $.parseJSON(oldLoadParams);
				loadParams = $.extend(oldLoadParams, loadParams);
			}
			loadWin.attr('data-load-params', JSON.stringify(loadParams));
			loadWin.loadWindow();
		}
		
		$this.closest('.h-filter-list-wrapper').find('.h-action-filter-list-azzera').on('click', function() {
			$this.val('');
			if (inLoading) {
				return;
			}
			inLoading = true;
			to_loading = 0;
			loadData();
		});
		
		loadWin.on('window-load-complete', function() {
			if (to_loading > 0) {
				to_loading = 0;
				loadData();
			}
			else {
				inLoading = false;
			}
		});
		
		$(this).on('keyup', function() {
			if (inLoading) {
				to_loading++;
				return;
			}
			inLoading = true;
			loadData();
		});
	};
	
	$.fn.autocomplete = function (opt) {	
		var isInUse = false;
		var isInLoading = false;
		var opt = $(this).actionParams();
		opt.extra = opt.extra == null ? true : opt.extra;
		opt.callbackDelete = opt.callbackDelete == null ? '' : opt.callbackDelete;
		$(this).parent().css({position: 'relative'});
		
		$(this).focus(function() {
			$(this).parent().find('.autocomplete-content').remove();
			$(this).parent().find('.autocomplete-content-value').remove();
		});
		$(this).blur(function() {
			if (isInUse) {
				return;
			}
			isInLoading = false;
			$(this).parent().find('.autocomplete-content').remove();
			$(this).parent().find('.autocomplete-content-value').remove();
		});
		
		var _bufferData = '';
		function loadOnKeyUp($this, val) {
			val = H.Utility.trim(val);
			if (isInLoading) {
				_bufferData = val;
				return;
			}
			isInLoading = true;
			isInUse = true;
			var $parent = $this.parent();
			var result = $parent.find('input[type=hidden]:not(.fix)');
			result.val('');
			
			var content = $parent.find('.autocomplete-content');
			if (content.length == 0) {
				content = $('<div class="autocomplete-content"/>');
				$parent.append(content);
				content.css({
					top: $parent.height() + 'px',
					width: $this.width() + 'px',
					height: '100px'
				});
			}
			content.html('');
			$parent.find('.autocomplete-content-value').remove();
			
			opt.add_item_id = opt.add_item_id == null ? 'id_articolo' : opt.add_item_id;
			function load_data() {
				content.loading();

				opt.params = opt.params == null ? {} : opt.params;
				opt.params[$this.attr('name')] = val;
				var add_params = $this.parent().find('[name="add_params"]');
				if (add_params.length > 0) {
					opt.params.add_params = add_params.val();
				}
				H.ajax(opt.url, {
					data: opt.params,
					success: function(data) {
						isInLoading = false;
						content.loading(false);
						if (data.success) {
							var val_list = val.split(' ');
							for (var i = 0; i < data.list.length; i++) {
								var text = data.list[i].text;
								for (var j = 0; j < val_list.length; j++) {
									text = text.replace(RegExp(val_list[j], 'gi') , '<span>' + val_list[j] + '</span>');
								}
								content.append('<div class="autocomplete-content-item" data-id="' + data.list[i].id + '" data-codice="' + data.list[i].codice + '" data-value="' + data.list[i].value + '">' + text + '</div>');
							}
							content.find('.autocomplete-content-item').click(function() {
								var result_id = $(this).attr('data-id');
								result.val(result_id);
								$this.val($(this).attr('data-value'));
								if (opt.add_item_to == null) {
									if (opt.extra && $(this).attr('data-value') != $(this).html()) {
										$parent.append('<div class="autocomplete-content-value">' + $(this).html() + '</div>');
									}	
								}
								else {
									if (opt.remove_item) {
										$(opt.add_item_to).find('.autocomplete-content-value-block').remove();
									}
									else {
										$(opt.add_item_to).find('.autocomplete-content-value-block[data-id="' + $(this).attr('data-id') + '"]').remove();
									}
									$(opt.add_item_to).append('<div class="autocomplete-content-value-block hrow remove-current-element-wrapper" data-id="' + $(this).attr('data-id') + '">' + 
										'<input type="hidden" name="' + opt.add_item_id + '[]" value="' + $(this).attr('data-id') + '">' +
										'<em class="action-remove-current-element" data-event="' + opt.callbackDelete + '" data-id="' + opt.add_item_id + '"></em>' + 
										'<div class="autocomplete-content-value-details' + (opt.qta ? ' autocomplete-content-value-details-qta' : '') + '"><strong>' + $(this).attr('data-codice') + '</strong>' + 
										'<span>' + $(this).attr('data-value') + '</span>' + 
										(opt.qta ? '<input type="text" name="' + opt.add_item_id + '_qta_' + $(this).attr('data-id') + '" value="0" class="valida-digitint" placeholder="Qta." maxlength="3">' : '') + 
										'</div></div>');
									$this.val('');
								}
								content.remove();
								isInUse = false;
								if (opt.callbackSelection) {
									$('body').trigger(opt.callbackSelection, [$this, result_id]);
								}
								if (opt.window) {
									$this.window();
								}
							});
							if (_bufferData.length > 0) {
								val = _bufferData;
								_bufferData = '';
								loadOnKeyUp($this, val);
							}
						}
						else {
							$('body').message({message: 'Errore caricamento dati', type: 'error'});
						}
					},
					failure: function() {
						isInLoading = false;
						content.loading(false);
						$('body').message({message: 'Errore caricamento dati', type: 'error'});
					}
				});			
			}	
			load_data()
		}
		
		$(this).on('keyup', function() {
			loadOnKeyUp($(this), $(this).val());
		});
		if (opt.add_item_to && opt.load_item_id != null && opt.load_item_id.length > 0) {
			H.ajax(opt.url, {
				data: {
					load_item_id: opt.load_item_id
				},
				success: function(data) {
					if (data.success) {
						for (var i = 0; i < data.list.length; i++) {							
							$(opt.add_item_to).append('<div class="autocomplete-content-value-block hrow remove-current-element-wrapper">' + 
								'<input type="hidden" name="' + opt.add_item_id + '[]" value="' + data.list[i].id + '">' +
								'<em class="action-remove-current-element"  data-event="' + opt.callbackDelete + '" data-id="' + opt.add_item_id + '"></em>' + 
								'<div class="autocomplete-content-value-details"><strong>' + data.list[i].codice + '</strong>' + 
								'<span>' + data.list[i].value + '</span>' + 
								'</div></div>');
						}
					}
					else {
						$('body').message({message: 'Errore caricamento dati', type: 'error'});
					}
				},
				failure: function() {
					$('body').message({message: 'Errore caricamento dati', type: 'error'});
				}
			});
		}
	};
	
	$.fn.fixedTableHeader = function (params) {
		var t = $(this);
		
		if (params != null) {
			switch(params) {
				case 'update-position':
					var left = parseInt($('#h-layout-center').css('left'));
					var right = parseInt($('#h-layout-center').css('right')) + 16;
					t.parent().css({left: left + 'px', right: right + 'px'});
					return;
			}
			return;
		}
		
		var left = parseInt($('#h-layout-center').css('left'));
		var right = parseInt($('#h-layout-center').css('right')) + 16;
				
		var fixed_table = $('<table class="h-list-fixed-header" cellpadding="0" cellspacing="0" border="0"></table');
		if (t.hasClass('h-edit-table')) {
			fixed_table.addClass('h-edit-table');
		}
		
		var fixed_cont = $('<div style="box-shadow: 0 5px 5px rgba(0, 0, 0, 0.1); z-index: 10;"/>').css({display:'none', position:'fixed', left: left + 'px', top:'90px', right: right + 'px'});
		t.parent().append(fixed_cont.append(fixed_table.append(t.find('thead').clone())));

		var width_zero = null;
		fixed_table.find('th').each(function (i) {
			var width = t.find('th').eq(i).width();
			$(this).width(width <= 0 ? 'auto' : width);
		});

		t.parent().scroll(function() {
			if ($(this).scrollTop() > 0) {
				fixed_cont.show();
			}
			else {
				fixed_cont.hide();
			}
		});
	};
	
	$.fn.autoupdate = function(param) {
		if (param != null) {
			switch(param) {
				case 'reset':
					$(this).trigger('autoupdate-reset');
					break;
			}
			return;
		}
		var opt = $(this).actionParams();
		opt.numberElemsToLoad = opt.numberElemsToLoad == null ? 50 : opt.numberElemsToLoad;
		var loading = $('<div class="autoupdate-loading" style="text-align: center; margin: 10px;"><img src="' + H.imagesUrl + '/loading.gif" alt="loading"></div>');
		loading.css({display: 'none'});
		$(this).append(loading);
		
		function updateElementsHeight() {
			var sum = 0;
			$this.find('tr').each(function() {
				sum += $(this).find('td').eq(0).outerHeight();
			});
			opt.elementsHeight = sum;
		}
		

		var inLoading = false;
		function loadOtherElements(num) {
			if (inLoading) {
				return;
			}
			inLoading = true;
			loading.css({display: 'block'});
			
			if (num == null || num < opt.numberElemsToLoad) {
				num = opt.numberElemsToLoad;
			}
			
			var params = {
				start: opt.numElems,
				number: num			
			};
			if (opt.params) {
				params = $.extend(params, opt.params);
			}
			var addParams = $this.attr('data-load-params');
			if (addParams != null && addParams != '') {
				var obj = $.parseJSON(addParams);
				params = $.extend(obj, params);
			}
			addParams = $this.attr('data-load-order');
			if (addParams != null && addParams != '') {
				params.order_by = addParams;
				params.order_type = $this.attr('data-load-order-type');
			}
			
			H.ajax(opt.url, {
				data: params,
				dataType: 'html',
				success: function(data) {
					loading.css({display: 'none'});
					opt.content.append($(data).find('.item-autoload'));
					updateNumElems();
					updateHeightWrapper();
					updateElementsHeight();
					
					var table = null;
					if ($this.hasClass('.h-edit-table')) {
						table = $this;
					}
					else {
						table = $this.find('.h-edit-table');
						if (table.length == 0) {
							table = $this.closest('.h-edit-table');
						}
					}
					if (table != null && table.length > 0) {
						table.editTable();
					}
					inLoading = false;
				},
				failure: function() {
					loading.css({display: 'none'});
					inLoading = false;
				}
			});
		}
		function updateHeightWrapper() {
			opt.height = $(window).height() - 110;
		}
		function updateNumElems() {
			opt.numElems = $this.find('.item-autoload').length;
		}
		function updateTotElems() {
			var cont = $this.find('.item-autoload-total');
			if (cont.length > 0) {
				opt.totalElems = parseInt(cont.attr('data-total'));
			}
			else {
				opt.totalElems = 0;
			}
		}
		
		function fillSpace() {
			if (opt.numElems < opt.totalElems && opt.height > opt.elementsHeight) {
				var elemHeight = opt.elementsHeight / opt.numElems;
				var num = Math.round(((opt.height - opt.elementsHeight) / elemHeight) * 1.5) + 1;
				inLoading = false;
				loadOtherElements(num);
			}
		}
		
		var $this = $(this);
		
		function reset() {
			inLoading = false;
			opt.content = $this.find('table.h-list');
			updateNumElems();		
			updateHeightWrapper();
			updateElementsHeight();
			updateTotElems();
			$this.scrollTop(0);
			fillSpace();
		}
		reset();

		$this.on('scroll',function() {
			if (opt.numElems >= opt.totalElems) {
				return;
			}
			if (inLoading) {
				return;
			}
			var sth = 1.5 * ($(this).scrollTop() + opt.height);
			if (sth > opt.elementsHeight) {
				loadOtherElements();
			}
		});
		
		$(window).resize(function() {
			updateHeightWrapper();
			fillSpace();
		});
		$this.on('autoupdate-reset', function() {
			reset();
		});
	};
	
	$.fn.addClassCheckHas = function(cls) {
		if ($(this).hasClass(cls)) {
			$(this).removeClass(cls);
		}
		else {
			$(this).addClass(cls);
		}
		return $(this);
	};
	
	$.fn.alttext = function() {
		var value = $(this).attr('data-alttext');
		if (value == '') {
			return;
		}
		var alt = $('<div class="h-alttext-wrapper"><div class="h-arrow-up-alt"></div><div class="h-alttext">' + value + '</div></div>');
		$('body').append(alt);
		var offset = $(this).offset();
		var left = offset.left + $(this).outerWidth() / 2 - alt.outerWidth() / 2;
		var leftArrow = (alt.outerWidth() - 16) / 2;
		if (left + alt.outerWidth() > $(document).width() - 5) {
			left = $(document).width() - 5 - alt.outerWidth();
			leftArrow = offset.left - left - 8 + $(this).outerWidth() / 2;
		}
		else if (left < 0) {
			left = 5;
			leftArrow = offset.left - 12 + $(this).outerWidth() / 2
		}
		alt.css({top: (offset.top + $(this).outerHeight()) + 'px', left: left + 'px'});
		alt.find('.h-arrow-up-alt').css({left: leftArrow + 'px'});
	};
	
	$.fn.layout = function(params) {
		if (params.show) {
			if (typeof params.show === 'string') {
				params.show = [params.show];
			}
			for (var i = 0; i < params.show.length; i++) {
				$(this).addClass('h-layout-show-' + params.show[i]);
			}
		}
		if (params.hide) {
			if (typeof params.hide === 'string') {
				params.hide = [params.hide];
			}
			for (var i = 0; i < params.hide.length; i++) {
				$(this).removeClass('h-layout-show-' + params.hide[i]);
			}
		}
		
		$('.h-list-fixed-header').each(function() {
			$(this).fixedTableHeader('update-position');
		});
		
		return $(this);
	};
	
	$.fn.positionTo = function(to) {
		var offset = to.offset();
		$(this).css({top: (offset.top + to.outerHeight()) + 'px', left: offset.left + 'px'});
		return $(this);
	};
	$.fn.background = function() {
		$(this).attr('data-layer-index', '');
		$(this).fadeOut(300);
		return $(this);
	};
	$.fn.foreground = function() {
		var zIndex = 20;
		$('[data-layer-index]').each(function() {
			var curZIndex = $(this).attr('data-layer-index');
			if (curZIndex == null || curZIndex == '') {
				return;
			}
			curZIndex = parseInt($(this).attr('data-layer-index'));
			if (curZIndex > zIndex)	{
				zIndex = curZIndex;
			}
		});
		$(this).css({zIndex: zIndex});
		$(this).fadeIn(300);
		return $(this);
	};
	
	$.fn.loading = function(message) {
		if (typeof message === 'boolean') {
			if ($(this).hasClass('h-layout-loading')) {
				$(this).parent().removeClass('h-layout-inloading');
				$(this).remove();
			}
			else {
				$(this).removeClass('h-layout-inloading');
				$(this).find('.h-layout-loading').remove();
			}
			return;
		}
		var zIndex = 20;
		$('[data-layer-index]').each(function() {
			var curZIndex = $(this).attr('data-layer-index');
			if (curZIndex == null || curZIndex == '') {
				return;
			}
			curZIndex = parseInt($(this).attr('data-layer-index'));
			if (curZIndex > zIndex)	{
				zIndex = curZIndex;
			}
		});
		zIndex++;
		var obj = $('<div class="h-layout-loading"><div class="h-layout-loading-box"><img src="' + H.imagesUrl + '/loading.gif" alt="loading"><div class="h-layout-loading-message">' + (message == null ? 'loading...' : message) + '</div></div></div>');
		if ($(this).prop('tagName') == 'body') {
			obj.addClass('h-layout-loading-body');
		}
		obj.css({zIndex: zIndex});
		
		$(this).addClass('h-layout-inloading');
		$(this).append(obj);
		return obj;
	};
	$.fn.fieldError = function(message) {
		var text = $(this).find('.error-text');
		if (text) {
			text.remove();
		}
		if (typeof message === 'boolean') {
			$(this).removeClass('field-error');
			return;
		}
		$(this).addClass('field-error');
		$(this).find('label').append('<span class="error-text"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>' + message + '</span>');
		return $(this);		
	};
	$.fn.hload = function(manual) {
		manual = manual == null ? false : manual;
		$(this).each(function() {
			var opt = $(this).actionParams();
			opt.only_manual = opt.only_manual == null ? false : opt.only_manual;
			if (!manual && opt.only_manual) {
				return;
			}
			opt.check_is_load = opt.check_is_load == null ? false : opt.check_is_load;
			if (opt.check_is_load && $(this).attr('data-is-load') != null) {
				return;
			}
			$(this).attr('data-is-load', 'true');
			$(this).loadWindow();
		});
	};
	
	$.fn.loadWindow = function(opt) {
		if (opt == null) {
			opt = $(this).actionParams();
		}
		$(this).html('<img class="h-box-loading" src="' + H.imagesUrl + '/loading.gif" alt="loading">');
		opt.params = opt.params == null ? {} : opt.params;
		opt.params.start = $(this).attr('data-load-start');
		opt.params.number = $(this).attr('data-load-number');
		opt.params.order_by = $(this).attr('data-load-order');
		opt.params.order_type = $(this).attr('data-load-order-type');
		var addParams = $(this).attr('data-load-params');
		if (addParams != null && addParams != '') {
			var obj = $.parseJSON(addParams);
			opt.params = $.extend(obj, opt.params);
		}

		if (opt.submit_params != null) {
			$(opt.submit_params).find('input').each(function() {
				opt.params[$(this).attr('name')] = $(this).val();
			});
		}
		
		var $this = $(this);
		$(this).load(opt.url, opt.params, function() {
			$(this).inlineSvg();
			
			$(this).find('.google-wrapper-picker').googleMapPicker();
			$(this).find('.input-datepicker').datepicker({
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
			
			$(this).find('.h-fixed-header-table').each(function() {
				$(this).fixedTableHeader();
			});
			$(this).find('.h-action-update').each(function() {
				var opt = $(this).actionParams();
				$(opt.update).html($(this).html());
				$(this).remove();
			});
			$this.trigger('autoupdate-reset');
			if (opt.onComplete) {
				opt.onComplete($(this));
			}
			if ($this.attr('id') == 'h-layout-center-content') {
				$('.h-nav-list-count span').html($(this).find('.h-list').attr('data-total'));
			}
			$(this).find('.autocomplete').each(function() {
				$(this).autocomplete();
			});			
			$(this).find('.h-action-filter-list').each(function() {
				$(this).filterList();
			});
			$(this).find('.tree').each(function() {
				$(this).tree();
			});
			$(this).find('.h-chart').chart();
			$(this).find('.h-tab').tab();
			$(this).find('.block-tab').block_tab();
			
			$(this).find('.h-field-combo').combo();
			
			$(this).find('.visual-editor').each(function() {
				if ($(this).hasClass('visual-editor-page')) {
					var conf = H.config.redactor_page;
				}
				else {
					var conf = H.config.redactor;
				}				
				$R($(this).get(), conf);				
			});
			
			var table = null;
			if ($(this).hasClass('.h-edit-table')) {
				table = $(this);
			}
			else {
				table = $(this).find('.h-edit-table');
				if (table.length == 0) {
					table = $(this).closest('.h-edit-table');
				}
			}
			if (table != null && table.length > 0) {
				table.editTable();
			}
			$(this).find('.h-calcolo-sconto-percentuale-euro').calcoloScontoPercentualeEuro();

			$(this).find('.h-load').hload();

			$(this).find('.h-show-if').showIf();
			$(this).find('.message-center-block').each(function() {
				var type = $(this).data('message-center');
				if (type == '') {
					$(this).find('.message-center-block-expandible').remove();
					$(this).html('<strong style="color:#ed4747">Nessun sistema di invio comunicazione abilitato per questo tipo di comunicazione</strong>');
				}
				else if (type == 'no') {
					$(this).find('[data-type="sms"],[data-type="wapp"],[data-type="push"]').remove();
				}
				else {
					type = type.split(',');
					$(this).find('.message-center-block-expandible').each(function() {
						if (!type.includes($(this).data('type'))) {
							$(this).remove();
						}
					});
				}
				if ($(this).find('.message-center-block-expandible').length == 1) {
					$(this).find('.message-center-block-expandible-title').remove();
					$(this).find('.message-center-block-expandible-body').css({display: 'block'});
				}
			});
			
			$this.trigger('window-load-complete');
			if (opt.event) {
				$('body').trigger(opt.event + ':load', [$(this)]);
			}
			var extend = $(this).find('[data-width-extend]');
			if (extend.length > 0) {
				$(this).box('extend', extend.data('width-extend'));
			}
		});
	};
		
	$.fn.window = function(opt) {
		if (opt == null) {
			opt = $(this).actionParams();
		}
		if (opt.window) {
			opt = opt.window;
		}
		switch(opt.type) {
			case 'window':
				var url = opt.url + '?id=' + opt.params.id;
				if (opt.params.lang) {
					url += '&lang=' + opt.params.lang;
				}
				window.open(url, '');
				break;
			case 'layer':
				var obj = $('<div />');
				var width = opt.width == null ? ($(window).width() - 100) : opt.width;
				var height = opt.height == null ? ($(window).height() - 100) : opt.height;
				obj.box({width: width, height: height, overlay: opt.overlay});
				obj.loadWindow(opt);
				break;
			case 'slide-right':
				var obj = $('#h-layout-center .h-box-wrapper-right');
				if (obj.length == 0) {
					obj = $('<div />');
					obj.box({appear: 'right', content: '#h-layout-center', extend: opt.extend});
				}
				obj.loadWindow(opt);
				break;
			default:
				location.href = opt.url;
		}		
	};
	
	$.fn.message = function(params) {
		if (typeof params === 'string') {
			params = {message: params};
		}
		var wrapper = $('<div>' + params.message + '</div>');

		wrapper.addClass('h-message-wrapper-' + (params.type == null ? 'confirm' : params.type));
		wrapper.box({css: 'h-message-wrapper', appear: 'top', content: $(this)});
		wrapper.click(function () {
			wrapper.fadeOut(300, function() {
				$(this).remove();
			});
		});
		setTimeout(function() {
			wrapper.click();
		}, 8 * 1000);
	}
	
	$.fn.box = function(obj, params) {
		if (obj != null && typeof obj === 'string') {
			switch(obj) {
				case 'extend':
					if ($(this).hasClass('h-box-wrapper-right')) {
						$(this).animate({
								width: ($(this).outerWidth() + params) + 'px',
								marginLeft: ($(this).parent().outerWidth() - ($(this).outerWidth() + params))
							});
					}
					return;
				case 'show':
					$('#' + $(this).attr('data-win-id') + '_overlay').foreground();
					$(this).foreground();
					return;
				case 'hide':
					$('#' + $(this).attr('data-win-id') + '_overlay').background();
					$(this).background();
					return;
				case 'close':
					if (params == null || params) {
						$(this).trigger('box-close');
					}
					$('#' + $(this).attr('data-win-id') + '_overlay').fadeOut(300, function() {
						$(this).remove();
					});
					$(this).fadeOut(300, function() {
						$(this).remove();
					});
					return;
			}
			var wrapper = $(obj);
		}
		else {
			var wrapper = $(this);
			params = obj;
		}
		
		params = params == null ? wrapper.actionParams() : params;
		
		wrapper.addClass('h-box-wrapper');
		if (params.css) {
			wrapper.addClass(params.css);
		}
		var idWrapper = H.id();
		wrapper.attr('data-win-id', idWrapper);
		if (params.onClose) {
			wrapper.on('box-close', function() {
				params.onClose();
			});
		}
		var overlay = null;
		params.content = params.content == null ? 'body' : params.content;
		if (params.overlay) {
			overlay = $('<div/>');
			if (typeof params.overlay === 'boolean') {
				overlay.addClass('h-box-overlay');
			}
			else {
				overlay.addClass('h-overlay');
			}
			if (params.onOverlayClick) {
				overlay.click(function() {
					params.onOverlayClick();
				});
			}
			overlay.attr('id', idWrapper + '_overlay');
			overlay.foreground();
			$(params.content).append(overlay);
		}
		wrapper.foreground();
		$(params.content).scrollTop(0);
		$(params.content).append(wrapper);

		if (params.extend == null) {
			params.extend = 0;
		}
		else {
			if (params.extend === true) {
				params.extend = 100;
			}
		}
			
		switch (params.appear) {
			case 'top':
				wrapper.addClass('h-box-wrapper-top');
				wrapper.css({top: -wrapper.outerHeight(), display: 'block', position: 'absolute'});
				wrapper.animate({
						top: parseInt(wrapper.css('top'),10) == 0 ? -wrapper.outerHeight() : 0
					}, 300);
				break;
			case 'bottom':
				wrapper.addClass('h-box-wrapper-bottom');
				wrapper.css({top: wrapper.parent().outerHeight(), display: 'block', position: 'absolute'});
				wrapper.animate({
						top: (wrapper.parent().outerHeight() - (parseInt(wrapper.css('top'),10) == wrapper.parent().outerHeight() ? wrapper.outerHeight() : 0))
					}, 300);
				break;
			case 'right':
				if (params.extend) {
					wrapper.css({width: (wrapper.parent().outerWidth() - params.extend) + 'px'});
				}
				wrapper.addClass('h-box-wrapper-right');
				wrapper.css({marginLeft: wrapper.parent().outerWidth(), display: 'block', position: 'absolute'});
				wrapper.animate({
						marginLeft: (wrapper.parent().outerWidth() - (parseInt(wrapper.css('marginLeft'),10) == wrapper.parent().outerWidth() ? wrapper.outerWidth() : 0))
					}, 300);
				break;
			case 'left':
				if (params.extend) {
					wrapper.css({width: (wrapper.parent().outerWidth() - params.extend) + 'px'});
				}
				wrapper.addClass('h-box-wrapper-left');
				wrapper.css({left: -wrapper.outerWidth(), display: 'block', position: 'absolute'});
				wrapper.animate({
						left: parseInt(wrapper.css('left'),10) == 0 ? -wrapper.outerWidth() : 0
					}, 300);
				break;
			default:
				wrapper.addClass('h-popup-content');
				if (params.width) {
					wrapper.css({width: params.width + 'px'});
				}
				if (params.height) {
					wrapper.css({height: params.height + 'px'});
				}
				if (params.positionTo == null) {
					var width = wrapper.width();
					var height = wrapper.height();
					if (width > $(window).width()) {
						width = $(window).width() - 40;
					}
					if (height > $(window).height()) {
						height = $(window).height() - 40;
					}
					wrapper.css({top: '50%', left: '50%', marginTop: -(height/2) + 'px', marginLeft: -(width/2) + 'px'});
				}
				else {
					wrapper.positionTo(params.positionTo);
				}
				wrapper.fadeIn(300);
		}
		return wrapper;
	};
	
	$.fn.clearSelectionInList = function(opt) {
		$(this).find('.h-checkbox-checked').click();
	};
	$.fn.selectionInList = function(opt) {
		opt = opt == null ? $(this).actionParams() : opt;
		var message = null;
		var selected = $(this).find('.h-checkbox-checked:not(.h-checkbox-select-all)');
		if (opt.check == null || opt.check <= 0) {
			if (opt.check === 0 && selected.length <= 0) {
				message = opt.errorMessage == null ? 'Selezionare almeno un valore dall\'elenco' : opt.errorMessage;
			}		
		}
		else {
			if (opt.check != selected.length) {
				message = opt.errorMessage == null ? 'Selezionare ' + opt.check + ' valore dall\'elenco' : opt.errorMessage;
			}
		}
		if (message == null) {
			var list = [];
			selected.each(function() {
				list.push($(this).attr('data-value'));
			})
			return list.join(',');
		}
		$('body').message({message: message, type: 'error'});
		return null;
	};
	
	$.fn.execute = function (opt) {
		function reload(id) {
			
			var opt = $(id).actionParams();
			$(id).loadWindow(opt);
		}
	
		var opt = opt == null ? $(this).actionParams() : opt;
		var loadingWin = $('body').loading();
		H.ajax(opt.url, {
			data: opt.params,
			success: function(response) {
				if (opt.reload) {
					if (typeof opt.reload === 'string') {
						opt.reload = [opt.reload];
					}
					for (var i = 0; i < opt.reload.length; i++) {
						reload(opt.reload[i]);
					}
				}
				if (opt.onComplete) {
					opt.onComplete(response);
				}
				loadingWin.loading(false);
				if (response.message != null && response.message != '') {
					$('body').message({message: response.message, type: (response.success ? 'confirm' : 'error')});
				}
			},
			error: function() {
				loadingWin.loading(false);
				$('body').message({message: 'Errore di connessione al server, riprovare più tardi.', type: 'error'});
			}
		});		
	};
	
	$.fn.combo = function() {
		function make($this) {
			var sel = $this.find('option:selected');
			var sel_text = '';
			var sel_value = '';
			if (sel.length > 0) {
				sel_text = sel.text();
				sel_value = sel.attr('value');
			}

			var list = [];
			$this.find('option').each(function() {
				var val = $(this).val();
				if (val !== '') {
					var text = $(this).text();
					var find = H.Utility.normalizza(text);
					list.push('<div data-value="' + val + '" data-find="' + find + '">' + text + '</div>')
				}
			});
			var elem = [
				'<div class="h-field-combo-elem">',
					'<input type="text" class="field" value="', sel_text,'">',
					'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
					'<div class="h-field-combo-elem-list">', list.join(''),'</div>',
				'</div>'
			];
			elem = $(elem.join(''));

			$this.css({display: 'none'});
			$this.after(elem);
			list = elem.find('.h-field-combo-elem-list');
			
			function filter(val) {
				val = H.Utility.normalizza(val);
				if (val == '') {
					list.find('[data-find]').removeClass('hide');
				}
				else {
					list.find('[data-find]').each(function() {
						if ($(this).attr('data-find').indexOf(val) >= 0) {
							$(this).removeClass('hide');
						}
						else {
							$(this).addClass('hide');
						}
					});
				}
			}
			
			list.find('[data-value]').on('click', function(e) {
				e.preventDefault();
				list.find('.selected').removeClass('selected');
				elem.find('input').val($(this).text());
				$this.val($(this).attr('data-value'));
				$this.trigger('change');
				list.css({display: 'none'});
				$(this).addClass('selected');
				elem.addClass('is-action');
			});
			elem.find('input')
				.on('keyup', function() {
					filter($(this).val());
					$this.val('');
					$this.trigger('change');
					list.find('.selected').removeClass('selected');
				})
				.on('focus', function() {
					list.css({display: 'block'});
					filter($(this).val());
					setTimeout(function() {
						if (elem.hasClass('is-action')) {
							elem.removeClass('is-action');
						}
					}, 250);
				})
				.on('blur', function() {
					setTimeout(function() {
						if (elem.hasClass('is-action')) {
							elem.removeClass('is-action');
							return;
						}
						list.css({display: 'none'});
						if (list.find('.selected').length == 0) {
							$this.val('');
							$this.trigger('change');
							elem.find('input').val('');
						}
					}, 250);
				});
			elem.find('svg').on('click', function() {
				elem.find('input').val('');
				$this.val('');
				$this.trigger('change');
				list.find('.hide').removeClass('hide');
				list.find('.selected').removeClass('selected');
				elem.find('input').trigger('focus');
				elem.addClass('is-action');
			});

			if (sel_value !== '') {
				list.find('[data-value="' + sel_value + '"]').addClass('selected');
			}
		}
		
		$(this).each(function() {
			make($(this));
		});			
	};
	
	$.fn.block_tab = function() {
		$(this).each(function() {
			var $this = $(this);
			$this.find('[data-block-tab]').click(function() {
				if (!$(this).hasClass('open')) {
					$this.find('[data-block-tab].open').removeClass('open');
					$this.find('[data-block-tab-body].open').removeClass('open');
					var body = $this.find('[data-block-tab-body=' + $(this).attr('data-block-tab') + ']');
					$(this).addClass('open');
					body.addClass('open');
					body.scrollTop(0);
					if (body.hasClass('h-load')) {
						body.hload(true);
					}
				}
			});
			$this.find('[data-block-tab]').eq(0).click();
		});
		return $(this);
	};
	$.fn.tab = function() {
		$(this).each(function() {
			var $this = $(this);
			$this.find('[data-tab-rif]').click(function() {
				if (!$(this).hasClass('open')) {
					var opt = $(this).actionParams();
					$this.find('[data-tab-rif].open').removeClass('open');
					$(this).addClass('open');
					$this.find('[data-tab]').css({display: 'none'});
					$this.find('[data-tab=' + $(this).attr('data-tab-rif') + ']').css({display: 'block'});
					if (opt.clear_checkbox) {
						$this.find('[data-tab]').find('.h-checkbox-checked').trigger('click');
					}
				}
			});
			$this.find('[data-tab-rif]').eq(0).click();
		});
		return $(this);
	};
})( jQuery );

H.alert = function(opt) {
	opt.closeBtn = opt.closeBtn == null ? 'Chiudi' : opt.closeBtn;
	var html = [
		'<div class="h-layout-content-wrapper h-layout-show-topbar h-layout-show-bottombar">',
			'<div class="h-layout-topbar">',
				'<div class="h-layout-content-wrapper">',
					(opt.title == null ? '' : opt.title),
					'<a href="javascript:void(0);" class="h-close-box"></a>',
				'</div>',
			'</div>',
			'<div class="h-layout-content">',
				'<div class="h-layout-content-padding">',
				opt.message,
				'</div>',
			'</div>',
			'<div class="h-layout-bottombar">',
				'<div class="h-layout-content-wrapper h-alert-button-bar">',					
				'</div>',
			'</div>',
		'</div>'
	];
	var box = $('<div class="h-box-alert" />');
	var buttons = [
		{text: opt.closeBtn, close: true, action: opt.closeBtnCallback}
	];
	if (opt.buttons != null) {
		for (var i = 0; i < opt.buttons.length; i++) {
			buttons.push(opt.buttons[i]);
		}
	}
	box.html(html.join('')).box({overlay: true});
	
	function setAction(obj, action) {
		if (action == null) {
			return;
		}
		obj.click(function() {
			action(box);
		});	
	}
	var btnContent = box.find('.h-alert-button-bar');
	for (var i = 0; i < buttons.length; i++) {
		var btn = $('<a href="javascript:void(0);" class="h-bar-button h-bar-button-' + (buttons[i].color == null ? 'gray' : buttons[i].color) + (buttons[i].close === null ? '': ' h-close-box') + '">' + buttons[i].text + '</a>');
		setAction(btn, buttons[i].action)
		btnContent.append(btn);
	}
};

H.download = function(opt) {
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
	
	if (opt.download) {
		H.ajax(opt.url, {
			data: opt.params,
			success: function(data) {
				if (data.file) {
					doDownload(opt.download, {file: data.file});
				}
				else {
					$('body').message({message: 'Errore in fase di caricamento impossibile procedere', type: 'error'});
				}
			},
			failure: function() {
				$('body').message({message: 'Errore in fase di caricamento impossibile procedere', type: 'error'});
			}
		});	
	}
	else {
		doDownload(opt.url, opt.params);
	}
};

$(function(){	
	$('body').on('click', '.h-action-download', function() {
		$(this).blur();
		var opt = $(this).actionParams();
		opt.params = opt.params == null ? {} : opt.params;
		if (opt.select) {
			var id = $(opt.select.from).selectionInList(opt.select);
			if (id == null) {
				return;
			}
			else {
				opt.select.paramName = opt.select.paramName == null ? 'id' : opt.select.paramName;
				opt.params[opt.select.paramName] = id;
			}
		}
		H.download(opt);
	});
	
	$('body').on('click', '.message-center-block-expandible-title', function() {
		var block = $(this).closest('.message-center-block-expandible');
		if (block.hasClass('selected')) {
			block.removeClass('selected');
		}
		else {
			 $(this).closest('.message-center-block').find('.selected').removeClass('selected');
			 block.addClass('selected');
		}
	});
	
	$('body').on('click', '.h-action-link', function() {
		$(this).blur();
		var opt = $(this).actionParams();
		var params = [];
		if (opt.select) {
			var id = $(opt.select.from).selectionInList(opt.select);
			if (id == null) {
				return;
			}
			else {
				opt.select.paramName = opt.select.paramName == null ? 'id' : opt.select.paramName;
				params.push(opt.select.paramName + '=' + id);
			}
		}
		if (opt.params) {
			for (var i = 0; i < opt.params.length; i++) {
				params.push(opt.params[i].key + '=' + opt.params[i].value);
			}
		}
		if (params.length == 0) {
			params = '';
		}
		else {
			params = '?' + params.join('&');
		}
		window.open(opt.url + params);
	});

	$('body').on('click', '.h-action-data-block-elimina', function() {
		$(this).closest('[data-block-id]').remove();
	});
	
	$('body').on('click', '.h-action-selected-block', function() {
		var $this = $(this);
		var opt = $this.actionParams();
			
		var id = $(opt.select.from).selectionInList(opt.select);
		if (id == null) {
			return;
		}

		H.ajax(opt.url, {
			data: {
				id: id
			},
			dataType: 'html',
			success: function(data) {
				var cont = $(opt.content);
				data = $(data);
				$(data).find('[data-block-id]').each(function() {
					if (cont.find('[data-block-id=' + $(this).attr('data-block-id') + ']').length == 0) {
						cont.append($(this));
					}
				});
				$this.closest('.h-box-wrapper').box('close');
				$('body').message({message: 'Voce inserita'});
			},
			failure: function() {
				$('body').message({message: 'Errore in fase di caricamento impossibile procedere', type: 'error'});
			}
		});
	});
	
	$('body').on('click', '.h-action-add-block-wrapper', function() {
		var opt = $(this).actionParams();
		
		$.fn.window({
			type: 'layer',
			overlay: true,
			width: 600,
			height: 500,
			url: opt.url,
			params: opt.params
		});
	});
	
	$('body').on('click', '.h-add-image-delete', function() {
		var cont = $(this).closest('[data-key]');
		var key = cont.attr('data-key');
		field = $(this).closest('.h-add-image-wrapper').find('input[name="elenco_immagini"]');
		var part = field.val().split(',');
		var new_val = [];
		for (var i = 0; i < part.length; i++) {
			if (part[i] != key) {
				new_val.push(part[i]);
			}
		}
		field.val(new_val.join(','));
		cont.remove();		
	});
	$('body').on('click', '.h-action-add-image', function() {
		var opt = $(this).actionParams();
		var id = H.id();
		var html = $(opt.params.content).find('.h-add-image-template').val();
		html = html.replace(/%id%/gi, id);
		var val = $(opt.params.content + ' input[name=elenco_immagini]').val();
		if (val != '') {
			val += ',';
		}
		val += id;
		html = $(html);
		$(opt.params.content + ' input[name=elenco_immagini]').val(val);
		$(opt.params.content + ' .h-add-image-list').prepend(html);
		html.find('.h-action-upload-file').trigger('click');
	});
	
	$('body').on('click', '.h-action-rem-extra-wrapper', function() {
		var opt = $(this).actionParams();
		opt.cont = opt.cont == null ? 'tr' : opt.cont;
		var prefix = opt.prefix == null ? '' : opt.prefix;
		var tr = $(this).closest(opt.cont);
		var cont = tr.closest('.h-table-parametri-extra-wrapper');
		var key = tr.attr('data-key');
		if (tr.hasClass('new-extra-param')) {
			var field = prefix + 'parametri_extra_new';
		}
		else {
			var field = prefix + 'parametri_extra';
		}
		field = cont.find('input[name=' + field + ']');
		if (field.length) {
			var part = field.val().split(',');
			var new_val = [];
			for (var i = 0; i < part.length; i++) {
				if (part[i] != key) {
					new_val.push(part[i]);
				}
			}
			field.val(new_val.join(','));	
		}
		tr.remove();
	});
	
	$('body').on('click', '.h-action-add-extra-wrapper', function() {
		var opt = $(this).actionParams();
		var prefix = opt.params.prefix == null ? '' : opt.params.prefix;
		var id = H.id();
		var html = $(opt.params.content).find('.h-table-parametri-extra-template').val();
		html = html.replace(/%id%/gi, id);
		var val = $(opt.params.content + ' input[name=' + prefix + 'parametri_extra_new]').val();
		if (val != '') {
			val += ',';
		}
		val += id;
		var add = opt.params.table == null ? ' table tbody' : ' ' + opt.params.table;
		$(opt.params.content + ' input[name=' + prefix + 'parametri_extra_new]').val(val);
		html = $(html);
		html.inlineSvg();
		$(opt.params.content + add).append(html);
	});
	
	$('body').on('click', '.h-action-add-item-in-select', function() {
		var opt = $(this).actionParams();
		opt.params = opt.params == null ? {} : opt.params;
		opt.width = opt.width == null ? 380 : opt.width;
		opt.height = opt.height == null ? 250 : opt.height;
		
		opt.params.callback_id = H.id();
		opt.params.type = opt.type;
		
		var select = $(this).closest('.field-line').find('.select-content');
		select.attr('data-callback-id', opt.params.callback_id);
		
		$.fn.window({
			type: 'layer',
			overlay: true,
			width: opt.width,
			height: opt.height,
			url: opt.url,
			params: opt.params
		});
	});	
	
	$('body').on('mouseover', '.h-action-alttext', function() {
		$(this).alttext();
	});
	$('body').on('mouseout', '.h-action-alttext', function() {
		$('.h-alttext-wrapper').remove();
	});
	
	$('body').on('click', '#h-layout-navigation .h-nav-button', function() {
		var opt = $(this).actionParams();
		
		var wrapper = $(this).parent();
		var params = null;
		$(this).closest('.h-nav-button-group').find('.h-nav-button-down').not(wrapper).removeClass('h-nav-button-down');
		if (wrapper.hasClass('h-nav-button-down')) {
			wrapper.removeClass('h-nav-button-down');
			if (!$(this).hasClass('h-nav-button-click')) {
				params = {hide: opt.show, show: opt.hide};
			}
		}
		else {
			wrapper.addClass('h-nav-button-down');
			if ($(this).hasClass('h-nav-button-click')) {
				wrapper.delay(200).queue(function(next){
					wrapper.removeClass('h-nav-button-down');
					next();
				});
			}
			else {
				params = {hide: opt.hide, show: opt.show};
			}
		}
		
		if (params != null) {
			$('body').layout(params);
		}
	});

	$('body').on('click', '.h-action-popup-menu', function() {
		var idPopup = $(this).attr('data-id-popup');
		if ($(this).hasClass('h-popup-show')) {
			$(this).removeClass('h-popup-show')
			$('[data-win-id=' + idPopup + ']').box('hide');
			return;
		}
		if (idPopup == null) {
			var btn = $(this);
			var popup = $(this).parent().find('.h-popup-content');
			var box = popup.box({positionTo: $(this), overlay: 'transparent', onOverlayClick: function() {
				btn.click();
			}});
			$(this).attr('data-id-popup', popup.attr('data-win-id'));
			
			var $this = $(this);
			box.on('click', '.h-action-close-popup-menu', function() {
				$this.click();
			});
		}
		else {
			$('[data-win-id=' + idPopup + ']').box('show');
		}
		$(this).addClass('h-popup-show');
	});
	
	$('body').on('click', '.h-action-selected-open-window', function() {
		var opt = $(this).actionParams();
		opt.window.params = opt.window.params == null ? {} : opt.window.params;
		if (opt.select) {
			var id = $(opt.select.from).selectionInList(opt.select);
			if (id == null) {
				return;
			}
			else {
				opt.select.paramName = opt.select.paramName == null ? 'id' : opt.select.paramName;
				opt.window.params[opt.select.paramName] = id;
			}
		}		
		$.fn.window(opt.window);
	});
	
	$('body').on('click', '.h-action-selected-execute', function() {		
		var opt = $(this).actionParams();
		opt.params = opt.params == null ? {} : opt.params;
		var id = null;
		if (opt.select) {
			id = $(opt.select.from).selectionInList(opt.select);
			if (id == null) {
				return;
			}
			opt.select.paramName = opt.select.paramName == null ? 'id' : opt.select.paramName;
			opt.params[opt.select.paramName] = id;
		}
		else {
			if (opt.params.id != null) {
				id = '' + opt.params.id;
			}
		}
				
		if (opt.confirm) {
			H.alert({
				message: opt.confirm,
				closeBtn: 'Annulla',
				buttons: [
					{
						text: 'Procedi', 
						close: true, 
						color: 'blu', 
						action: function(box) {
							opt.onComplete = function(response) {
								if (response.success && id != null) {
									if (opt.reload) {
										if (typeof opt.reload === 'string') {
											opt.reload = [opt.reload];
										}
										for (var i = 0; i < opt.reload.length; i++) {
											$(opt.reload[i]).loadWindow();
										}										
									}
									if (opt.replace_item || opt.delete_item) {
										id = id.split(',');
										if (opt.replace_item || response.item != null && response.item != '') {
											var cont = $('<table>' + response.item + '</table>');
											for (var i = 0; i < id.length; i++) {
												$('tr[data-id=' + id[i] + ']').replaceWith(cont.find('tr[data-id=' + id[i] + ']'));
												var edit = $('tr[data-id=' + id[i] + ']').closest('.h-edit-table');
												if (edit.length > 0) {
													edit.editTable();
												}
											}
											
										}
										else {
											if (opt.delete_item) {
												var numTot = parseInt($('table[data-total]').attr('data-total')) - id.length;
												$('.h-nav-list-count span').html(numTot);
												$('table[data-total]').attr('data-total', numTot);
												for (var i = 0; i < id.length; i++) {
													$('tr[data-id=' + id[i] + ']').remove();	
												}
											}
										}
									}
								}  
							};
							$.fn.execute(opt);
						}
					}
				]
			});
		}
		else {
			$.fn.execute(opt);
		}
	});	
	
	$('body').on('click', '.h-action-window', function() {
		$(this).window();
	});

	$('body').on('click', '.h-close-box', function() {
		$(this).closest('.h-box-wrapper').box('close');
	});		
	$('body').on('click', '.h-action-next-step', function() {
		var opt = $(this).actionParams();
		var form = $(this).closest('form');
		form.removeClass('form-error');
		var currentBlock = $(this).closest('.h-layout-step');
		var next = opt.add;
		if (next > 0 && !H.Validator.checkIsValidForm(currentBlock)) {
			$('body').message({message: 'I campi evidenziati in rosso contengono errori', type: 'error'});
			form.addClass('form-error');
			return;
		}
		if (opt.check) {
			var resp = $(opt.check.in).selectionInList(opt.check);
			if (resp == null) {
				return;
			}
		}
		var wrapper = $(this).closest('.h-layout-step-wrapper');
		var stepList = wrapper.attr('data-step-list');
		if (stepList == null || stepList == '') {
			stepList = [];
		}
		else {
			stepList = stepList.split(',');
		}
		if (next > 0) {
			next = parseInt(currentBlock.attr('data-step')) + next;
			stepList.push(next);
		}
		else {
			next = stepList[stepList.length - 2];
			stepList.splice(stepList.length - 1, 1);
		}

		stepList = stepList.join(',');
		
		$this = $(this);
		
		function procedi() {
			if (opt.removeContentFrom) {
				$(opt.removeContentFrom).remove();
			}
			var nextBlock = form.find('.h-layout-step[data-step=' + next + ']');
			wrapper.attr('data-step-list', stepList);
			
			currentBlock.fadeOut(200, function() {
				$this.removeClass('h-layout-step-show');
			});
			nextBlock.fadeIn(200, function() {
				$this.addClass('h-layout-step-show');
				$(document).scrollTop(0);
			});
		}
		
		if (opt.pre) {
			currentBlock.off('do-submit');
			currentBlock.on('do-submit', function() {
				procedi();
			});
			H.callback[opt.pre](currentBlock);
		}
		else {
			procedi();
		}		
	});	
	$('body').on('click', '.h-action-next-list', function() {
		var opt = $(this).actionParams();
		var content = $(opt.content);
		var start = content.attr('data-load-start');
		if (start == null || start == '') {
			start = 0;
		}
		else {
			start = parseInt(start);
		}
		start += opt.add;
		content.attr('data-load-start', start);
		content.loadWindow();
	});
	$('body').on('click', '.h-action-reset-filter', function() {
		var opt = $(this).actionParams();
		
		$(opt.load).attr('data-load-params', '');
		$(opt.load).loadWindow();	
		$(opt.reset).find('.h-nav-button-down .h-nav-button').click();	

		$(this).parent().css({display: 'none'});		
	});
	
	$('body').on('click', '.h-action-filter', function() {
		var opt = $(this).actionParams();		
		var form = $(this).closest('form');
		var loadParams = form.serializeObject();
		var oldLoadParamsOrig = form.attr('data-load-params-orig');
		if (oldLoadParamsOrig == null || oldLoadParamsOrig == '') {
			var oldLoadParams = $(opt.load).attr('data-load-params');
			if (oldLoadParams == null || oldLoadParams == '') {
				oldLoadParams = '-';
			}
			form.attr('data-load-params-orig', oldLoadParams);
		}
		oldLoadParamsOrig = form.attr('data-load-params-orig');
		if (oldLoadParamsOrig != null && 
			oldLoadParamsOrig != '' && 
			oldLoadParamsOrig != '-') {
			oldLoadParams = $.parseJSON(oldLoadParams);
			loadParams = $.extend(oldLoadParams, loadParams);
		}
		
		$(opt.load).attr('data-load-params', JSON.stringify(loadParams));
		$(opt.load).loadWindow();
		$(opt.reset).find('.h-nav-button-wrapper').css({display: 'block'});
	});
	
	$('body').on('click', '.h-load-in-window', function() {
		var opt = $(this).actionParams();
		$(opt.loadIn).loadWindow(opt);
	});
	$('body').on('click', '.h-execute-function', function() {
		var opt = $(this).actionParams();
		H.callback[opt.name](opt.params);
	});	
	
	$('body').on('click', '[data-order]', function() {
		var closest = $(this).closest('.h-action-auto-update-wrapper');
		closest.attr('data-load-order', $(this).attr('data-order'));
		var order_type = $(this).attr('data-order-type');
		$(this).parent().find('[data-order-type]').each(function() {
			$(this).attr('data-order-type', '');
		});
		if (order_type == 'asc') {
			order_type = 'desc';
		}
		else {
			order_type = 'asc';
		}
		$(this).attr('data-order-type', order_type);
		closest.attr('data-load-order-type', order_type);
		closest.loadWindow();
	});
	
	$('.h-fixed-header-table').each(function() {
		$(this).fixedTableHeader();
	});
	
	$('.autocomplete').each(function() {
		$(this).autocomplete();
	});	
	
	$('.h-action-filter-list').each(function() {
		$(this).filterList();
	});
		
	$('.h-chart').chart();
	$('.h-tab').tab();
	$('.block-tab').block_tab();
	$('.h-field-combo').combo();
	$('.manualscroll-wrapper').manualScrollItems('.btn-index');
	
	if ($('.h-edit-table').length > 0) {
		$('.h-edit-table').editTable();	
		$(document).on('keypress', function(e) {
			var td = $('.h-edit-table-cell-field-enable');
			if (td.length == 0) {
				return;
			}
			var code = e.keyCode || e.which;
			switch(code) {
			case 9:
			case 13:
				td.find('[name=edit_value]').trigger('blur');
				break;
			default:
				return;
			}		
			switch(code) {
			case 9:
				var orig = td;
				do {
					td = td.next();
					if (td == null || td.length == 0) {
						td = orig.closest('tr').next('tr');
						if (td == null || td.length == 0) {
							return;
						}
						td = td.find('td').eq(0);
					}
				}
				while (!td.hasClass('h-edit-table-cell-edit-mode'));
				break;
			case 13:
				var idx = td.index();
				td = td.closest('tr').next('tr');
				if (td == null || td.length == 0) {
					return;
				}
				td = td.find('td').eq(idx);
				break;
			}
			td.trigger('click');
		});
	}
	
	$('body').on('click', '.action-remove-current-element', function() {
		var event = $(this).attr('data-event');
		if (event && event != '') {
			$('body').trigger(event, [$(this).attr('data-id')]);
		}
		$(this).closest('.remove-current-element-wrapper').remove();
	});
	
	$('body').on('click', '.action-close-nav-menu', function() {
		$('body').trigger('close-nav-menu');
	});
	
	$('body').on('close-nav-menu', function() {
		if (!$('.h-nav-menu-bar').hasClass('show')) {
			return;
		}
		var overlay = $('.h-nav-menu-bar-overlay');
		$('.h-nav-menu-bar').animate({
			left: '-300px'
		}, 300).fadeOut(300).removeClass('show');
		overlay.fadeOut(300);
	});
	
	$('.h-nav-menu').on('click', function() {
		$('.h-nav-menu-bar').addClass('show');
		var overlay = $('.h-nav-menu-bar-overlay');
		if (overlay.length == 0) {
			overlay = $('<div class="h-nav-menu-bar-overlay"/>');
			$('body').append(overlay);
		}
		overlay.fadeIn(300);
		$('.h-nav-menu-bar').fadeIn(300);
		$('.h-nav-menu-bar').animate({
			left: '0px'
		}, 300, function() {
			overlay.on('click', function() {
				$('body').trigger('close-nav-menu');
			});
		});
	});
	
	$('body').inlineSvg();
	$('.tree').each(function() {
		$(this).tree();
	});
			
	$('.h-calcolo-sconto-percentuale-euro').calcoloScontoPercentualeEuro();
	$('.h-load').hload();
		
	setTimeout(function() {
		$('.h-action-auto-update-wrapper').autoupdate();
	}, 10);
});
