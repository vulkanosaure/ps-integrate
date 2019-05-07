class MathService {

	constructor() { }
	
	
	
  random(min, max, inc = 1) {
    var retour = this.floor(Math.random() * (max - min + inc) + min, inc);
    return retour;
  }

  floor(nb, inc) {
    var retour = Math.floor(nb / inc) * inc;
    return retour;
	}
	round(nb, inc=1)
	{
		var retour = Math.round(nb/inc) * inc;
		return retour;
	}
	
	getProgressionValue(_input, _minsrc, _maxsrc, _mindst, _maxdst)
	{
		let _percentinput = (_input - _minsrc) / (_maxsrc - _minsrc);
		if (_percentinput < 0) _percentinput = 0;
		if (_percentinput > 1) _percentinput = 1;
		let _output = _mindst + (_maxdst - _mindst) * _percentinput;
		return _output;
	}
	
	
	getRandProbability(_frequency)
	{
		if (_frequency <= 0) return false;
		var _denom = this.round((1 / _frequency), 0.1);
		var _rand = this.random(0, _denom, 0.1);
		return (_rand < 1);
	}
	
	getHypotenuse(x1, y1, x2, y2)
	{
		var dx = x2-x1;
		var dy = y2-y1;
		return Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2));
	}
	
	
	
}





module.exports = {
	MathService:MathService,
}














/*


function getRandProbability($_frequency)
{
	if ($_frequency <= 0) return false;
	$_denom = round2((1 / $_frequency), 0.1);
	$_rand = random2(0, $_denom, 0.1);
	return ($_rand < 1);
}


function getAverage($_valueA, $_valueB, $_coeffA, $_coeffB) 
{
	$_total = $_valueA * $_coeffA + $_valueB * $_coeffB;
	$_divide = $_coeffA + $_coeffB;
	return $_total / $_divide;
}


package data.math
{
	import data.math.functions.LinearFunction;
	import flash.geom.Point;
	class Math2 {
		
		
		
		function Math2()
		{
			throw new Error("Class Math2 is static, it can't be instanciated");
		}
		
		
		//_____________________________________________________________________________
		//trigo
		
		static public function getTrigoCoord(_coord:String, angle, rayon, useDegre:Boolean=false)
		{
			if(_coord!="x" && _coord!="y") throw new Error("Math2.getTrigoCoord(), value must be 'x' or 'y' for arg 1");
			if(useDegre) angle = angle*Math.PI/180;
			var retour;
			if(_coord=="x") retour = Math.cos(angle)*rayon;
			else if(_coord=="y") retour = Math.sin(angle)*rayon;
			return retour;
		}
		
		
		//todo : a améliorer pour la gestion des exceptions
		static public function getAngle2pt(x_start, y_start, x_end, y_end, useDegre:Boolean=false)
		{
			var dx = x_end-x_start;
			var dy = y_end-y_start;
			var angle = Math.atan2(dy, dx);
			if(useDegre) angle = angle * 180/Math.PI;
			return angle;
		}
		
		
		
		//tothink
		//le sens est ici important, eventuellement, param qui se fiche du sens -> result %180
		static public function getAngle3pt(x1, y1, x2, y2, x3, y3, witch=0, useDegre:Boolean=false)
		{
			var ax, ay, bx, by, cx, cy;
			if(witch==0){
				ax = x1;
				ay = y1;
				bx = x2;
				by = y2;
				cx = x3;
				cy = y3;
			}
			else if(witch==1){
				ax = x2;
				ay = y2;
				bx = x1;
				by = y1;
				cx = x3;
				cy = y3;
			}
			else if(witch==2){
				ax = x3;
				ay = y3;
				bx = x1;
				by = y1;
				cx = x2;
				cy = y2;
			}
			
			var a1 = getAngle2pt(ax, ay, bx, by, useDegre);
			var a2 = getAngle2pt(ax, ay, cx, cy, useDegre);
			var result = (a1 - a2);
			while(result<0) result += (useDegre) ? 360 : Math.PI*2;
			return result;
		}
		
		
		
		static public function getHypotenuse(x1, y1, x2, y2)
		{
			var dx = x2-x1;
			var dy = y2-y1;
			return Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2));
		}
		
		
		
		
		//calcul la hauteur d'un triangle issu du point désigné par l'argument witch
		static public function getTriangleHeight(x1, y1, x2, y2, x3, y3, witch=0)
		{
			var ax, ay, bx, by, cx, cy;
			if(witch==0){
				ax = x1;
				ay = y1;
				bx = x2;
				by = y2;
				cx = x3;
				cy = y3;
			}
			else if(witch==1){
				ax = x2;
				ay = y2;
				bx = x3;
				by = y3;
				cx = x1;
				cy = y1;
			}
			else if(witch==2){
				ax = x3;
				ay = y3;
				bx = x2;
				by = y2;
				cx = x1;
				cy = y1;
			}
			
			var angle = Math2.getAngle3pt(ax, ay, bx, by, cx, cy, 1, false);
			var hypotenuse = Math2.getHypotenuse(ax, ay, bx, by);
			//sinus(anglB) = h / hypotenuse (SOH)
			var result = Math.sin(angle) * hypotenuse;
			return result;
		}
		
		
		
		
		
		
		
		
		
		
		
		//_____________________________________________________________________________
		//arrondis
		
		static public function floor(nb, inc)
		{
			if(!inc>0) throw new Error("Math2.floor(), inc must be > than 0");
			var retour = Math.floor(nb/inc) * inc;
			return retour;
		}
		
		static public function round(nb, inc)
		{
			if(!inc>0) throw new Error("Math2.floor(), inc must be > than 0");
			var retour = Math.round(nb/inc) * inc;
			return retour;
		}
		
		static public function ceil(nb, inc)
		{
			if(!inc>0) throw new Error("Math2.floor(), inc must be > than 0");
			var retour = Math.ceil(nb/inc) * inc;
			return retour;
		}
		
		
		
		
		
		//_____________________________________________________________________________
		//functions
		
		static public function getLinearFunction(_pt1:Point, _pt2:Point):LinearFunction
		{
			//security vertical
			if (_pt1.x == _pt2.x) {
				_pt1.x -= 0.01;
				_pt2.x += 0.01;
			}
			
			var _a = (_pt2.y - _pt1.y) / (_pt2.x - _pt1.x);
			var _b = _pt1.y - _pt1.x * _a;
			return new LinearFunction(_a, _b);
		}
		
		
		static public function isPointInSegRect(_pt:Point, _seg:Segment):Boolean
		{
			var _minx = (_seg.pt1.x > _seg.pt2.x) ? _seg.pt2.x : _seg.pt1.x;
			var _maxx = (_seg.pt1.x < _seg.pt2.x) ? _seg.pt2.x : _seg.pt1.x;
			var _miny = (_seg.pt1.y > _seg.pt2.y) ? _seg.pt2.y : _seg.pt1.y;
			var _maxy = (_seg.pt1.y < _seg.pt2.y) ? _seg.pt2.y : _seg.pt1.y;
			
			if (_pt.x >= _minx && _pt.x <= _maxx && _pt.y >= _miny && _maxy <= _maxy) return true;
			return false;
		}
		
		
		
		static public function getIntersectionPoint(_s1:Segment, _s2:Segment):Point
		{
			var _f1:LinearFunction = getLinearFunction(_s1.pt1, _s1.pt2);
			var _f2:LinearFunction = getLinearFunction(_s2.pt1, _s2.pt2);
			
			var _x = (_f2.b - _f1.b) / (_f1.a - _f2.a);
			var _y = _f1.a * _x + _f1.b;
			
			return new Point(_x, _y);
		}
		
		static public function segmentCross(_s1:Segment, _s2:Segment):Boolean
		{
			var _int:Point = getIntersectionPoint(_s1, _s2);
			if (isPointInSegRect(_int, _s1) && isPointInSegRect(_int, _s2)) return true;
			else return false;
		}
		
		
		
		
		//_____________________________________________________________________________
		//random
		
		static public function random(min, max, inc=1)
		{
			if(!inc>0) throw new Error("Math2.floor(), inc must be > than 0");
			var retour = Math2.floor(Math.random() * (max-min+inc) + min, inc);
			return retour;
		}
		
		
		static public function random2(min, max, inc, elmt, indproba)
		{
			if (elmt < min || elmt > max) throw new Error("elmt must be in interval [" + min + "," + max + "]");
			if (inc < 0) throw new Error("arg inc must be positive");
			
			var eventail:Array = new Array();
			elmt = Math2.round(elmt, inc);
			var nbelmt = (max - min) / inc + 1;
			//trace("nbelmt : " + nbelmt);
			
			var nbElementHigh:int = Math.round((nbelmt-1) * indproba) + 1;
			
			
			
			var nbelmt_left = (elmt - min) / inc;
			var nbelmt_right = (max - elmt) / inc;
			//trace("nbelmt_left : " + nbelmt_left + ", nbelmt_right : " + nbelmt_right);
			
			var decr_left = (nbelmt - 1) / nbelmt_left;
			var decr_right = (nbelmt - 1) / nbelmt_right;
			//trace("decr_left : " + decr_left + ", decr_right : " + decr_right);
			
			var decr = (decr_right < decr_left) ? decr_right : decr_left;
			
			
			var _item;
			var _nbRepet;
			var _len:int;
			var i;
			
			
			
			//left side
			_item = elmt;
			_nbRepet = nbElementHigh;
			
			while (_item >= min) {
				_len = Math.round(_nbRepet);
				for (i = 0; i < _len; i++) eventail.push(_item);
				
				_item -= inc;
				_nbRepet -= decr;
			}
			
			
			//right side
			_item = elmt;
			_nbRepet = nbElementHigh;
			
			
			while (_item <= max) {
				if (_item != elmt) {
					_len = Math.round(_nbRepet);
					for (i = 0; i < _len; i++) eventail.push(_item);
				}
				
				_item += inc;
				_nbRepet -= decr;
			}
			
			
			_len = eventail.length;
			var _ind:int = Math2.random(0, _len - 1, 1);
			
			return eventail[_ind];
		}
		
		
		
		static public function getRegression(list_pts:Array):LinearFunction
		{
			var sum_xy = 0;
			var sum_x2 = 0;
			var sum_x = 0;
			var sum_y = 0;
			var moy_x;
			var moy_y;
			
			var _n:int = list_pts.length;
			for (var i:int = 0; i < _n; i++) 
			{
				var _pt:Point = Point(list_pts[i]);
				sum_x += _pt.x;
				sum_y += _pt.y;
				sum_x2 += _pt.x * _pt.x;
				sum_xy += _pt.x * _pt.y;
			}
			
			var a = (_n * sum_xy - sum_x * sum_y) / (_n * sum_x2 - sum_x * sum_x);
			
			moy_x = sum_x / _n;
			moy_y = sum_y / _n;
			var b = moy_y - a * moy_x;
			
			return new LinearFunction(a, b);
		}
		
		
		
		
	}
}
*/