$(function(){
	$('.action-open-url-on-change').on('change', function() {
		var url = $(this).find(':selected').attr('data-url');
		if (url == null || url == '') {
			return;
		}
		location.href = url;
	});
});