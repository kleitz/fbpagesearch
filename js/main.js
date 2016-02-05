
var GRAPH_API = "https://graph.facebook.com/",
	ACCESS_TOKEN = "<token>";

var results = [],
	favourites = [];

var ajaxGET = function(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
    	if(xhr.status === 200) {
      		callback(200, xhr.responseText);
      	}
      	else{
      		callback(xhr.status);
      	}
    }
  };
  
  xhr.open("GET", url, true);
  xhr.send();
}

var search = function(){
	var search_url = GRAPH_API + "search?q="+ document.getElementById('search-text').value + "&type=page&fields=id,name,picture,category,website,likes&access_token=" + ACCESS_TOKEN;
	ajaxGET(search_url, getPages);
	document.getElementById('results').innerHTML = "<br> <div class='text-center'> Searching... </div> <br>";
}

var getPages = function(status, data){
	
	if(status === 200){
		var results = JSON.parse(data).data;
		results = sortList(results, comparator);
		showList(results);
	}
	else{
		document.getElementById('results').innerHTML = "<br> <div class='text-center error'> Unable to load. Try again. </div> <br>";
	}

}

var showList = function(items){
	var renderItem = "";
	results = items;

	for (var i = 0; i < items.length; i++) {
		renderItem += "<div class='page' data-page-id='" + items[i].id + "' data-index='" + i + "'>";

		if(isFavourited(items[i].id)){
			renderItem += "<small class='favourite' href='' onclick=unfavourite(event," + items[i].id + ")>Unfavourite</small>";
		}
		else{
			renderItem += "<small class='favourite' href='' onclick=favourite(event," + items[i].id + ")>Favourite</small>";	
		}
							
		renderItem += "<img src=" + items[i].picture.data.url +
							"> \
						<span>" +
							"<strong>" + items[i].name + "</strong> <br>" +
							"<span class='category'>" + items[i].category + "</span>";

		if(items[i].website){
			renderItem += "<br> <a href='" + items[i].website + "' target='_blank'><small>" + items[i].website + "</small></a> ";
		}

		renderItem +=	"<br> <small class='likes'>" + items[i].likes + " like this </small>" +
						"</span></div>";
		
	}

	if(!items.length){
		renderItem = "<br> <div class='text-center'> No results available. </div> <br>";
	}

	function isFavourited(page_id){
		var isfav = false;
		favourites.forEach(function(page){
			if(page_id == page.id){
				isfav = true;
			}
		});
		return isfav;
	}

	document.getElementById('results').innerHTML = renderItem;

	document.getElementById('results').addEventListener("click", function(e){
		if((e.target.parentElement.nodeName.toLowerCase() !== 'a') && (e.target.className !== 'favourite')){
			var page_id = null;
			if(e.target.classList.length && (e.target.classList[0] === "page")){
				page_id = e.target.getAttribute('data-page-id');
			}
			else{
				cur_node = e.target.parentElement;
				while((cur_node.nodeName.toLowerCase() !== 'div') || !cur_node.classList.length || (cur_node.classList[0] !== "page")){
					cur_node = cur_node.parentElement;
				}
				page_id = cur_node.getAttribute('data-page-id');
			}
			showMoreInfo(page_id);
		}
	}, false);

}

var comparator = function(a, b) {
  return a.name.localeCompare(b.name);
}

var sortList = function (arr, cmp) {
  cmp = cmp || comparator;
  var temp;
  for (var i = 0; i < arr.length; i++) {
    for (var j = i; j > 0; j--) {
      if (cmp(arr[j], arr[j - 1]) < 0) {
        temp = arr[j];
        arr[j] = arr[j - 1];
        arr[j - 1] = temp;
      }
    }
  }
  return arr;
}

var showMoreInfo = function(page_id){
	var url = GRAPH_API + "v2.5/" + page_id + "?fields=id,name,picture,category,website,likes,about,description,cover&access_token=" + ACCESS_TOKEN;
	ajaxGET(url, showMore);
	document.getElementById('full-page').className = "";
	document.getElementById('full-page').innerHTML = "<br> <div class='text-center'> Loading... </div> <br>";
}

var showMore = function(status, data){
	if(status === 200){
		page_info = JSON.parse(data);
		var renderPage = "";
		renderPage += " <span class='close' title='Close' onclick='closePage()'>X</span> " +
						"<div class='banner text-center'>" +
							"<img class='cover' src=" + page_info.cover.source + ">" +
						
				            "<div class='breif'> \
				                <img src=" + page_info.picture.data.url + "> \
				                <span><strong>" + page_info.name + "</strong> <br> \
				                <span>" + page_info.category + "</span> </span>\
				            </div>" +
				        "</div><br><br>" +
			            "<dl class='more'>" +
			            	"<dt>Likes</dt>" +
			            	"<dd>" + page_info.likes + "</dd>" +
			                "<dt>About</dt>" +
			                "<dd>" + page_info.about + "</dd>" +
			                "<dt>Description</dt>" +
			                "<dd>" + page_info.description + "</dd>" +
			            "</dl>";

        document.getElementById('full-page').innerHTML = renderPage;
        document.body.style.overflowY = "hidden";
        
	}
	else{
		document.getElementById('full-page').innerHTML = "<br> <div class='text-center error'> Unable to load. Try again. </div> <br>";
	}
}

var closePage = function(){
	document.getElementById('full-page').className = "hide";
    document.body.style.overflowY = "initial";
}

var favourite = function(e, page_id){
	results.forEach(function(page){
		if(page_id == page.id){
			favourites.push(page);
		}
	});

	var index = e.target.parentElement.getAttribute('data-index');
	var pages_elms = document.getElementsByClassName('page');
	pages_elms[index].querySelector('.favourite').remove();
	var unfav = document.createElement('small');
	unfav.className = "favourite";
	unfav.innerHTML = "Unfavourite";
	unfav.addEventListener("click", function(e){
		unfavourite(e, page_id);
	}, false);
	pages_elms[index].appendChild(unfav);
}

var unfavourite = function(e, page_id){
	results.forEach(function(page, index){
		if(page_id == page.id){
			favourites.splice(index, 1);
		}
	});

	var index = e.target.parentElement.getAttribute('data-index');
	var pages_elms = document.getElementsByClassName('page');
	pages_elms[index].querySelector('.favourite').remove();
	var unfav = document.createElement('small');
	unfav.className = "favourite";
	unfav.innerHTML = "Favourite";
	unfav.addEventListener("click", function(e){
		favourite(e, page_id);
	}, false);
	pages_elms[index].appendChild(unfav);
}

var viewFavourites = function(){
	showList(favourites);
}
