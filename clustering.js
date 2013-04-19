(function(){
  function clustering(points, opts){
    var max_num = Number.MAX_VALUE;
    // opts
    var cluster_size = opts.cluster_size || Math.round(Math.sqrt(points.length/2));
    var max_iterations = opts.max_iterations || max_num;
    var calc_dist = opts.calculate_distance;
    var converge_test = opts.converge_test;
    Centroid.prototype.calculate_position = function(){
      this.position = opts.calculate_position(this.points);
      return this.position;
    }

    // setup
    var points_per_cluster = Math.floor(points.length / cluster_size);
    var groups = [];
    var old_groups = [];
    var centroids = [];
    var converged = false;
    var iterations = 0;

    for(var i=0; i<cluster_size; i++){
      var index = i * points_per_cluster;
      var centroid = new Centroid();
      centroid.push(points[index]);
      centroid.calculate_position();
      centroids.push(centroid);
      groups.push([]);
      old_groups.push([]);
    }

    // make it converge
    while(!converged && iterations < max_iterations){
      points.forEach(function(point, i){
        var min_j = 0;
        var dist = max_num;
        centroids.forEach(function(centroid, j){
          var c_dist = calc_dist(point, centroid.position);
          if(c_dist < dist){
            dist = c_dist;
            min_j = j;
          }
        });
        centroids[min_j].push(point);
        groups[min_j].push(i);
      });

      // check for convergence
      converged = converge_test(centroids, old_groups, groups);

      // cleanup for this iteration
      iterations++;
      old_groups = groups;
      groups = groups.map(function(group, i){
        centroids[i].calculate_position();
        centroids[i].clear();
        return [];
      });
    }

    return old_groups;
  }

  function Centroid(){
    this.points = [];
  }
  Centroid.prototype.push = function(point){
    this.points.push(point);
  }
  Centroid.prototype.clear = function(){
    this.points.length = 0;
  }

  // export
  if(typeof exports === 'undefined'){
    this.clustering = clustering;
  }else{
    exports.clustering = clustering;
  }
})(this);
