(function(){


window.hangsper = window.hs = {
	/*
	 * initialize 
	 */


	loading:function() {
		var myVar;
	    myVar = setTimeout(hs.showPage, 500);
	},
	showPage:function() {
		  hs.getId("loader").style.display = "none";
		  hs.getId("respones").style.display = "block";
		},
 	keyPress:function(e){
		    if(e.keyCode === 13){
		        e.preventDefault(); // Ensure it is only this code that rusn

		       hs.search();
			    }
			},

	init:function(){
	    hs.getRecord();
		hs.getWeather();
		var reload = hs.getId("reload");
		reload.addEventListener('click', function(){
			if (hs.getClassName("search")[0].value == "") {
	  			hs.getRecord();
	  		}else{
	  			hs.search();
	  		}
		});

		var goTop = hs.getClassName("side-btn")
		goTop[0].addEventListener('click',function(){
			if (navigator.userAgent.match(/Chrome|AppleWebKit/)) { 
			    window.location.href = "#top";
			    window.location.href = "#top";  /* these take twice */
			} else {
			    window.location.hash = "top";
			}
		});

		var btn = hs.getClassName("btn_search");
	  	btn[0].addEventListener('click', function(){
	  		hs.search();
	  	});

	},

	/**
	 *get Element By Id
	 */

	getId:function(element_id){
		return document.getElementById(element_id);
	},

	/**
	 *
	 *get Element By ClassName
	 *
	 */
	getClassName:function(parentElement,classElement){
		if(classElement == undefined){
			return document.getElementsByClassName(parentElement);
		}
		return parentElement.getElementsByClassName(classElement);
	},

	/**
	 * get Elements By TagName
	 */
	getTagName:function(parentElement,tagElement){		
		if(tagElement == undefined){
			return document.getElementsByTagName(parentElement);
		}
		return parentElement.getElementsByTagName(tagElement);
	},
	/**
	 * Get current time 
	 */
	getCurrentTime:function(){
		var oDate = new Date();
		var aDate = [];
		aDate.push(oDate.getFullYear());
		aDate.push(oDate.getMonth()+1);
		aDate.push(oDate.getDate());
		aDate.push(oDate.getHours());
		aDate.push(oDate.getMinutes());
		aDate.push(oDate.getSeconds());
		aDate.push(oDate.getDay());
		aDate.push(oDate.getTime());
		return aDate;
	},
	KelvinToC:function(temp){
		return (temp - 273.15);
	},
	/**
	 * Ajax connect
	 * 
	 */
	ajax:function(json){
		var timer=null;
		json=json || {};
		if(!json.url){
			alert('Please check your Url');
			return;	
		}
		json.type=json.type || 'get';
		json.time=json.time ||  10;
		json.data=json.data || {};
		if(window.XMLHttpRequest){
			var oAjax=new XMLHttpRequest();
		}else{
			var oAjax=new ActiveXObject('Microsoft.XMLHTTP');	
		}
		switch(json.type.toLowerCase()){
			case 'get':
				oAjax.open('GET',json.url+json2url(json.data),true);
				oAjax.send();
				break;
			case 'post':
				oAjax.open('POST',json.url,true);
				oAjax.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
				oAjax.send(json2url(json.data));
				break;
		}	
		oAjax.onreadystatechange=function(){
			if(oAjax.readyState==4){
				if(oAjax.status>=200 && oAjax.status<300 || oAjax.status==304){
					clearTimeout(timer);
					json.succFn && json.succFn(oAjax.responseText);	
				}else{
					clearTimeout(timer);
					json.errFn && json.errFn(oAjax.status);
				}
			}	
		}
		timer=setTimeout(function(){
			alert('Time Out');
			oAjax.onreadystatechange=null;
		},json.time*1000);	
		
		function json2url(json){
			//json.t = Math.random();
			var arr=[];
			for(var name in json){
				arr.push('/'+json[name]);
			}
			return arr.join('');
		}	
	},
	/**
	 * Ajax - get
	 */
	getAjax:function(jsonData){
		hs.ajax({
			url:jsonData.url,
			data:jsonData.data,
			succFn:jsonData.succFn,
			type:'get'
		});
	},
	/**
	 * Ajax - post
	 */
	postAjax:function(jsonData){
		hs.ajax({
			url:jsonData.url,
			data:jsonData.data,
			succFn:jsonData.succFn,
			type:'post'
		});
	},
	/**
	* redirect
	*/
	redirect:function(url){
		return window.location.href = url;
	},


   /**
	* Get results from google place API requrests   
	*/
	getRecord:function() {
		var lat;
		var lng;
		var searchLat =[];
		var searchLng =[];
		var searchName =[];
		var searchPlace =[];
		var camLat =[];
		var camLng =[];
		var camImage =[]; 
		hs.getId("loader").style.display = "block";
	  	hs.getId("respones").style.display = "none";
	    if (navigator.geolocation) {
	        navigator.geolocation.getCurrentPosition(function(position){
	        	lat = position.coords.latitude; 
	        	lng = position.coords.longitude;
	        	localStorage.setItem('myLat',lat);
	        	localStorage.setItem('myLng',lng);
	    		hs.getId("mylat").value=lat;
	    		hs.getId("mylng").value=lng;
	    		hs.getAjax({
	    			url:'api',
	    			data:{
	    				'latitude':lat,
	    				'longitude':lng
	    			},
	    			succFn:function(data){
	    				hs.getTraffic(camLat,camLng,camImage);
	    				hs.getTemplate(data,searchLat,searchLng,searchPlace,searchName);

	    				setTimeout(function(){
	    					hs.mapInit(lat,lng,searchLat,searchLng,searchPlace,searchName,camLat,camLng,camImage);
	    				}, 2000);
	    				
	    			}
	    		});	    		
	        });
	        
	    }	
	},

	/**
	* HTML template to display return data
	*/
	getTemplate:function(data,searchLat,searchLng,searchPlace,searchName){
		hs.loading();
		var body = hs.getClassName("results");
		var info = JSON.parse(data);
		var location = hs.getId("location");
		location.innerHTML = info[0];
		if(info.length>1){
			for (var i = 1; i<info.length; i++){
				searchLat.push(info[i].geometry.location.lat);
				searchLng.push(info[i].geometry.location.lng);
				searchPlace.push(info[i].place_id);
				searchName.push(info[i].name);
				var openNow="";
				var photo_reference="";
				if (info[i].opening_hours != undefined){
					if (info[i].opening_hours.open_now == true ){
						openNow = "";
					}else{
						openNow = "Closed Now";
					};
				}
				if(info[i].photos != undefined){
					photo_reference = info[i].photos[0].photo_reference;
				}
					
				body[0].innerHTML += '<div class="panel">\
										<a id='+info[i].place_id+'></a>\
										<div class="images">\
											<img style="height:200px;width:100%"src="https://maps.googleapis.com/maps/api/place/photo?maxwidth=500&max&photoreference='+photo_reference+'&key=AIzaSyBCQTbzDuv6xNvUgxpLyA0CUV65mzIPwPc">\
										</div>\
										<div class="panel-b">\
											<div class="name">\
												'+info[i].name+'\
											</div>\
											<div class="address">\
												'+info[i].vicinity+'\
											</div>\
											<div class="rating">\
												'+info[i].rating+'/5 Rating\
											</div>\
											<div class="openStatus">\
												'+openNow+'\
											</div>\
										</div>\
										<div lat="'+info[i].geometry.location.lat+'" lng="'+info[i].geometry.location.lng+'" class="panel-b-right">\
											Directions\
										</div>\
									</div>'
			}
		}else{
			body[0].innerHTML += "No results has been found"
		}
	},


	/**
	* Initialise the map using client Google Map API
	*/
	mapInit:function(lat,lng,searchLat,searchLng,searchPlace,searchName,camLat,camLng,camImage){
		var directionsDisplay;
		var directionsService = new google.maps.DirectionsService();
		var map;
		var origin = new google.maps.LatLng(localStorage.getItem("myLat"), localStorage.getItem("myLng"));

		function initialize(lat,lng,searchLat,searchLng,searchPlace,searchName,camLat,camLng,camImage) {
			directionsDisplay = new google.maps.DirectionsRenderer();
			var mapProp = {
					center:new google.maps.LatLng(lat,lng), zoom:13, mapTypeId:google.maps.MapTypeId.ROADMAP,
					scrollwheel: false
			    };
			    map = new google.maps.Map(document.getElementById('map'),mapProp);
				directionsDisplay.setMap(map);
				hs.setMarkers(map,camLat,camLng,camImage);

				
			    var myLatLng = new google.maps.LatLng(lat, lng);
				var myposition = new google.maps.Marker({
								    map: map,
								    label:"Y",
								    position: myLatLng});

				var marker, i;
				var infowindow = new google.maps.InfoWindow();
				
			    for (i = 0; i < searchLat.length; i++) { 
			        marker = new google.maps.Marker({
			        position: new google.maps.LatLng(searchLat[i], searchLng[i]),
			        map: map
			      });
			        google.maps.event.addListener(marker, 'click', (function(marker, i) {
			        return function() {
			          if (navigator.userAgent.match(/Chrome|AppleWebKit/)) { 
						    window.location.href = "#"+searchPlace[i];
						    window.location.href = "#"+searchPlace[i];  /* these take twice */
						} else {
						    window.location.hash = searchPlace[i];
						}	
			        }
			      })(marker, i));
			        google.maps.event.addListener(marker, 'mouseover', (function(marker, i) {
			        return function() {
			          infowindow.setContent(searchName[i]);
			          infowindow.open(map, marker);
			        }
			      })(marker, i));
			        google.maps.event.addListener(marker, 'mouseout', (function(marker, i) {
			        return function() {
			        	infowindow.setContent(searchName[i]);
			          infowindow.close(map, marker);
			        }
			      })(marker, i));
			  }
			}

			function calcRoute(lat,lng) {
				var destination = new google.maps.LatLng(lat, lng);
				  var request = {
				      origin: origin,
				      destination: destination,
				      travelMode: 'DRIVING'
				  };
				  directionsService.route(request, function(response, status) {
				    if (status == 'OK') {
				      directionsDisplay.setDirections(response);
				    }
				  });
				}

		// google.maps.event.addDomListener(window, 'load', initialize);
		initialize(lat,lng,searchLat,searchLng,searchPlace,searchName,camLat,camLng,camImage);


		//Show routes on the map from your location to destianion 
		var directions = hs.getClassName("panel-b-right");
		for (var i = 0; i<directions.length; i++){
			directions[i].addEventListener('click',function(){ 
				calcRoute(this.getAttribute('lat'),this.getAttribute('lng'));
			});
		}
	},


	/**
	* Search function, get results returned from nodejs
	*/
	search:function(){
  		var search = hs.getClassName("search")[0].value;
  		search = search.replace(/<{1}[^<>]{1,}>{1}/g,"");
  		if (search == "" || search ==null || search ==undefined){
  			alert("Please insert some keywords to search");
  			return;
  		}
  		var lat = hs.getId("mylat").value;
  		var lng = hs.getId("mylng").value;
  		var searchLat =[];
		var searchLng =[];
		var searchName =[];
		var searchPlace =[];
		var camLat =[];
		var camLng =[];
		var camImage =[];  
		hs.getId("loader").style.display = "block";
	  	hs.getId("respones").style.display = "none";
  		hs.getAjax({
    			url:'search',
    			data:{
    				'latitude':lat,
    				'longitude':lng,
    				'search':search
    			},
    			succFn:function(data){
    				hs.getTraffic(camLat,camLng,camImage);
    				hs.getClassName("results")[0].innerHTML="";
    				hs.getTemplate(data,searchLat,searchLng,searchPlace,searchName);
    				setTimeout(function(){
	    					hs.mapInit(lat,lng,searchLat,searchLng,searchPlace,searchName,camLat,camLng,camImage);
	    				}, 2000);
    			}
    		});
					
  	},


  	/**
	* QLDTraffic API, returns camera location and real time images
	*/
  	getTraffic:function(camLat,camLng,camImage){
  		hs.getAjax({
  			url:'traffic',
  			data:{},
  			succFn:function(data){
  				var info = JSON.parse(data);
  				for(var i = 0; i<info.features.length; i++){
  					camLat.push(info.features[i].geometry.coordinates[1]);
  					camLng.push(info.features[i].geometry.coordinates[0])
  					camImage.push(info.features[i].properties.image_url); 
  				} 				
  			}
  		})
  	},

  	/**
	* set Camera marker on the google map
	*/

  	setMarkers:function(map, camLat,camLng,camImage){
		var image = "http://maps.google.com/mapfiles/kml/pal4/icon3.png";
		var infowindow = new google.maps.InfoWindow();
		var camMarker, i;
	    for (i = 0; i < camLat.length; i++) { 
	        camMarker = new google.maps.Marker({
		        position: new google.maps.LatLng(camLat[i], camLng[i]),
		        map: map,
		        icon: image
			});
			google.maps.event.addListener(camMarker, 'click', (function(camMarker, i) {
			        return function() {
			          infowindow.setContent('<img src="'+camImage[i]+'"></img>');
			          infowindow.open(map, camMarker);
			        }
			      })(camMarker, i));
		}
	},


	getWeather:function(){
		var lat =localStorage.getItem("myLat");
		var lng = localStorage.getItem("myLng");
		hs.getAjax({
			url:'/weather',
			data:{
				lat:lat,
				lng:lng
			},
			succFn:function(data){
				var info = JSON.parse(data);
				var temp = hs.KelvinToC(info.main.temp);
				var icon = info.weather[0].icon;
				hs.displayWeather(temp,icon);
			}
		});
	},


	displayWeather:function(temp,icon){
		var iconURL = "http://openweathermap.org/img/w/";
		var weather_i = hs.getId("weather_i");
		var t = hs.getId("temp");

		weather_i.src=iconURL+icon+".png";
		t.innerHTML=JSON.stringify(temp).substring(0,5)+"°C";

	}



 
}

})();

window.onscroll = function(){
    var t = document.documentElement.scrollTop || document.body.scrollTop;
    var map = hs.getClassName( "right_bar" );
    var top = hs.getClassName("side-btn");
    if( t >= 134 ) { //判断
    	map[0].style.top="40px";
        map[0].style.right = 0;
        map[0].style.position= "fixed";
        top[0].style.display = "block";
    } else { 
    	map[0].style.top= "";
    	map[0].style.right = "";
        map[0].style.position= ""; 
        top[0].style.display = "none";
    } 
}