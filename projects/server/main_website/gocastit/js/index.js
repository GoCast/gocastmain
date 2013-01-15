function autoSlide($slideshow, interval) {
	var $radiobuttons = $('input[type="radio"]', $slideshow),
		checkedIdx = 0;
	setInterval(function() {
		$radiobuttons[(++checkedIdx)%($radiobuttons.length)].checked = 'checked';
	}, interval||5000);
}

$(document).ready(function () {
    autoSlide($('.sp-slideshow'));
});