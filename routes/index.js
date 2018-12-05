var express = require('express');
var router = express.Router();
var request = require('request');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home' });
});
router.get('/api/:latitude/:longitude', function(req,res,next) {
	request('https://maps.googleapis.com/maps/api/geocode/json?latlng='+req.params.latitude+','+req.params.longitude+'&key=AIzaSyBCQTbzDuv6xNvUgxpLyA0CUV65mzIPwPc',function(error, response, body){
		 if (!error && response.statusCode == 200) {
		 	var data = [];
	      	var info = JSON.parse(body);
	      	data.push(info.results[0].address_components[2].short_name);
	      	request('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='+req.params.latitude+','+req.params.longitude+'&radius=5000&type=restaurant&key=AIzaSyBCQTbzDuv6xNvUgxpLyA0CUV65mzIPwPc',function(error, response, body){
		 		if (!error && response.statusCode == 200) {
			      	var info = JSON.parse(body);
			      	for (var i = 0; i< info.results.length; i ++){
			      		data.push(info.results[i]);
			      	}
			      	res.send(data);
		    	}
			});
    	}
	})
});


router.get('/search/:latitude/:longitude/:search', function(req, res, next) {  
 	request('https://maps.googleapis.com/maps/api/geocode/json?latlng='+req.params.latitude+','+req.params.longitude+'&key=AIzaSyBCQTbzDuv6xNvUgxpLyA0CUV65mzIPwPc',function(error, response, body){
		 if (!error && response.statusCode == 200) {
		 	var data = [];
	      	var info = JSON.parse(body);
	      	data.push(info.results[0].address_components[2].short_name);
		  	request('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='+req.params.latitude+','+req.params.longitude+'&radius=5000&type=restaurant&keyword='+req.params.search+'&key=AIzaSyBCQTbzDuv6xNvUgxpLyA0CUV65mzIPwPc',function(error, response, body){
		 		if (!error && response.statusCode == 200) {
			      	var info = JSON.parse(body);
			      	for (var i = 0; i< info.results.length; i ++){
			      		data.push(info.results[i]);
			      	}
			      	res.send(data);
		    	}
		   	});
    	}

	});
});


router.get('/traffic',function(req,res,next){
	request('https://api.qldtraffic.qld.gov.au/v1/webcams?apikey=3e83add325cbb69ac4d8e5bf433d770b',function(error, respones,body){
		if(!error && respones.statusCode == 200){
	      	res.send(body);
		}
	});
});



router.get('/weather/:lat/:lng',function(req,res,next){
	request('https://api.openweathermap.org/data/2.5/weather?lat='+req.params.lat+'&lon='+req.params.lng+'&appid=2ec2cfc3871ef7259219c2e6f5826f99',function(error, respones,body){
		if(!error && respones.statusCode == 200){
	      	res.send(body);
		}
	});
})

module.exports = router;
