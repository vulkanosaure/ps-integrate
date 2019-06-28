// Array.map polyfill
if (Array.prototype.map === undefined) {
  Array.prototype.map = function(fn) {
    var rv = [];
    
    for(var i=0, l=this.length; i<l; i++)
      rv.push(fn(this[i]));

    return rv;
  };
}


if (!Array.prototype.forEach) {
	Array.prototype.forEach = function (fn) {
		var len = this.length;
		for(var i=0; i<len; i++) fn(this[i], i);
	};
}