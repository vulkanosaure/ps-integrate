var imp = {};

const file_debug = require('./debug.js');
var trace = file_debug.trace;
imp = {...imp, ...require('../utils.js')};
imp = {...imp, ...require('./platform_layer.js')};

//___________________________________________________________________



//return array of 4
function getBounds(layer, type, hideabsolute)
{
		if(hideabsolute == undefined) hideabsolute = true;
	
    //hide abs item for bounds
		
		if(hideabsolute){
			var tohide = [];
			var layers = imp.getLayersArray(layer);
			var len = layers.length;
			for (var i = 0; i < len; i++) {
					var l = layers[i];
					var name = imp.getLayerName(l);
					
					if (imp.has_prefix(name)) {
							name = imp.handleShorcuts(name);
							var position = imp.get_value_option(name, imp.OPT_POSITION);
							if(position == 'absolute') tohide.push(l);
					}
			}
			
			tohide.forEach(function(l){ l.visible = false; });
		}
    
    
    let b = layer.globalBounds;
    
    if(hideabsolute){
			tohide.forEach(function(l){ l.visible = true; });
		}
    
		return [b.x, b.y, b.x + b.width, b.y + b.height, b.width, b.height];
}



//___________________________________________________________________

module.exports = {
	getBounds,
};