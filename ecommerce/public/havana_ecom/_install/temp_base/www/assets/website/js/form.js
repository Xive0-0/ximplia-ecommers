if (Label.calendario) {
	var DatepickerLabels = {
		dates: Label.calendario
	};	
}
else {
	var DatepickerLabels = {
		dates: {
			days: ["Domenica", "Luned&igrave;", "Marted&igrave;", "Mercoled&igrave;", "Gioved&igrave;", "Venerd&igrave;", "Sabato", "Domenica"],
			daysShort: ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"],
			daysMin: ["Do", "Lu", "Ma", "Me", "Gi", "Ve", "Sa", "Do"],
			months: ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"],
			monthsShort: ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"]
		}
	};	
}

!function( $ ) {
	$.fn.countryPhone = function() {
		function addSelectorTo(input, cont, cc) {
			var selector = $([
					'<div class="phone-country-selector">',
						'<div class="phone-country-selector-item-current">',
							'<div class="phone-country-selector-item-current-value"/>',
							'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M7.41 7.84L12 12.42l4.59-4.58L18 9.25l-6 6-6-6z"/><path d="M0-.75h24v24H0z" fill="none"/></svg>',
						'</div>',
						'<div class="phone-country-selector-layer">',
							'<div class="phone-country-selector-find"><input type="text"></div>',
							'<div class="phone-country-selector-list"/>',
						'</div>',
					'</div>'
				].join(''));
			cont.append(selector);
			cont.addClass('field-with-phone-country-selector');
			
			var list = selector.find('.phone-country-selector-list');
			$.each(CountryPhone, function(key, elem) {
				list.append([
					'<div class="phone-country-selector-item" data-label="', elem.label.toLowerCase(),'" data-country="' + key + '" data-phone="+', elem.phone,'">',
						'<div class="phone-country-selector-flag-cont">',
							'<div class="phone-country-selector-flag" style="background-position: 0 -', elem.flag,'px"/>',
						'</div>',
						'<div class="phone-country-selector-code">', key,'</div>',
						'<div class="phone-country-selector-phone">+', elem.phone,'</div>',
						'<div class="phone-country-selector-label">', elem.label,'</div>',
					'</div>'
				].join(''));
			});
			
			selector.find('input').on('keyup', function() {
				var valore = Utility.trim($(this).val()).toLowerCase();
				var list = selector.find('.phone-country-selector-list .phone-country-selector-item');
				if (valore.length == 0) {
					list.removeClass('phone-country-selector-item-hide');
				}
				else {
					list.addClass('phone-country-selector-item-hide');
					selector.find('.phone-country-selector-list .phone-country-selector-item[data-label*="' + valore + '"]')
						.removeClass('phone-country-selector-item-hide');
				}
			});
			
			selector.find('.phone-country-selector-item-current').on('click', function(e) {
				e.preventDefault();
				if (cont.hasClass('phone-country-selector-show')) {
					cont.removeClass('focus').removeClass('phone-country-selector-show');
					$(document).off('click');
					return;
				}
				cont.addClass('phone-country-selector-show');
				selector.find('.phone-country-selector-list .phone-country-selector-item')
					.removeClass('phone-country-selector-item-hide');
				selector.find('input').val('');
				selector.find('input').trigger('focus');
				setTimeout(function() {
					$(document).on('click', function(ev) {
						if ($(ev.target).closest('.phone-country-selector-layer').length > 0) {
							return;
						}
						cont.removeClass('focus').removeClass('phone-country-selector-show');
						$(document).off('click');
					});
				}, 10);
			});
			selector.on('click', '.phone-country-selector-item', function() {
				input.data('phone-code', $(this).data('phone'));
				selector.find('.phone-country-selector-item-current-value').html($(this).html());
				selector.find('input').val('');
				cont.removeClass('focus').removeClass('phone-country-selector-show');
				cont.addClass('focus');
				input.trigger('focus');
				$(document).off('click');
			});				

			cc = cc.toUpperCase();
			var current = selector.find('.phone-country-selector-item[data-country="' + cc + '"]');
			if (current.length == 0) {
				current = selector.find('.phone-country-selector-item[data-country="IT"]');
			}
			input.data('phone-code', current.data('phone'));
			selector.find('.phone-country-selector-item-current-value').html(current.html());
		}
		
		function add($this) {
			var parent = $this.parent();
			if (parent.find('.phone-country-selector').length > 0) {
				return;
			}
			
			var valore = Utility.trim($this.val()).replace(/[^\d\-\+]/g, '');
			if (valore.length > 0) {
				if (valore.charAt(0) == '+') {
					var cc = 'it';
					valore = valore.substr(1);
					var trovato = false;
					$.each(CountryPhone, function(key, elem) {
						if (!trovato && valore.indexOf(elem.phone) == 0) {
							cc = key;
							valore = valore.substr((elem.phone).length);
							trovato = true;
							$this.data('phone-code', '+' + elem.phone);
						}
					});
					$this.data('current-country', cc);
				}
			}
			
			var cc = $this.data('current-country');
			if (cc == null || cc == '') {
				cc = 'it';
			}
			
			parent.css({position: 'relative'});
			var input = $('<input type="hidden" name="' + $this.attr('name') + '"/>');

			function update() {
				var code = '';
				if ($this.data('phone-code')) {
					code = $this.data('phone-code');
				}
				input.val(code + $this.val());
			}

			$this.attr('name', '_');
			$this.val(valore);
			if (valore.length > 0) {
				parent.addClass('keypress');
				update();
			}
			parent.append(input);
			addSelectorTo($this, parent, cc);
			
			$this.on('focus', function() {
				$(this).parent().addClass('focus');
			});
						
			$this.on('blur', function() {
				var parent = $(this).parent();
				setTimeout(function() {
					if (!parent.hasClass('phone-country-selector-show')) {
						parent.removeClass('focus');
					}
				}, 200);
				update();
			});
						
			$this.on('keyup', function() {
				update();
				var valore = Utility.trim($(this).val()).replace(/[^\d\-]/g, '');
				if (valore.length == 0) {
					$(this).parent().removeClass('keypress');
					$(this).val(valore);
				}
				else {
					$(this).parent().addClass('keypress');
				}
			});
		}
		
		$(this).each(function() {
			add($(this));
		});
		return $(this);
	};
	
	// Picker object
	
	var Datepicker = function(element, options){
		this.element = $(element);
		this.format = DPGlobal.parseFormat(options.format||this.element.data('date-format')||'mm/dd/yyyy');
		this.picker = $(DPGlobal.template)
							.appendTo('body')
							.on({
								click: $.proxy(this.click, this)//,
								//mousedown: $.proxy(this.mousedown, this)
							});
		this.isInput = this.element.is('input');
		this.component = this.element.is('.date') ? this.element.find('.add-on') : false;

		if (this.isInput) {
			this.element.on({
				focus: $.proxy(this.show, this),
				//blur: $.proxy(this.hide, this),
				keyup: $.proxy(this.update, this)
			});
		} else {
			if (this.component){
				this.component.on('click', $.proxy(this.show, this));
			} else {
				this.element.on('click', $.proxy(this.show, this));
			}
		}
	
		this.minViewMode = options.minViewMode||this.element.data('date-minviewmode')||0;
		if (typeof this.minViewMode === 'string') {
			switch (this.minViewMode) {
				case 'months':
					this.minViewMode = 1;
					break;
				case 'years':
					this.minViewMode = 2;
					break;
				default:
					this.minViewMode = 0;
					break;
			}
		}
		this.viewMode = options.viewMode||this.element.data('date-viewmode')||0;
		if (typeof this.viewMode === 'string') {
			switch (this.viewMode) {
				case 'months':
					this.viewMode = 1;
					break;
				case 'years':
					this.viewMode = 2;
					break;
				default:
					this.viewMode = 0;
					break;
			}
		}
		this.startViewMode = this.viewMode;
		this.weekStart = options.weekStart||this.element.data('date-weekstart')||0;
		this.weekEnd = this.weekStart === 0 ? 6 : this.weekStart - 1;
		this.onRender = options.onRender;
		this.fillDow();
		this.fillMonths();
		this.update();
		this.showMode();
	};
	
	Datepicker.prototype = {
		constructor: Datepicker,
		
		show: function(e) {
			this.picker.show();
			this.height = this.component ? this.component.outerHeight() : this.element.outerHeight();
			this.place();
			$(window).on('resize', $.proxy(this.place, this));
			if (e ) {
				e.stopPropagation();
				e.preventDefault();
			}
			if (!this.isInput) {
			}
			var that = this;
			$(document).on('mousedown', function(ev){
				if ($(ev.target).closest('.datepicker').length == 0) {
					that.hide();
				}
			});
			this.element.trigger({
				type: 'show',
				date: this.date
			});
		},
		
		hide: function(){
			this.picker.hide();
			$(window).off('resize', this.place);
			this.viewMode = this.startViewMode;
			this.showMode();
			if (!this.isInput) {
				$(document).off('mousedown', this.hide);
			}
			//this.set();
			this.element.trigger({
				type: 'hide',
				date: this.date
			});
		},
		
		set: function() {
			var formated = DPGlobal.formatDate(this.date, this.format);
			if (!this.isInput) {
				if (this.component){
					this.element.find('input').prop('value', formated);
				}
				this.element.data('date', formated);
			} else {
				this.element.prop('value', formated);
			}
		},
		
		setValue: function(newDate) {
			if (typeof newDate === 'string') {
				this.date = DPGlobal.parseDate(newDate, this.format);
			} else {
				this.date = new Date(newDate);
			}
			this.set();
			this.viewDate = new Date(this.date.getFullYear(), this.date.getMonth(), 1, 0, 0, 0, 0);
			this.fill();
		},
		
		place: function(){
			var offset = this.component ? this.component.offset() : this.element.offset();
			this.picker.css({
				top: offset.top + this.height,
				left: offset.left
			});
		},
		
		update: function(newDate){
			this.date = DPGlobal.parseDate(
				typeof newDate === 'string' ? newDate : (this.isInput ? this.element.prop('value') : this.element.data('date')),
				this.format
			);
			this.viewDate = new Date(this.date.getFullYear(), this.date.getMonth(), 1, 0, 0, 0, 0);
			this.fill();
		},
		
		fillDow: function(){
			var dowCnt = this.weekStart;
			var html = '<tr>';
			while (dowCnt < this.weekStart + 7) {
				html += '<th class="dow">'+DatepickerLabels.dates.daysMin[(dowCnt++)%7]+'</th>';
			}
			html += '</tr>';
			this.picker.find('.datepicker-days thead').append(html);
		},
		
		fillMonths: function(){
			var html = '';
			var i = 0
			while (i < 12) {
				html += '<span class="month">'+DatepickerLabels.dates.monthsShort[i++]+'</span>';
			}
			this.picker.find('.datepicker-months td').append(html);
		},
		
		fill: function() {
			var d = new Date(this.viewDate),
				year = d.getFullYear(),
				month = d.getMonth(),
				currentDate = this.date.valueOf();
			this.picker.find('.datepicker-days th:eq(1)')
						.text(DatepickerLabels.dates.months[month]+' '+year);
			var prevMonth = new Date(year, month-1, 28,0,0,0,0),
				day = DPGlobal.getDaysInMonth(prevMonth.getFullYear(), prevMonth.getMonth());
			prevMonth.setDate(day);
			prevMonth.setDate(day - (prevMonth.getDay() - this.weekStart + 7)%7);
			var nextMonth = new Date(prevMonth);
			nextMonth.setDate(nextMonth.getDate() + 42);
			nextMonth = nextMonth.valueOf();
			var html = [];
			var clsName,
				prevY,
				prevM;
			while(prevMonth.valueOf() < nextMonth) {
				if (prevMonth.getDay() === this.weekStart) {
					html.push('<tr>');
				}
				clsName = this.onRender(prevMonth);
				prevY = prevMonth.getFullYear();
				prevM = prevMonth.getMonth();
				if ((prevM < month &&  prevY === year) ||  prevY < year) {
					clsName += ' old';
				} else if ((prevM > month && prevY === year) || prevY > year) {
					clsName += ' new';
				}
				if (prevMonth.valueOf() === currentDate) {
					clsName += ' active';
				}
				html.push('<td class="day '+clsName+'">'+prevMonth.getDate() + '</td>');
				if (prevMonth.getDay() === this.weekEnd) {
					html.push('</tr>');
				}
				prevMonth.setDate(prevMonth.getDate()+1);
			}
			this.picker.find('.datepicker-days tbody').empty().append(html.join(''));
			var currentYear = this.date.getFullYear();
			
			var months = this.picker.find('.datepicker-months')
						.find('th:eq(1)')
							.text(year)
							.end()
						.find('span').removeClass('active');
			if (currentYear === year) {
				months.eq(this.date.getMonth()).addClass('active');
			}
			
			html = '';
			year = parseInt(year/10, 10) * 10;
			var yearCont = this.picker.find('.datepicker-years')
								.find('th:eq(1)')
									.text(year + '-' + (year + 9))
									.end()
								.find('td');
			year -= 1;
			for (var i = -1; i < 11; i++) {
				html += '<span class="year'+(i === -1 || i === 10 ? ' old' : '')+(currentYear === year ? ' active' : '')+'">'+year+'</span>';
				year += 1;
			}
			yearCont.html(html);
		},
		
		click: function(e) {
			e.stopPropagation();
			e.preventDefault();
			var target = $(e.target).closest('span, td, th');
			if (target.length === 1) {
				switch(target[0].nodeName.toLowerCase()) {
					case 'th':
						switch(target[0].className) {
							case 'switch':
								this.showMode(1);
								break;
							case 'prev':
							case 'next':
								this.viewDate['set'+DPGlobal.modes[this.viewMode].navFnc].call(
									this.viewDate,
									this.viewDate['get'+DPGlobal.modes[this.viewMode].navFnc].call(this.viewDate) + 
									DPGlobal.modes[this.viewMode].navStep * (target[0].className === 'prev' ? -1 : 1)
								);
								this.fill();
								this.set();
								break;
						}
						break;
					case 'span':
						if (target.is('.month')) {
							var month = target.parent().find('span').index(target);
							this.viewDate.setMonth(month);
						} else {
							var year = parseInt(target.text(), 10)||0;
							this.viewDate.setFullYear(year);
						}
						if (this.viewMode !== 0) {
							this.date = new Date(this.viewDate);
							this.element.trigger({
								type: 'changeDate',
								date: this.date,
								viewMode: DPGlobal.modes[this.viewMode].clsName
							});
						}
						this.showMode(-1);
						this.fill();
						this.set();
						break;
					case 'td':
						if (target.is('.day') && !target.is('.disabled')){
							var day = parseInt(target.text(), 10)||1;
							var month = this.viewDate.getMonth();
							if (target.is('.old')) {
								month -= 1;
							} else if (target.is('.new')) {
								month += 1;
							}
							var year = this.viewDate.getFullYear();
							this.date = new Date(year, month, day,0,0,0,0);
							this.viewDate = new Date(year, month, Math.min(28, day),0,0,0,0);
							this.fill();
							this.set();
							this.element.trigger({
								type: 'changeDate',
								date: this.date,
								viewMode: DPGlobal.modes[this.viewMode].clsName
							});
						}
						break;
				}
			}
		},
		
		mousedown: function(e){
			e.stopPropagation();
			e.preventDefault();
		},
		
		showMode: function(dir) {
			if (dir) {
				this.viewMode = Math.max(this.minViewMode, Math.min(2, this.viewMode + dir));
			}
			this.picker.find('>div').hide().filter('.datepicker-'+DPGlobal.modes[this.viewMode].clsName).show();
		}
	};
	
	$.fn.datepicker = function ( option, val ) {
		return this.each(function () {
			var $this = $(this),
				data = $this.data('datepicker'),
				options = typeof option === 'object' && option;
			if (!data) {
				$this.data('datepicker', (data = new Datepicker(this, $.extend({}, $.fn.datepicker.defaults,options))));
			}
			if (typeof option === 'string') data[option](val);
		});
	};

	$.fn.datepicker.defaults = {
		onRender: function(date) {
			return '';
		}
	};
	$.fn.datepicker.Constructor = Datepicker;
	
	var DPGlobal = {
		modes: [
			{
				clsName: 'days',
				navFnc: 'Month',
				navStep: 1
			},
			{
				clsName: 'months',
				navFnc: 'FullYear',
				navStep: 1
			},
			{
				clsName: 'years',
				navFnc: 'FullYear',
				navStep: 10
		}],
		isLeapYear: function (year) {
			return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0))
		},
		getDaysInMonth: function (year, month) {
			return [31, (DPGlobal.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month]
		},
		parseFormat: function(format){
			var separator = format.match(/[.\/\-\s].*?/),
				parts = format.split(/\W+/);
			if (!separator || !parts || parts.length === 0){
				throw new Error("Invalid date format.");
			}
			return {separator: separator, parts: parts};
		},
		parseDate: function(date, format) {
			var parts = date.split(format.separator),
				date = new Date(),
				val;
			date.setHours(0);
			date.setMinutes(0);
			date.setSeconds(0);
			date.setMilliseconds(0);
			if (parts.length === format.parts.length) {
				var year = date.getFullYear(), day = date.getDate(), month = date.getMonth();
				for (var i=0, cnt = format.parts.length; i < cnt; i++) {
					val = parseInt(parts[i], 10)||1;
					switch(format.parts[i]) {
						case 'dd':
						case 'd':
							day = val;
							date.setDate(val);
							break;
						case 'mm':
						case 'm':
							month = val - 1;
							date.setMonth(val - 1);
							break;
						case 'yy':
							year = 2000 + val;
							date.setFullYear(2000 + val);
							break;
						case 'yyyy':
							year = val;
							date.setFullYear(val);
							break;
					}
				}
				date = new Date(year, month, day, 0 ,0 ,0);
			}
			return date;
		},
		formatDate: function(date, format){
			var val = {
				d: date.getDate(),
				m: date.getMonth() + 1,
				yy: date.getFullYear().toString().substring(2),
				yyyy: date.getFullYear()
			};
			val.dd = (val.d < 10 ? '0' : '') + val.d;
			val.mm = (val.m < 10 ? '0' : '') + val.m;
			var date = [];
			for (var i=0, cnt = format.parts.length; i < cnt; i++) {
				date.push(val[format.parts[i]]);
			}
			return date.join(format.separator);
		},
		headTemplate: '<thead>'+
							'<tr>'+
								'<th class="prev">&lsaquo;</th>'+
								'<th colspan="5" class="switch"></th>'+
								'<th class="next">&rsaquo;</th>'+
							'</tr>'+
						'</thead>',
		contTemplate: '<tbody><tr><td colspan="7"></td></tr></tbody>'
	};
	DPGlobal.template = '<div class="datepicker dropdown-menu">'+
							'<div class="datepicker-days">'+
								'<table class=" table-condensed">'+
									DPGlobal.headTemplate+
									'<tbody></tbody>'+
								'</table>'+
							'</div>'+
							'<div class="datepicker-months">'+
								'<table class="table-condensed">'+
									DPGlobal.headTemplate+
									DPGlobal.contTemplate+
								'</table>'+
							'</div>'+
							'<div class="datepicker-years">'+
								'<table class="table-condensed">'+
									DPGlobal.headTemplate+
									DPGlobal.contTemplate+
								'</table>'+
							'</div>'+
						'</div>';


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
					var find = Utility.normalizza(text);
					list.push('<div data-value="' + val + '" data-find="' + find + '">' + text + '</div>')
				}
			});
			var elem = [
				'<div class="h-field-combo-elem">',
					'<input type="text" value="', sel_text,'">',
					'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
					'<div class="h-field-combo-elem-list">', list.join(''),'</div>',
				'</div>'
			];
			elem = $(elem.join(''));

			$this.css({display: 'none'});
			var field = $this.closest('.field');
			field.css({overflow: 'visible'});
			$this.after(elem);
			list = elem.find('.h-field-combo-elem-list');
			
			function filter(val) {
				val = Utility.normalizza(val);
				if (val == '') {
					list.find('[data-find]').removeClass('hide');
					field.removeClass('keypress');
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
					field.addClass('keypress');
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
				field.addClass('keypress');
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
					field.addClass('focus');
				})
				.on('blur', function() {
					field.removeClass('focus');
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
}( window.jQuery );


$(document).ready(function() {
	$('body').on('click','.action-upload-file',function() {
		var thisBtn = $(this);
		var opt = thisBtn.actionParams();	
		var id = 'upload_' + (new Date()).getTime();
		var html = [
			'<form id="',id ,'" enctype="multipart/form-data" style="display: none;">',
			'<input name="file" type="file" />',
			'</form>'
		];	
		
		$('body').append(html.join(''));	
		var form = $('#' + id);
		var inputField = form.find('input[name=file]');
		var box = $('<div />');

		inputField.fileupload({
			url: opt.url,
			dataType: 'json',
			add: function (e, data) {
				Loading.show();
				data.submit();
			},      
			start: function (e) {
			}, 			
			fail: function (e) {
				box.box('close', false);
				form.remove();
				Loading.hide();
				$('body').message({message: Label['server_non_risponde'], type: 'error'});
			}, 
			done: function (e, data) {
				Loading.hide();
				if (data && data.result && data.result.data) {
					var message = data.result.message;	
					data = data.result.data;	
					
					form.remove();				
					thisBtn.closest('.field-file').find('.field-anteprima').html(data.fileName);
					thisBtn.closest('.field-file').find('.field-file').val(data.tempFile);
					thisBtn.closest('.field-file').find('.field-file').trigger('blur');
					thisBtn.closest('.field-file').find('.field-file-name').val(data.fileName);
					$('body').message({message: message, type: 'confirm'});
				}
				else {
					$('body').message({message: Label['server_non_risponde'], type: 'error'});
				}
			},
			progressall: function (e, data) {

			}
		});
		
		inputField.click();		
	});
	
	$('body').on('click','.action-upload-file-reset',function() {
		$(this).closest('.field-file').find('.field-file').val('');
		$(this).closest('.field-file').find('.field-file-name').val('');
		$(this).closest('.field-file').find('.field-anteprima').html('');	
	});
	
	function checkAndSetFieldPecSdi(cont) {
		if (cont.find('.field-content-pec-sdi').length == 0) {
			return;
		}
		cont.find('.field-content-pec-sdi').each(function() {
			var nazione = $(this).find('.field-nazione-pec-sdi');
			var wrapper = $(this).find('.field-wrapper-pec-sdi');
			if ((nazione.val() + '') == '108') {
				wrapper.css({display: 'block'});
			}
			else {
				wrapper.css({display: 'none'});
			}
			nazione.on('change', function() {
				if (($(this).val() + '') == '108') {
					wrapper.fadeIn();
				}
				else {
					wrapper.fadeOut();
				}				
			});
		});
	}

	$('body').on('data-loaded', function(e, cont) {
		cont = cont == null ? $('body') : cont;
		cont.find('.field input[type=text], .field input[type=password], .field textarea, .field select').each(function() {
			var valore = Utility.trim($(this).val());
			if (valore.length == 0) {
				return;
			}
			$(this).parent().addClass('keypress');
		});
		
		$('form').attr('autocomplete', 'off');
		$('input,select,textarea').each(function() {
			$(this).attr('autocomplete', Math.random().toString(36).substring(2, 16)+Math.random().toString(36).substring(2, 16));
		});
		cont.find('.field-country-phone').countryPhone();
		
		cont.find('.input-datepicker').datepicker({
			format: 'dd/mm/yyyy',
			weekStart: 1
		}).on('changeDate', function() {
			$(this).parent().addClass('keypress');
		}).on('show', function() {
			$(this).closest('.field-line').addClass('focus');
		}).on('hide', function() {
			$(this).closest('.field-line').removeClass('focus');
		});
		
		cont.find('.riquadro-testo-policy[data-contratto]').each(function() {
			var contratto = $(this).attr('data-contratto');
			$(this).load('/account/terms/testo-riquadro',
					{
						contratto: contratto,
						_lang: Params.url_lang
					}
				);
		});
		
		cont.find('.h-field-combo').combo();
		cont.find('.action-show-password').each(function() {
			var input = $(this);
			var field = $(this).closest('.field');
			if (field.length > 0) {
				field.addClass('field-with-show-password');
				var btn = $([
					'<div class="btn-show-password">',
						'<svg class="btn-show-password-on" xmlns="http://www.w3.org/2000/svg" height="24" width="24"><path d="M12 16Q13.875 16 15.188 14.688Q16.5 13.375 16.5 11.5Q16.5 9.625 15.188 8.312Q13.875 7 12 7Q10.125 7 8.812 8.312Q7.5 9.625 7.5 11.5Q7.5 13.375 8.812 14.688Q10.125 16 12 16ZM12 14.2Q10.875 14.2 10.088 13.412Q9.3 12.625 9.3 11.5Q9.3 10.375 10.088 9.587Q10.875 8.8 12 8.8Q13.125 8.8 13.913 9.587Q14.7 10.375 14.7 11.5Q14.7 12.625 13.913 13.412Q13.125 14.2 12 14.2ZM12 19Q8.35 19 5.35 16.962Q2.35 14.925 1 11.5Q2.35 8.075 5.35 6.037Q8.35 4 12 4Q15.65 4 18.65 6.037Q21.65 8.075 23 11.5Q21.65 14.925 18.65 16.962Q15.65 19 12 19Z"/></svg>',
						'<svg class="btn-show-password-off" xmlns="http://www.w3.org/2000/svg" height="24" width="24"><path d="M19.8 22.6 15.6 18.45Q14.725 18.725 13.838 18.863Q12.95 19 12 19Q8.225 19 5.275 16.913Q2.325 14.825 1 11.5Q1.525 10.175 2.325 9.037Q3.125 7.9 4.15 7L1.4 4.2L2.8 2.8L21.2 21.2ZM12 16Q12.275 16 12.512 15.975Q12.75 15.95 13.025 15.875L7.625 10.475Q7.55 10.75 7.525 10.988Q7.5 11.225 7.5 11.5Q7.5 13.375 8.812 14.688Q10.125 16 12 16ZM19.3 16.45 16.125 13.3Q16.3 12.875 16.4 12.438Q16.5 12 16.5 11.5Q16.5 9.625 15.188 8.312Q13.875 7 12 7Q11.5 7 11.062 7.1Q10.625 7.2 10.2 7.4L7.65 4.85Q8.675 4.425 9.75 4.212Q10.825 4 12 4Q15.775 4 18.725 6.087Q21.675 8.175 23 11.5Q22.425 12.975 21.488 14.238Q20.55 15.5 19.3 16.45ZM14.675 11.85 11.675 8.85Q12.375 8.725 12.963 8.962Q13.55 9.2 13.975 9.65Q14.4 10.1 14.588 10.688Q14.775 11.275 14.675 11.85Z"/></svg>',
					'</div>'
				].join(''));
				field.append(btn);
				btn.on('click', function() {	
					if ($(this).hasClass('show')) {
						$(this).removeClass('show');
						input.attr('type', 'password');
					}
					else {
						$(this).addClass('show');
						input.attr('type', 'text');
					}
				});
			}
		});
		
		checkAndSetFieldPecSdi(cont);
	});
	checkAndSetFieldPecSdi($('body'));

	$('body').on('keydown', 'form input[type=text]', function(e) {
		if (e.keyCode == 13) {
			e.preventDefault();
			$(this).closest('form').find('.btn-submit').click();
			return false;
		}		
	});
	
	$('body').on('change', 'select', function() {
		if ($(this).val() == '') {
			$(this).removeClass('sel');
		}
		else {
			$(this).addClass('sel');
		}
	});
	
	$('body').on('change', '.field select', function() {
		if ($(this).val() == '') {
			$(this).parent().removeClass('keypress');
		}
		else {
			$(this).parent().addClass('keypress');
		}
	});
	$('body').on('keyup', '.field input[type=text], .field input[type=password], .field textarea', function() {
		var valore = Utility.trim($(this).val());
		if (valore.length == 0) {
			$(this).parent().removeClass('keypress');
			$(this).val(valore);
		}
		else {
			$(this).parent().addClass('keypress');
		}
	});
	$('body').on('focus', '.field input[type=text], .field input[type=password], .field textarea', function() {
		if ($(this).parent().hasClass('field-with-phone-country-selector')) {
			return;
		}
		$(this).parent().addClass('focus');
	});
	$('body').on('blur', '.field input[type=text], .field input[type=password], .field textarea', function() {
		if ($(this).parent().hasClass('field-with-phone-country-selector')) {
			return;
		}
		$(this).parent().removeClass('focus');
	});
	
	$('body').on('keyup', '.input-return-submit', function(e) {
		if (e.which == 13) {
			$(this).closest('form').find('.submit-form').trigger('click');
		}
	});
	$('body').on('click','.submit-form',function() {
		var $this = $(this);
		
		var form = $(this).closest('form');
		if (form.hasClass('form-loading')) {
			return;
		}	
		form.removeClass('form-loading');
		form.removeClass('form-error');
		form.find('.field-error').removeClass('field-error');
		
		function printFormErrorMessage(text) {
			if (text == null || text.length == 0) {
				text = Label['errore_interno'];
			}
			form.removeClass('form-loading');
			form.find('.form-error-message').html(text);
			form.addClass('form-error');
			$('body').message({message: text, type: 'error'});
		}
			
		if (Validator.checkIsValidForm(form)) {
			var opt = $this.actionParams();
			form.addClass('form-loading');

			opt.method = opt.method == null ? 'json' : opt.method;
						
			switch(opt.method) {
			case 'get':
			case 'post':
				var check = Utility.checkSubmit();
				form.attr('method', opt.method);
				form.attr('action', opt.url);
				form.find('[name="__a"],[name="__b"],[name="__c"],[name="__d"]').remove()
				form.append('<input name="__a" value="' + check.a + '">');
				form.append('<input name="__b" value="' + check.b + '">');
				form.append('<input name="__c" value="' + check.c + '">');
				form.append('<input name="__d" value="' + check.d + '">');
				form.append('<input name="__e" value="' + check.e + '">');
				form.submit();
				break;
			default:
				$.xajax(opt.url, {
					data: form.serializeObject(),
					success: function (data) {
						if (data.exception != null && data.exception) {
							form.removeClass('form-loading');
							printFormErrorMessage(Label['errore_interno']);
							return;
						}
						if (data.invalid_auth != null && data.invalid_auth) {
							form.removeClass('form-loading');
							printFormErrorMessage(Label['accesso_non_valido']);
							return;
						}
						if (data.success) {						
							if (data.onComplete != null && data.onComplete != '') {
								location.href = data.onComplete;
								return;
							}					
							if (data.data && data.data.onComplete != null && data.data.onComplete != '') {
								location.href = data.data.onComplete;
								return;
							}
							if (opt.onComplete == null) {
								form.removeClass('form-loading');
								return;
							}
							if (opt.onComplete.message && data.message) {
								form.removeClass('form-loading');
								$('body').message({message: data.message, type: 'confirm'});
							}
							if (opt.onComplete.event && opt.onComplete.event != '') {
								$('body').trigger(opt.onComplete.event, [data, $this, opt]);
							}
							switch(opt.onComplete.type) {
							case 'reset':	
								form.trigger('reset');
								form.find('.keypress').removeClass('keypress');
								form.removeClass('form-loading');
								return;
							case 'url':	
								var msg = data.message == null ? '' : '?msg=' + data.message;
								location.href = opt.onComplete.url + msg;
								return;
							case 'show':
								$(opt.onComplete.hide).css({display: 'none'});
								var newCont = $(opt.onComplete.show);
								newCont.fadeIn(500);
								form.removeClass('form-loading');
								if (!$(opt.onComplete.hide).hasClass('hide-no-scroll')) {
									$('html, body').animate({scrollTop:0}, 200);
								}
								if (opt.onComplete.fill_field && data.data) {
									$.each(opt.onComplete.fill_field, function(i, name) {
										if (data.data[name]) {
											newCont.find('[name="' + name + '"]').val(data.data[name]);
										}
									})
								}
								return;
							}
						}
						else {
							if (data.fields_errors) {
								form.removeClass('form-loading');
								form.addClass('form-error');
								var fields = data.fields_errors;
								printFormErrorMessage(Label['campi_con_errore']);
								for (var key in fields) {
									if (fields.hasOwnProperty(key)) {
										var field = form.find('input[name=' + key + ']');
										var wrapper = field.closest('.field-line');
										var text = wrapper.find('.error-text');
										if (text) {
											text.remove();
										}
										wrapper.addClass('field-error');
										wrapper.append('<span class="error-text">' + fields[key] + '</span>');
									}
								}
								form.removeClass('form-loading');
							}
							else {
								form.removeClass('form-loading');
								printFormErrorMessage(data.message);
							}
							if (typeof window['grecaptcha'] !== 'undefined') {
								var recaptcha = form.find('.g-recaptcha');
								if (recaptcha.length > 0) {
									recaptcha.each(function() {
										grecaptcha.reset();
									});
								}
							}
						}
					},
					error: function() {
						form.removeClass('form-loading');
						printFormErrorMessage();
						if (typeof window['grecaptcha'] !== 'undefined') {
							var recaptcha = form.find('.g-recaptcha');
							if (recaptcha.length > 0) {
								recaptcha.each(function() {
									grecaptcha.reset();
								});
							}
						}
					}
				});			
			}
		}
		else {
			printFormErrorMessage(Label['campi_con_errore']);
		}
	});
	
	$('body').on('click', '.checkbox-label', function() {
		$(this).parent().find('.checkbox').click();
	});
	
	$.fn.click_checkbox = function(fireEvent) {
		fireEvent = fireEvent == null ? true : fireEvent;
		var val = '';
		var group = $(this).closest('.checkbox-group');
		if (group.length > 0) {
			if ($(this).hasClass('checkbox-checked')) {
				if (group.hasClass('checkbox-group-deselect')) {
					var input = $(this).find('input');
					if (input.attr('type') == 'checkbox') {
						input.prop('checked', false);
					}
					else {
						input.val('');
					}
					
					$(this).removeClass('checkbox-checked');
					$(this).trigger('checkbox-change', [$(this)]);
				}
				return;
			}
			else {
				var checked = group.find('.checkbox-checked');
				var input = checked.find('input');
				if (input.attr('type') == 'checkbox') {
					input.prop('checked', false);
				}
				else {
					input.val('');
				}
				checked.removeClass('checkbox-checked');
				checked.trigger('checkbox-change', [checked]);
			}
		}
		var group = $(this).closest('.checkbox-group-multiple');
		if (group.length > 0) {

		}
		
		if ($(this).hasClass('checkbox-checked')) {
			$(this).removeClass('checkbox-checked');
		}
		else {
			$(this).addClass('checkbox-checked');
			val = $(this).attr('data-value');
		}
		
		var input = $(this).find('input');
		if (input.attr('type') == 'checkbox') {
			if ($(this).hasClass('checkbox-checked')) {
				input.prop('checked', true);
			}
			else {
				input.prop('checked', false);
			}
		}
		else {
			input.val(val);
		}

		
		if (fireEvent) {
			$(this).trigger('checkbox-change', [$(this)]);
		}
	};
	
	$('body').on('click', '.checkbox', function(e) {
		if ($(this).find('input').attr('type') == 'checkbox') {
			$(this).click_checkbox();
		}
		else {
			e.preventDefault();
			$(this).click_checkbox();
			return false;	
		}
	});

	$('.field-country-phone').countryPhone();

	$('form').attr('autocomplete', 'off');
	$('input,select,textarea').each(function() {
		$(this).attr('autocomplete', Math.random().toString(36).substring(2, 16)+Math.random().toString(36).substring(2, 16));
	});
	$('body').trigger('data-loaded');
});