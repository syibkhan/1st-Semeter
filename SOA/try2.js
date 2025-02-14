<script type="text/JavaScript">
google.load('maps', '2'); // Load version 2 of the Maps API
function timezoneLoaded(obj) {
var timezone = obj.timezoneId;
if (!timezone) {
return;
}
document.getElementById('timezone').innerHTML = timezone;
document.getElementById('timezonep').style.display = 'block';
// Find out what time it is there
var s = document.createElement('script');
s.src = "http://json-time.appspot.com/time.json?callback=timeLoaded&tz=" + timezone;
s.type = 'text/javascript';
document.getElementsByTagName('head')[0].appendChild(s);
}
function timeLoaded(obj) {
if (obj.datetime) {
document.getElementById('datetime').innerHTML = obj.datetime;
document.getElementById('datetimep').style.display = 'block';
}
}
function updateLatLonFields(lat, lon) {
lat = lat.toFixed(5);
lon = lon.toFixed(5);
document.getElementById("latlon").innerHTML = lat + ', ' + lon;
document.getElementById("wkt").innerHTML = 'POINT('+lon+' '+lat +')';
document.getElementById("geojson").innerHTML = '{ "type": "Point", "coordinates": [' + [lon, lat] + '] }';
document.getElementById("wikipedia").innerHTML = '{{Coord|' + lat + '|' + lon + '|display=title}}';
}
function showMap() {
window.gmap = new google.maps.Map2(document.getElementById('gmap'));
gmap.addControl(new google.maps.LargeMapControl());
gmap.addControl(new google.maps.MapTypeControl());
gmap.enableContinuousZoom();
gmap.enableScrollWheelZoom();
var timer = null;
google.maps.Event.addListener(gmap, "move", function() {
var center = gmap.getCenter();
updateLatLonFields(center.lat(), center.lng());
// Wait a second, then figure out the timezone
if (timer) {
clearTimeout(timer);
timer = null;
}
timer = setTimeout(function() {
document.getElementById('timezonep').style.display = 'none';
document.getElementById('datetimep').style.display = 'none';
// Look up the timezone using geonames
var s = document.createElement('script');
s.type = 'text/javascript';
s.src = "http://ws.geonames.org/timezoneJSON?lat=" + center.lat() +
"&lng=" + center.lng() + "&callback=timezoneLoaded";
document.getElementsByTagName("head")[0].appendChild(s);
}, 1500);
});
google.maps.Event.addListener(gmap, "zoomend", function(oldZoom, newZoom) {
document.getElementById("zoom").innerHTML = newZoom;
});
google.maps.Event.addDomListener(document.getElementById('crosshair'),
'dblclick', function() {
gmap.zoomIn();
}
);
/* HAITI */
getOsmUrl = function (a,b,c) {
var url = 'http://tile.openstreetmap.org/' + b + "/" + a.x + "/" + a.y + ".png";
return url;
}
var copycol1 = new GCopyrightCollection("");
var copy1 = new GCopyright(1, new GLatLngBounds(new GLatLng(-90,-180),new GLatLng(90,180)), 0, "openstreetmap.org");
copycol1.addCopyright(copy1);
var osm = new GTileLayer(copycol1,1,17);
osm.myBaseURL = "http://tile.openstreetmap.org/";
osm.getTileUrl = getOsmUrl;
osm.isPng = function () { return true;}
osm.getOpacity = function() {return 1.0;}
var osm_map = new GMapType([osm], G_SATELLITE_MAP.getProjection(), "OSM", G_SATELLITE_MAP);
gmap.addMapType(osm_map);
gmap.setMapType(osm_map);
getHaitiUrl = function (a,b,c) {
var url = 'http://live.openstreetmap.nl/haiti/' + b + "/" + a.x + "/" + a.y + ".png";
return url;
}
var copycol = new GCopyrightCollection("");
var copy = new GCopyright(1, new GLatLngBounds(new GLatLng(-90,-180),new GLatLng(90,180)), 0, "haiti.openstreetmap.nl");
copycol.addCopyright(copy);
var haiti = new GTileLayer(copycol,1,17);
haiti.myBaseURL = "http://tile.openstreetmap.org/";
haiti.getTileUrl = getHaitiUrl;
haiti.isPng = function () { return true;}
haiti.getOpacity = function() {return 1.0;}
var haiti_map = new GMapType([haiti], G_SATELLITE_MAP.getProjection(), "OSM Haiti Live", G_SATELLITE_MAP);
gmap.addMapType(haiti_map);
//gmap.setMapType(haiti_map);
// Default view of the world
gmap.setCenter(
new google.maps.LatLng(18.547324589827422, -72.388916015625), 12
);
/* If we have a best-guess for the user's location based on their IP,
show a "zoom to my location" link */
if (google.loader.ClientLocation) {
var link = document.createElement('a');
link.onclick = function() {
gmap.setCenter(
new google.maps.LatLng(
google.loader.ClientLocation.latitude,
google.loader.ClientLocation.longitude
), 8
);
return false;
}
link.href = '#'
link.appendChild(
document.createTextNode('Zoom to my location (by IP)')
);
var form = document.getElementById('geocodeForm');
var p = form.getElementsByTagName('p')[0];
p.appendChild(link);
}
// Set up Geocoder
window.geocoder = new google.maps.ClientGeocoder();
// If query string was provided, geocode it
var bits = window.location.href.split('?');
if (bits[1]) {
var location = decodeURI(bits[1]);
document.getElementById('geocodeInput').value = location;
geocode(location);
}
// Set up the form
var geocodeForm = document.getElementById('geocodeForm');
geocodeForm.onsubmit = function() {
geocode(document.getElementById('geocodeInput').value);
return false;
}
}
var accuracyToZoomLevel = [
1, // 0 - Unknown location
5, // 1 - Country
6, // 2 - Region (state, province, prefecture, etc.)
8, // 3 - Sub-region (county, municipality, etc.)
11, // 4 - Town (city, village)
13, // 5 - Post code (zip code)
15, // 6 - Street
16, // 7 - Intersection
17, // 8 - Address
17 // 9 - Premise
];
function geocodeComplete(result) {
if (result.Status.code != 200) {
alert('Could not geocode "' + result.name + '"');
return;
}
var placemark = result.Placemark[0]; // Only use first result
var accuracy = placemark.AddressDetails.Accuracy;
var zoomLevel = accuracyToZoomLevel[accuracy] || 1;
var lon = placemark.Point.coordinates[0];
var lat = placemark.Point.coordinates[1];
gmap.setCenter(new google.maps.LatLng(lat, lon), zoomLevel);
}
function geocode(location) {
geocoder.getLocations(location, geocodeComplete);
}
google.setOnLoadCallback(showMap);
</script>