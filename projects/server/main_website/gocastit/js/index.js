function autoSlide($slideshow, interval) {
	var $radiobuttons = $('input[type="radio"]', $slideshow),
		checkedIdx = 0, i;
	setInterval(function() {
        for (i=0; i<$radiobuttons.length; i++) {
            checkedIdx = $radiobuttons[i].checked ? i : checkedIdx;
        }
		$radiobuttons[(++checkedIdx)%($radiobuttons.length)].checked = 'checked';
	}, interval||5000);
}

$(document).ready(function () {
    autoSlide($('.sp-slideshow'));
    $('.thumbnails a[rel="popover"]').popover({ html: true }).click(function(e) {
        var evt = e || window.event;
        evt.preventDefault();
    }).hover(function() {
        $(this).popover('show');
    }, function() {
        $(this).popover('hide');
    });
});