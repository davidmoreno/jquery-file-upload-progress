/**
 * Based on work by DannYo.
 * 
 * http://stackoverflow.com/questions/166221/how-can-i-upload-files-asynchronously-with-jquery
 * 
 * Do not work on IE. But fails graciously.
 *
 * (C) 2012 David Moreno.
 *
 * BSD Licensed.
 */

$.fn.uploadProgress = function(options){
	$(this).each(function(){
		var form=$(this)
		var action=form.attr('action') || window.location.href
		
		var setDownloadedContents = function(contents){ 
			if (contents.responseText)
				contents=contents.responseText
			if (!opts.onBeforeComplete(contents))
				return;
			try{ // option 1, try to replace contents
				$('body').html($('<body>').html(contents))
				// Now set the new URL with tricks.. FIXME
			}
			catch(e){ // option 2, reload page with GET. Sorry, two full renderings lost.
				action=action.split('#')[0]
				window.location_=action
			}
		}
		
		
		var opts
		opts = jQuery.extend({
			onProgress:function(p){}, // function to be called with ammount of progress done, from 0 to 1.
			onBeforeSend:function(){},
			onBeforeComplete:function(){ return true; }, // returns whether to replace/reload content or not
			onComplete:setDownloadedContents,
			onError:setDownloadedContents,
			onStart:function(){}
		},options)
		opts.form=form
		
		form.submit(function(ev){
			if (ev.isDefaultPrevented())
				return false
			if (opts.form.find('[type=file]').filter(function(){ return $(this).val()!='' }).length==0)
				return true // go on normally, no files to upload.
			opts.onStart()
			var formData = new FormData(form[0]);
			$.ajax({
				url: action, 
				type: 'POST',
				xhr: function() {  // custom xhr
					myXhr = $.ajaxSettings.xhr();
					if(myXhr.upload){ // check if upload property exists
						myXhr.upload.addEventListener('progress',function(ev){
							opts.onProgress(Math.round(ev.loaded * 10000.0 / ev.total)/100.0, ev)
						}, false); // for handling the progress of the upload
					}
					return myXhr;
				},
				//Ajax events
				beforeSend: opts.onBeforeSend,
				success: opts.onComplete,
				error: opts.onError,
				// Form data
				data: formData,
				//Options to tell JQuery not to process data or worry about content-type
				cache: false,
				contentType: false,
				processData: false
			})
			ev.preventDefault()
		})
	})
}
