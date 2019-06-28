var MathService = {
	
  random : function(min, max, inc) {
		if(inc == undefined) inc = 1;
    var retour = this.floor(Math.random() * (max - min + inc) + min, inc);
    return retour;
  },

  floor : function(nb, inc) {
    var retour = Math.floor(nb / inc) * inc;
    return retour;
	},
	round : function(nb, inc)
	{
		if(inc == undefined) inc = 1;
		var retour = Math.round(nb/inc) * inc;
		return retour;
	},
	
	getProgressionValue : function(_input, _minsrc, _maxsrc, _mindst, _maxdst)
	{
		var _percentinput = (_input - _minsrc) / (_maxsrc - _minsrc);
		if (_percentinput < 0) _percentinput = 0;
		if (_percentinput > 1) _percentinput = 1;
		var _output = _mindst + (_maxdst - _mindst) * _percentinput;
		return _output;
	},
	
	
	getRandProbability : function(_frequency)
	{
		if (_frequency <= 0) return false;
		var _denom = this.round((1 / _frequency), 0.1);
		var _rand = this.random(0, _denom, 0.1);
		return (_rand < 1);
	},
	
	getHypotenuse : function(x1, y1, x2, y2)
	{
		var dx = x2-x1;
		var dy = y2-y1;
		return Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2));
	},
	
	
	
}