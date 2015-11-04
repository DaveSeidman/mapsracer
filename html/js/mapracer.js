'use strict';

var directionsDisplay;
var directionsService;

var countdownCount = 5;
var countdownInterval;

var racetime = 0;
var racetimeInterval;
var duration;
var mins;
var secs;
var mils;

var dtfval;

var map;
var mapEl;
var info;
var title;

var startTime;

var path;
var positionOnPath = 0;

var origin;
var start;
var finish;
var distance = 0;
var randDistance = 3;
var distToEnd;
var failedAttempts = 0;


var mapStyles = [{"featureType":"all","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"all","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi.park","elementType":"geometry.fill","stylers":[{"visibility":"on"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45},{"visibility":"on"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.highway","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#46bcec"},{"visibility":"on"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"saturation":"-50"},{"lightness":"38"}]},{"featureType":"water","elementType":"labels","stylers":[{"visibility":"off"}]}];


function initMap() {

	mapEl = $("#map");
	title = $("#title");
	info = $("#info");

	dtfval = $("#dtfval");

	origin = new google.maps.LatLng(37.6986795,-97.624137);
	while(distance < randDistance / 2) randomize();

	directionsService = new google.maps.DirectionsService();
	directionsDisplay = new google.maps.DirectionsRenderer();

	var mapOptions = {
	  /*zoom: 11,
	  minZoom:11,
	  maxZoom:11,*/
	  disableDefaultUI: true,
	  center: origin,
	  mapTypeId: google.maps.MapTypeId.ROADMAP,
	  draggable: false,
	  styles: mapStyles
	};
	map = new google.maps.Map(mapEl[0], mapOptions);

	directionsDisplay.setMap(map);
	calcRoute();

	//map.addListener('center_changed', panned);
}


function calcRoute() {

	//console.log("calculating route from", start.lat(), start.lng(), "to", finish.lat(), finish.lng());
	var request = {
		origin:start,
		destination:finish,
		travelMode: google.maps.TravelMode.DRIVING
	};

	directionsService.route(request, function(result, status) {

		if (status == google.maps.DirectionsStatus.OK) {
			path = result.routes[0].overview_path;
			directionsDisplay.setDirections(result);
			

			
			//countdownInterval = setInterval(countdown, 1000);
			setTimeout(startCachingRoute, 500);

		}
		else {
			failedAttempts++;
			if(failedAttempts < 5) randomize();
		}
	});
}

function startCachingRoute() {
	
	map.panTo(start);
	map.maxZoom = 13;
	map.minZoom = 13;
	map.setZoom(13);
	//map.draggable = true;
	cacheRoute();

}

function cacheRoute() {

	//map.panTo(
	//	new google.maps.LatLng(
	//		path[positionOnPath].lat(), 
	//		path[positionOnPath].lng()
	//	)
	//);
	//var point = new google.maps.LatLng(path[positionOnPath].lat(), path[positionOnPath].lng());
	map.setCenter(path[positionOnPath]);
	positionOnPath += 5;
	if(positionOnPath < path.length) setTimeout(cacheRoute, 500);
	else startRace();
}

function countdown() {

	title.text('You have ' + countdownCount + ' seconds to memorize this route...');
	countdownCount--;
	if(countdownCount == 0) title.text('Go!'); 
	if(countdownCount < 0) {

		clearInterval(countdownInterval);
		startRace();
	}
}

function randomize() {
	
	start = new google.maps.LatLng(origin.lat() + Math.random()*randDistance, origin.lng() + Math.random()*randDistance);
	finish = new google.maps.LatLng(origin.lat() + Math.random()*randDistance, origin.lng() + Math.random()*randDistance);
	distance = dist(start, finish);
}

function startRace() {

	//title.fadeOut();
	map.setCenter(start);
	map.draggable = true;
	title.addClass('countdown');
	startTime = Date.now();

	racetimeInterval = setInterval(racing, 10);
}


function racing() {

	var now = Date.now();
	duration = now - startTime;
	mins = Math.floor((duration/1000/60) << 0);
	mins = mins < 10 ? '0' + mins : mins;
	secs = Math.floor((duration/1000) % 60);
	secs = secs < 60 ? '0' + secs : secs;
	mils = (duration % 1000).toString().substr(0,2);
	mils = mils.length < 2 ? '0' + mils : mils;
	//mils = mils < 1000 ? '0' + mils : mils; // this doesn't handle when less than 10 or 100.
	//console.log(mins + ':' + secs + ':' + mils);
	title.text(mins + ':' + secs + ':' + mils);
	
	dtfval.text(dist(map.getCenter(),finish).toPrecision(4)); // moved here because doesn't update on mobile.

}


function dist(point1,point2) {

	var x1 = point1.lat();
	var x2 = point2.lat();
	var y1 = point1.lng();
	var y2 = point2.lng();

	return Math.sqrt(((x2-x1)*(x2-x1)) + ((y2-y1)*(y2-y1)));	
}


// prevent pinch zooming
var tblock = function (e) {
    if (e.touches.length > 1) e.preventDefault()
    return false;
}

window.addEventListener("touchmove", tblock, true);

