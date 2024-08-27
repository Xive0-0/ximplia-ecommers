$(function(){	
	function update_slide() {
		$('.slide,.slide-link').css({height: $(window).height()});	
	}
	var prec_width = $(window).width();
	$(window).on('resize', function() {
		if ($('body').hasClass('redirect')) {
			return;
		}
		if ($(window).width() > 600 && prec_width != $(window).width()) {
			$('body').addClass('redirect');
			location.href = '' + location.href;
			return;
		}
		update_slide();	
	});
			
	update_slide();
	
	$('.slide.uomo, .slide.donna').each(function() {
		var clone = $(this).find('a').clone();
		clone.addClass('slide-link');
		clone.html('');
		$(this).prepend(clone);
	});
});