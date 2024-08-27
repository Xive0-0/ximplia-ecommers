$(function(){
	var msg = Utility.getURLParameter('msg');
	if (msg != null && msg != '') {
		$('body').message(msg);
	}
	
	if ($('.list-log-content').length > 0) {
		$('body').on('update-log-user', function() {
			$('.list-log-content').load('/account/my/log/list', {_lang: Params.url_lang});
		});	
		$('body').trigger('update-log-user');
	}
	
	$('.action-delete').each(function() {
		var id = $(this).closest('tr').attr('data-id');
		var url = $(this).attr('href');
		$(this).blur();
		$(this).attr('href', 'javascript:void(0)');
		$(this).click(function() {
			if (confirm('Eliminare la voce selezionata?')) {
				$this = $(this);
				$(this).addClass('action-loading');
				$.xajax(url, {
					data: {
						id: id
					},
					success: function (data) {
						if (data.success) {
							$('body').message(Label['voce_eliminata']);
							$this.closest('tr').remove();
						}
						else {
							$('body').message({message: data.message, type: 'error'});
						}
					},
					error: function() {
						$(this).removeClass('action-loading');
						$('body').message({message: Label['errore_interno'], type: 'error'});
					}
				});
			}
		});
	});
	
	$('.action-default').each(function() {
		var id = $(this).closest('tr').attr('data-id');
		var url = $(this).attr('href');
		$(this).blur();
		$(this).attr('href', 'javascript:void(0)');
		$(this).click(function() {
			if (confirm(Label['impostare_come_default'])) {
				$this = $(this);
				$(this).addClass('action-loading');
				$.xajax(url, {
					data: {
						id: id
					},
					success: function (data) {
						if (data.success) {
							$this.removeClass('action-loading');
							$this.closest('table').find('.selected').removeClass('selected');
							$('body').message(Label['voce_impostata']);
							$this.addClass('selected');
						}
						else {
							$('body').message({message: data.message, type: 'error'});
						}
					},
					error: function() {
						$(this).removeClass('action-loading');
						$('body').message({message: Label['errore_interno'], type: 'error'});
					}
				});
			}
		});
	});
});