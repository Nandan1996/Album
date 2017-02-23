(function($){
	var myAlbums = [],
		$firstPage = $('#firstPage'),
		$imgTemp = $('#imgTemp'),
		$pageWrap = $('#page-wrap'),
		$create = $('#create'),
		newHash = "",
		album = null,
		albumIdx = null,
		pIdx = null;

	function setPageUp(){
		if(window.location.hash !== "")
			return false;
		$pageWrap.html($firstPage.html());
		 var shadow = '0 0 30px ';
		$.each(myAlbums, function(i, alb){
			if(alb.photos.length > 0){
				if(alb.photos[0].url.includes('placehold')) {
					shadow = shadow + '#' + alb.photos[0].url.substring(alb.photos[0].url.lastIndexOf('/')+1);
				}
				$($imgTemp.html()).find('img.original').attr({'src': alb.photos[0].url,'albumId': alb.id}).css('box-shadow',shadow).end().find('.title')
				.text(alb.title).next().text(alb.photos.length).end().end().appendTo('#folder');
				shadow = '0 0 30px ';
			}
			else{
				$($imgTemp.html()).find('img.original').attr('alt','Empty Album').attr('albumId', alb.id).end().find('.title')
				.text(alb.title).next().text('0').end().end().appendTo('#folder');
			}

		});
	}
	function loadData(){
		var item = window.localStorage.getItem('albums');
		if(item){
			myAlbums = JSON.parse(item);
			setPageUp();
		}
		else{
			$.ajax({
				url: 'https://jsonplaceholder.typicode.com/photos',
				success: FunP
			});

			$.ajax({
				url: 'https://jsonplaceholder.typicode.com/albums',
				success: FunA
			});
			//parallel execution
			function FunP(){
				FunP.data = arguments[0];
				persist();
			}

			function FunA(){
				FunA.data = arguments[0];
				persist();
			}

			function persist(){
				if(FunP.data && FunA.data){
					var photos = FunP.data;
					var albums = FunA.data;
					var mydata = albums.map(function(album){
							                        album.photos = photos.filter(function(photo){
																		return album.id === photo.albumId;
																});
													return album;
					});
					myAlbums = mydata;
					window.localStorage.setItem('albums',JSON.stringify(myAlbums));
					setPageUp();
				}
			}
		}
	}
	function createHandler(){
		$pageWrap.html($create.html()).find('#header img').css({'width':'45px','height':'45px',
																'left':'calc(100% - 55.5px)',
																'cursor':'pointer'
															}).end().fadeIn(200);
		album = {"photos":[]};
	}

	function isValidAlbum(name){
		if(!name)
			return false;
		var existing = myAlbums.filter(function(album){
			return album.title === name;
		});
		return existing.length == 0;
	}

	function isValidPhoto(title){
		if(!title)
			return false;
		var existing = album.photos.filter(function(ph){
			return ph.title === title;
		})
		return existing.length == 0;
	}

	function photoGetter(){
		var data = $('#popupForm #photoName, #url');
		var title = data[0].value.trim();
		var url = data[1].value;
		if(pIdx != null){
			if(album.photos[pIdx].title === title){
				album.photos[pIdx].url = url;
				album.photos[pIdx].thumbnailUrl = url;
			}
			else if(isValidPhoto(title)){
				album.photos[pIdx].url = url;
				album.photos[pIdx].thumbnailUrl = url;

				album.photos[pIdx].title = title;
			}
			else{
				alert('duplicate title!');
				return false;
			}
			var $photo = $('#folder img[id="' + album.photos[pIdx].id.toString() + '"]');
			$photo.attr('id',album.photos[pIdx].title);
			album.photos[pIdx].id = album.photos[pIdx].title;
			$photo.parent().find('.title').text(title);
			$photo.attr('src',url);
			$('#overlay').fadeOut(200).remove();
			return false;
		}
		else{
			if(isValidPhoto(title)){
				var temp = {"albumId": album.id,
						    "id": title,
						    "title": title,
						    "url": url,
						    "thumbnailUrl": url}
				album.photos.push(temp);
				var shadow = "0 0 15px "
				$($imgTemp.html()).find('img.original').attr({'src':temp.url,'id':temp.id.toString()})
				.css('box-shadow',shadow).end().find('.title')
				.text(temp.title).end().appendTo('#folder').find('#icon').attr('inside','photos');
			}
			else{
				alert('duplicate image!');
				return false;
			}
			$('#overlay').fadeOut(200).remove();
			return false;
		}
	}
	function hashHandler(){
		newHash = window.location.hash.substring(1);
		if(newHash === "albums/create"){
			$pageWrap.fadeOut(200, createHandler);
		}
		else if(newHash.indexOf('album/edit/') == 0){
			$pageWrap.fadeOut(200, albumEditor);
		}
	}

	function persist(){
			window.localStorage.setItem('albums',JSON.stringify(myAlbums));
			window.location.href = "file:///C:/Users/nandanchaudhary/Desktop/htmlCode/Album/index.html"
	}

	function albumHandler(){
		var name = $('#form1 #albumName').val().trim();
		if(albumIdx != null){
			if(myAlbums[albumIdx].title !== name){
				if(isValidAlbum(name)){
					album.title = name;
					myAlbums[albumIdx] = album;
					persist();
					return false;
				}
				else{
					alert("duplicte title");
					return false;
				}
			}
			else{
				myAlbums[albumIdx] = album;
				persist();
				return false;
			}
		}
		else if(isValidAlbum(name)){
			album.title = name;
			album.id = name;
			myAlbums.push(album);
			persist();
			return false;
		}
		else{
			alert('duplicate album title!');
			return false;
		}
	}

	function editHandler(e){
		var $edit = $(e.target);
		if($edit.parent().attr('inside') === "album"){
			window.location.hash = "#album/edit/" + $edit.parent().next().attr('albumId');
		}
		else if($edit.parent().attr('inside') === "photos"){
			var pId = $edit.parent().next().attr('id');
			var photo = album.photos.filter(function(ph, i){
				if (ph.id.toString() === pId){
					pIdx = i;
					return true;
				}
			});
			if(photo.length>0){
				photo = photo[0];
				$($('#popWindow').html()).find('#url').val(photo.url).end().find('#photoName').val(photo.title)
				.end().appendTo('#page-wrap');
			}
		}
	}
	function deleteHandler(e){
		var $delete = $(e.target);
		if($delete.parent().attr('inside') === "album"){
			var idx = null;
			var alId = $delete.parent().next().attr('albumId');
			var concernedAlbum = myAlbums.filter(function(alb, i){
				if(alb.id.toString() === alId){
					idx = i;
					return true;
				}
			});
			if(concernedAlbum.length>0){
				if(concernedAlbum[0].photos.length > 0){
					alert('first delete all photo inside it.');
					return false;
				}
				else{
					if(window.confirm('do you want to delete?')){
						myAlbums.splice(idx,1);
						$('#folder')
						persist();
					}
				}
			}
		}
		else if($delete.parent().attr('inside') === "photos"){
			var pId = $delete.parent().next().attr('id');
			var pidx = null;
			var photo = album.photos.filter(function(ph, i){
				if (ph.id.toString() === pId){
					pidx = i;
					return true;
				}
			});
			if(photo.length>0 && window.confirm('do you want to delete?')){
				$delete.parent().parent().parent().fadeOut(200).remove();
				album.photos.splice(pidx,1);
			}
		}

	}
	function albumEditor(){
		var albumId = newHash.substring(11);
		var concernedAlbum = myAlbums.filter(function(alb, i){
			if(alb.id.toString() === albumId){
				albumIdx = i;
				return true;
			}
		});
		if(concernedAlbum.length > 0){
				$pageWrap.html($create.html()).find('#header img').css({'width':'45px','height':'45px',
															'left':'calc(100% - 55.5px)',
															'cursor':'pointer'
														}).end().find('#albumName').val(concernedAlbum[0].title);
				album = concernedAlbum[0];
				var shadow = "0 0 15px ";
				$.each(album.photos, function(i, ph){
				if(ph.url.includes('placehold')) {
					shadow = shadow + '#' + ph.url.substring(ph.url.lastIndexOf('/')+1);
				}
					$($imgTemp.html()).find('img.original').attr({'src':ph.url,'id':ph.id.toString()})
					.css('box-shadow',shadow).end().find('.title')
					.text(ph.title).end().appendTo('#folder').find('#icon').attr('inside','photos');
					shadow = "0 0 15px ";	
				});
				$pageWrap.fadeIn(200);
		}

	}
	function init(){
		$(window).bind('hashchange', hashHandler);
		$pageWrap.delegate('img[title="Add photo"]','click', function(){
			$pageWrap.append($('#popWindow').html());
			});
		$pageWrap.delegate('#popupForm','submit',photoGetter);
		$pageWrap.delegate('#popupForm','reset',function(e) {
    		$('#overlay').fadeOut(200).remove();
    		return false;
		});
		$pageWrap.delegate('#form1', 'reset',function(e){
			window.location.href = "file:///C:/Users/nandanchaudhary/Desktop/htmlCode/Album/index.html";
			album = null;
			albumIdx = null;
			pIdx = null;
		})
		$pageWrap.delegate('#form1', 'submit',albumHandler);

		$pageWrap.delegate('.edit', 'click', editHandler);
		$pageWrap.delegate('.delete', 'click', deleteHandler);
		loadData();
		hashHandler(); 
	}
	init();
})(jQuery);