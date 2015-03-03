/**
 * app.js
 */

define(function(require, exports, module) {

	exports.template = '<div class="page markdown-body"></div>'

	exports.render = function($elem, data) {
		$elem.append(marked(data))
		$elem.find('pre code').each(function() {
			hljs.highlightBlock(this)
		})
	}

	var data = require('../js/data')

	exports.renderIndex = function() {
		this.iscroll.scrollTo(0, 0)
		if (this.hasRenderIndex) {
			$('#pageHome').into()
			$('#pageHome').parent().height($('#pageHome').height())
			return
		}

		this.hasRenderIndex = true

		var template =

			'<div id="pageHome" class="page in">\
	<ul class="c-wrap">\
		<li class="c-wrap" data-bind="vm:titleList" noscan>\
			<a class="c-inner" href="source/01.md" data-bind="attr-href:url;text:title"></a>\
		</li>\
	</ul>\
</div>'

		$(template).into($('#container>div')).refresh({
			titleList: data
		})
		$('#pageHome').parent().height($('#pageHome').height())
	}

	exports.route = function(hash) {
		if (hash === '/') {
			$('.home').hide()
			this.renderIndex()
		} else {
			var that = this
			hash = hash.slice(1)
			$.each(data, function() {
				if (this.url === hash) {
					that.getItem(hash)
				}
			})
			$('.home').show()
		}
		if (history.length <= 1) {
			$('.back').hide()
		} else {
			$('.back').show()
		}
	}

	exports.init = function() {
		FastClick.attach(document.body)
		this.iscroll = new IScroll('#container', {
			mouseWheel: true,
			tap: true
		})
		this.listen()
		$(window).trigger('hashchange')
	}


	exports.cache = {}
	exports.getItem = function(url) {
		var $target = this.cache[url]
		if ($target) {
			$target.into()
			$target.parent().height($target.height())
			this.iscroll.scrollTo(0, 0)
		} else {
			var that = this
			$target = this.cache[url] = $(this.template).into($('#container>div'))
			$.ajax({
				url: url,
				method: 'GET',
				success: function(data) {
					that.render($target, data)
					$target.parent().height($target.height())
					$(window).trigger('resize')
				}
			})
		}
		this.iscroll.scrollTo(0, 0)
	}

	exports.listen = function() {
		var that = this

		$(window).on('hashchange', function() {
			var hash = '/' + location.hash.replace('#/', '')
			that.route(hash)
		})

		$('#container')
			.on('click', '#pageHome li a', function(e) {
				e.preventDefault()
				location.hash = '/' + this.getAttribute("href")
			})

		$('#header')
			.on('click', '.home', function() {
				location.hash = '/'
			})
			.on('click', '.back', function() {
				if (history.length > 1) {
					history.back()
				}
			})


		var timer
		$(window).on('resize', function() {
			clearTimeout(timer)
			timer = setTimeout(function() {
				that.iscroll.refresh()
			}, 300)
		})
	}
})