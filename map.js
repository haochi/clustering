function random_latlngs(n){
  var out = [];
  var r = Math.random;
  while(n-->0){
    out.push([random_sign()*r()*0.1+39.9, random_sign()*r()*0.1+-83]);
  }
  return out;
}

function random_sign(){
  return Math.random() > 0.5 ? 1 : -1;
}

function MarkerManager(map, latlngs, plot_centroid, plot_marker, num){
  var markers = [];

  function clearMarkers(){
    markers.forEach(function(marker){
      marker.setMap(null);
    });
    markers.length = 0;
  }

  function updateMarkers(){
    clearMarkers();

    var bounds = map.getBounds();
    var plottable_latlng = latlngs.filter(function(latlng){
      return bounds.contains(latlng);
    });

    if(plottable_latlng.length > num){
      var clusters = clustering(plottable_latlng, {
        calculate_position: k_means.calculate_position,
        calculate_distance: k_means.calculate_distance,
        converge_test: test.strict,
        max_iterations: Math.max(map.getZoom(), 20/Math.log(plottable_latlng.length)),
      });

      clusters.forEach(function(cluster){
        var marker = plot_centroid(cluster);
        markers.push(marker);
      });
    }else{
      plottable_latlng.forEach(function(latlng){
        var marker = plot_marker(latlng);
        markers.push(marker);
      });
    }
  }

  google.maps.event.addListener(map, 'idle', updateMarkers);
}

function initialize() {
  var mapOptions = {
    center: new google.maps.LatLng(39.9, -83),
    zoom: 10,
    minZoom: 5,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

  var latlngs = random_latlngs(1e4).map(function(latlng){
    return new google.maps.LatLng(latlng[0], latlng[1]);
  });
  MarkerManager(map, latlngs, function(centroid){
    var marker = new google.maps.Marker({
      position: centroid.position,
      title: ""+centroid.points.length,
      map: map,
    });
    google.maps.event.addListener(marker, 'click', function(){
      map.panTo(marker.getPosition());
      map.setZoom(map.getZoom() + 1);
    });
    return marker;
  }, function(latlng){
    var marker = new google.maps.Marker({
      position: latlng,
      map: map,
    });
    return marker;
  }, 10);
}

google.maps.event.addDomListener(window, 'load', initialize);

var k_means = {
  calculate_position: function(points){
    var bound = new google.maps.LatLngBounds();
    points.forEach(function(point){
      bound.extend(point);
    });
    return bound.getCenter();
  },
  calculate_distance: function(a, b){
    return haversine(a.lat(), a.lng(), b.lat(), b.lng());
  },
}

var test = {
  strict: function(centroids, old_groups, groups){
    return groups.every(function(group, i){
      return arrays_equal(group, old_groups[i]);  
    });
  },
  delta: function(centroids, old_groups, groups){
    var delta = 101;
    return centroids.every(function(c){
      var old_mean = c.prev_position
        , new_mean = c.position;  
      return old_mean &&
             Math.abs(old_mean[0] - new_mean[0]) < delta &&
             Math.abs(old_mean[1] - new_mean[1]) < delta;
    });
  }
}

function arrays_equal(a,b) {
  return !(a<b || b<a);
}

// https://gist.github.com/haochi/1145222
function haversine(){
  for(
    var m = Math // reassign Math & some of its functions
      , c = m.cos
      , s = m.sin
      , a = arguments
      , i=4; // The arguments variable is expected to have at least 4 variables.
             // I am going to use this to count down, so when it hits 0 the loop ends.
    i;
  )
    a[--i] *= m.PI/180; // converts to radian
  return m.acos( // the glorious haversine formula
    c(a[0])*
    c(a[2])*
    c(a[3]-a[1])+
    s(a[0])*
    s(a[2])
  );
}
