//return array of 6

function getBounds(layer, type, hideabsolute)
{
	if(hideabsolute == undefined) hideabsolute = true;
	
	trace('layer.name : '+layer.name+', type : '+type);
	// trace('layer.typename : '+layer.typename);
	
	if(layer.typename == 'Document'){
		var w = layer.width;
		var h = layer.height;
		return [0, 0, w, h, w, h];
	}
	
	var lastActive = activeDocument.activeLayer;
	var mustMerge = (layer.typename == "LayerSet");
	
	var targetLayer = layer;
	if(mustMerge){
		var mfnewdLayer = layer.duplicate();
		targetLayer = mfnewdLayer.merge();
	}
	
	if(type == TYPE_GFX) rasterizeLayerStyle(targetLayer);
	var bounds = targetLayer.bounds;
	
	trace('bounds : '+bounds);
	
	if(mustMerge) targetLayer.remove();
	
	// activeDocument.activeLayer = lastActive;
    var length = bounds.length;
    var output = [];
    for(var i=0; i<length; i++){
        output[i] = getUnitValue(bounds[i]);
    }
    
	return output;

}

