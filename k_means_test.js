var clustering = require('./clustering').clustering;

var k_means = {
  calculate_position: function(points){
    var x = 0
      , y = 0
      , n = points.length

    points.forEach(function(point){
      x += point[0];
      y += point[1];
    });
    return [x/n, y/n];
  },
  calculate_distance: function(a, b){
    var total = a.reduce(function(sum, current, i){
      return sum + Math.pow(current - b[i], 2);
    }, 0);
    return Math.sqrt(total);
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

var clusters = clustering([
  [1.0,	1.0],
  [1.5,	2.0],
  [3.0,	4.0],
  [5.0,	7.0],
  [3.5,	5.0],
  [4.5,	5.0],
  [3.5,	4.5],
], {
  //cluster_size: 1,
  calculate_position: k_means.calculate_position,
  calculate_distance: k_means.calculate_distance,
  converge_test: test.delta,
});

console.log(clusters);
