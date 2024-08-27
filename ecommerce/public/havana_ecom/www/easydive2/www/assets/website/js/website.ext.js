function image_articolo_loaded($this, placeholder) {
	placeholder = placeholder == null ? '.placeholder' : placeholder;
	$this = $($this);
	placeholder = $this.closest('.item-img').find(placeholder);
	if (placeholder.closest('.item-inner').length > 0) {
		placeholder.css({visibility: 'hidden'});
	}
	else {
		placeholder.remove();
	}
	$this.css({display: 'inline-block'});
}


$(function(){	
	$('body').on('click', '[data-open-url]', function(e) {
		location.href = $(this).data('open-url');
	});
	
	$('.etichetta-whatsapp-over').on('mouseover', function(e) {
		$(this).parent().animate({
			right: 0
		});
	});
	$('.etichetta-whatsapp-over').on('mouseout', function() {
		$(this).parent().animate({
			right: '-190px'
		}, 200);
	});

	let data_level;
	let second_data_level;
	let tree_menu = $('header .options li.tree');
	tree_menu.on('mouseover', function () {
		data_level = parseInt($(this).attr("data-level"));
		$(this).find('a.level' + data_level).addClass('selected');
		second_data_level = data_level + 1;
		$(this).find('div.ul-tree[data-level=' + second_data_level + ']').addClass('open');

		//Nasconde tutti gli ul di livello inferiore al terzo
		$(this).find('div.ul-tree').each(function() {
			let level = parseInt($(this).attr('data-level'));
			if (level > 3) {
				$(this).addClass('hidden');
			}
		});
	});

	tree_menu.on('mouseout', function() {
		let data_level_out = parseInt($(this).attr("data-level"));
		$(this).find('a.level' + data_level_out).removeClass('selected');
		data_level_out ++;
		$(this).find('div.ul-tree[data-level=' + data_level_out + ']').removeClass('open');
		height_son = 0;
		height_father_final = 0;
		$(this).find('div.ul-tree').css({height: 'auto'});
	});

	let tree_menu_second_lvl = $('header .options li.tree ul li.tree');

	tree_menu_second_lvl.on('mouseover', function () {
		let father = $(this).closest('.ul-tree[data-level="2"]');  // Trova l'elemento <ul> superiore
		let ul_father = $(this).closest('.ul-tree[data-level="2"] ul');
		let height_father = father.outerHeight();

		let son = $(this).find('.ul-tree');
		son.addClass('open');

		setTimeout(() => {
			let height_son = son.outerHeight();

			if (height_son > 0) {
				let height_father_final = height_father + height_son + 12;

				ul_father.css({ height: height_father_final });
			}
		}, 0);
	});

	tree_menu_second_lvl.on('mouseout', function () {
		let son = $(this).find('.ul-tree');
		son.removeClass('open');

		let father = $(this).closest('.ul-tree[data-level="2"] ul');
		father.css({ height: '' }); // Ripristina l'altezza originale
	});

	function crea_menu(elem) {
		elem.attr('href', 'javascript:void(0);');
		elem.on('click', function(e) {
			e.preventDefault();
			if ($(this).hasClass('nav-menu-laterale-btn')) {
				$(this).find('.menu-icon').toggleClass('is-active');
				if ($('body').hasClass('menu-laterale-show')) {
					hide_menu();
					return;
				}
			}
			else {
				$('.menu-icon.is-active').removeClass('is-active');
			}

			$('.layer-menu-wrapper').remove();
			var content = $(elem.attr('data-load-content')).html();
			var layerBlack = elem.attr('data-layer-black');

			var offset = elem.offset();
			$('body').addClass('menu-laterale-show');
			
			var top = 0;
			var cls = 0;
			if ($(this).hasClass('nav-menu-laterale-btn')) {
				top = 47;
				cls = ' hide-layer-menu-toolbar';
			}
			var html = [
				'<div class="layer-menu-wrapper layer-menu-wrapper-black', cls,'">',
				'<div class="layer-menu-toolbar"><span class="layer-menu-close">',
					'<img src="/assets/website/img/ico-close.png">',
				'</span></div>',
				'<div class="layer-menu-body">', content,'</div>',
				'</div>'
			];

			var wrapper = $(html.join(''));
			wrapper.css({top: e.pageY - $(document).scrollTop(), left: e.pageX});
			$('body').append(wrapper);
			if ($(this).closest('.nav-menu-laterale-categoria')) {
				$('.layer-menu-wrapper .nav-menu-laterale-categoria a.level1').attr('href', 'javascript:void(0);')
			}
			wrapper.animate({
				bottom: 0,
				top: top,
				left: 0,
				right: 0
			});
			if ($('.item-acquista-step').length > 0 && $('.item-acquista-step').loadNextStepAcquista) {
				$('.item-acquista-step').attr('data-current-step', -1);
				$('.item-acquista-step').loadNextStepAcquista();
			}
		});
	}
	
	function hide_menu() {
		$('body').removeClass('menu-laterale-show');
		$('body').trigger('menu-laterale-hide');
		$('.layer-menu-wrapper').fadeOut(function() {
			$(this).remove();
		});	
	}
	
	$('body').on('click', '.menu-submenu', function() {
		if ($(this).hasClass('show-submenu')) {
			$(this).removeClass('show-submenu');
		}
		else {
			$(this).addClass('show-submenu');
		}
	});
	
	$('body').on('click', '.layer-menu-wrapper .selector-header', function() {
		if (!$('body').hasClass('touch') && $(window).width() > 600) {
			return;
		}
		var cont = $(this).closest('.item-filter');
		if (cont.hasClass('selector-body-show')) {
			cont.removeClass('selector-body-show');
		}
		else {
			cont.addClass('selector-body-show');
		}		
	});

	$('body').on('click', '.layer-menu-close, .search-toolbar-label, .item-acquista-step-close', hide_menu);
	
	$('#search .search.doofinder').on('click', function() {
		var $this = $(this);
		setTimeout(function() {
			$this.find('input').focus();
			$this.find('input').trigger('focus');
		}, 100);
	});	
	$('#search .search[data-load-content], .item-button-acquista').each(function() {
		crea_menu($(this));
	});
	
	function addMenuLaterale() {
		var menu = $('.nav-menu-laterale-btn');
		if (menu.length > 0) {
			return;
		}
		var html = [
			'<div class="nav-menu-laterale-btn" data-load-content=".nav-menu-laterale-window">', 
				'<div class="menu-icon">',
					'<span></span>',
					'<span></span>',
					'<span></span>',
					'<span></span>',
				'</div>',
			'</div>'
		];
		var btn = $(html.join(''));			
		$('header').append(btn);
		crea_menu(btn);
	}
	addMenuLaterale();

	$('body').on('click', '.action-applica-seleziona-modello', function() {
		var cont = $(this).closest('.menu-seleziona-modello-wrapper');
		var fotocamera = cont.find('.field-line-step-modello select').val();
		var url = '/search?coll_id=' + fotocamera + '&fotocamera_id=' + fotocamera;
		if (Params.url_lang != 'it') {
			url = '/' + Params.url_lang + url;
		}
		location.href = url;
	});
	$('body').on('change', '.action-on-change-seleziona-modello', function() {
		var fotocamera = $(this).val();
		var url = '/search?coll_id=' + fotocamera + '&fotocamera_id=' + fotocamera;
		if (Params.url_lang != 'it') {
			url = '/' + Params.url_lang + url;
		}
		location.href = url;
	});
		
	$('.loghi').slick({
		dots: false,
		infinite: true,
		speed: 5000,
		slidesToShow: 4,
		slidesToScroll: 1,
		accessibility: true,
		arrows: false,
		autoplay: true,
		autoplaySpeed: 0,
		responsive: [
			{
				breakpoint: 1024,
				settings: {
					slidesToShow: 3,
					slidesToScroll: 1
				}
			},
			{
				breakpoint: 600,
				settings: {
					slidesToShow: 2,
					slidesToScroll: 1
				}
			},
			{
				breakpoint: 480,
				settings: {
					slidesToShow: 2,
					slidesToScroll: 1
				}
			}
		]
	});

	$(".carosello").slick({
		slidesToShow: 5,          // Mostra 5 slide alla volta
		slidesToScroll: 2,        // Scorri 2 slide alla volta
		infinite: true,           // Abilita lo scorrimento infinito
		centerMode: true,         // Centra il contenuto del carosello
		focusOnSelect: false,     // Disabilita lo spostamento del focus sullo slide selezionato
		swipe: true,              // Abilita lo swipe per dispositivi touch
		touchMove: true,          // Abilita il movimento touch per dispositivi touch
		variableWidth: true
	});
	
	$('.btn-lingua').html($('.lingue .selected').html());


	$('.item-list-slick').slick({
		dots: false,
		infinite: false,
		speed: 300,
		centerMode: false,
		variableWidth: true,
		arrows: false,
		responsive: [
			{
				breakpoint: 1024, // Schermi larghi
				settings: {
					slidesToShow: 5,
					slidesToScroll: 1
				}
			},
			{
				breakpoint: 992, // Tablet
				settings: {
					slidesToShow: 4,
					slidesToScroll: 1
				}
			},
			{
				breakpoint: 768, // Tablet e mobile
				settings: {
					slidesToShow: 3,
					slidesToScroll: 1
				}
			}
		]
	});
	$('.card_listino').slick({
		dots: true,
		infinite: false,
		speed: 300,
		centerMode: false,
		variableWidth: true,
		arrows: false,
		responsive: [
			{
				breakpoint: 1024, // Schermi larghi
				settings: {
					slidesToShow: 4,
					slidesToScroll: 1
				}
			},
			{
				breakpoint: 992, // Tablet
				settings: {
					slidesToShow: 3,
					slidesToScroll: 1
				}
			},
			{
				breakpoint: 768, // Tablet e mobile
				settings: {
					slidesToShow: 2,
					slidesToScroll: 1
				}
			}
		]
	});
	$(".blog-evidenza").slick({
		centerMode: true,
		centerPadding: "0px",
		slidesToShow: 3,
		slidesToScroll: 1,
		dots: true,
		focusOnSelect: true
	  });
	  
	
});


/*Inizio codice Federico*/
function headerVerticalMenu() {
    var overlay = document.getElementById('header-overlay');
    var verticalmenu = document.getElementById('header-vertical-menu');
	var menu = document.getElementById('header-menu-button');
	var closeMenu = document.getElementById('header-close-menu-button');

    if (overlay.style.display === 'block') {
        overlay.style.display = 'none';
        verticalmenu.style.display = 'none';
		menu.style.display = 'block';
		closeMenu.style.display = 'none';
    } else {
        overlay.style.display = 'block';
        verticalmenu.style.display = 'block';
		menu.style.display = 'none';
		closeMenu.style.display = 'block';
    }
}


function categoriesVerticalMenu(element, titleValue, categoryValue) {
    var dropdown = element.querySelector('.mobile-header-dropdown');
    var treeMenu = element.querySelector('header .mobile-tree-menu > ul');
    var title = document.querySelector('.vertical-menu-title');
    var secondTitle = document.querySelector('.second-title');
    var thirdTitle = document.querySelector('.third-title');
    var span1 = document.querySelector('.category-title-li .span1');
    var span2 = document.querySelector('.category-title-li .span2');
    var secondTitleUl = element.querySelector('.ul-second-dropdown');
    var thirdTitleUl = element.querySelector('.ul-third-dropdown');
    var headerVerticalMenu = document.getElementById('header-vertical-menu');

    function updateTreeMenuPosition() {
        if (window.matchMedia("(max-width: 900px)").matches) {
            treeMenu.style.top = '90px';
        } else {
            treeMenu.style.top = '140px';
        }
    }
    updateTreeMenuPosition();

    // Get the width of the header-vertical-menu in pixels
    function getHeaderVerticalMenuWidth() {
        return headerVerticalMenu ? headerVerticalMenu.offsetWidth + 'px' : '45.5%';
    }

    // Gestore evento Title
    title.onclick = function() {
        title.style.color = '#000';
        secondTitle.style.color = '#fff';
        thirdTitle.style.color = '#000';
        span1.style.display = 'none';
        span2.style.display = 'none';
        secondTitleUl.style.display = 'none';
        thirdTitleUl.style.display = 'none';
        secondTitle.textContent = ''; 
        thirdTitle.textContent = '';   
        dropdown.style.display = 'none'; 
    };
    // Gestore evento SecondTitle
    secondTitle.onclick = function() {
        title.style.color = '#8F8F8F';
        span1.style.display = 'block';
        secondTitleUl.style.display = 'block';
        thirdTitle.style.color = '#fff';  
        thirdTitleUl.style.display = 'none'; 
        span2.style.display = 'none';
    };

    var headerVerticalMenuWidth = getHeaderVerticalMenuWidth();

    if (titleValue === 2) {
        // Secondo dropdown
        title.style.color = '#8F8F8F';
        span1.style.display = 'block';
        secondTitle.style.color = '#000';
        secondTitle.textContent = `${categoryValue}`;
        secondTitleUl.style.display = 'block';
        dropdown.style.display = 'block';
        dropdown.style.position = 'fixed';
        dropdown.style.minWidth = headerVerticalMenuWidth;
        treeMenu.style.left = '0';
    } else if (titleValue === 3) {
        // Terzo dropdown
        title.style.color = '#8F8F8F';
        span2.style.display = 'block';
        secondTitle.style.color = '#8F8F8F';
        thirdTitle.style.color = '#000';
        thirdTitle.textContent = `${categoryValue}`;
        thirdTitleUl.style.display = 'block';
        dropdown.style.display = 'block';
        dropdown.style.position = 'fixed';
        dropdown.style.minWidth = headerVerticalMenuWidth;
        treeMenu.style.left = '0';
    }
}

window.addEventListener('resize', function() {
    var treeMenu = document.querySelector('header .mobile-tree-menu > ul');
    if (treeMenu) {
        updateTreeMenuPosition();
    }
});



function showOverlay() {
	var overlay = document.getElementById('header-overlay');
	var card = document.getElementById('placeholder-card-ul');

	if (overlay.style.display === 'block') {
		overlay.style.display = 'none';
		card.style.display = 'none';
	} else {
		overlay.style.display = 'block';
		card.style.display = 'inline-flex';
	}
}
function hideOverlay() {
	var overlay = document.getElementById('header-overlay');
	var card = document.getElementById('placeholder-card-ul');

	if (overlay.style.display === 'block') {
		overlay.style.display = 'none';
		card.style.display = 'none';
	} else {
		overlay.style.display = 'block';
		card.style.display = 'inline-flex';
	}
}
/*Fine codice Federico*/