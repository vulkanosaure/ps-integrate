//todo : reformat into actionmanager.js


//return array of 6

function getBounds(layer, type, hideabsolute)
{
	if(hideabsolute == undefined) hideabsolute = true;
	
	trace('layer.name : '+layer.name+', type : '+type);
	// trace('layer.typename : '+layer.typename);
	
	if(layer.typename == 'Document'){
		var w = getUnitValue(layer.width);
		var h = getUnitValue(layer.height);
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
	
	// trace('bounds : '+bounds);
	
	if(mustMerge) targetLayer.remove();
	
	// activeDocument.activeLayer = lastActive;
    var length = bounds.length;
    var output = [];
    for(var i=0; i<length; i++){
        output[i] = getUnitValue(bounds[i]);
	}
	output[4] = output[2] - output[0];
	output[5] = output[3] - output[1];
  
	return output;

}





function rasterizeLayerStyle(layer)
{
	activeDocument.activeLayer = layer;
	var idrasterizeLayer = stringIDToTypeID( "rasterizeLayer" );
    var desc5 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref4 = new ActionReference();
        var idLyr = charIDToTypeID( "Lyr " );
        var idOrdn = charIDToTypeID( "Ordn" );
        var idTrgt = charIDToTypeID( "Trgt" );
        ref4.putEnumerated( idLyr, idOrdn, idTrgt );
    desc5.putReference( idnull, ref4 );
    var idWhat = charIDToTypeID( "What" );
    var idrasterizeItem = stringIDToTypeID( "rasterizeItem" );
    var idlayerStyle = stringIDToTypeID( "layerStyle" );
    desc5.putEnumerated( idWhat, idrasterizeItem, idlayerStyle );
	executeAction( idrasterizeLayer, desc5, DialogModes.NO );
}



function getFontSize(layer)
{
	activeDocument.activeLayer = layer;  
	var size = layer.textItem.size;    
			
	var r = new ActionReference();      
	r.putProperty(stringIDToTypeID("property"), stringIDToTypeID("textKey"));          
	r.putEnumerated(stringIDToTypeID("layer"), stringIDToTypeID("ordinal"), stringIDToTypeID("targetEnum"));      
	
	var yy = 1;  
	var yx = 0;  
		
	try {  
			var transform = executeActionGet(r).getObjectValue(stringIDToTypeID("textKey")).getObjectValue(stringIDToTypeID("transform"));  
			yy = transform.getDouble(stringIDToTypeID("yy"));      
			yx = transform.getDouble(stringIDToTypeID("yx"));      
	}
	catch(e) { }   
	
	var coeff = Math.sqrt(yy*yy + yx*yx);  
	
	var output = size *coeff;
	return output;
}


function dupLayers(layer) {
	var desc143 = new ActionDescriptor();
	var ref73 = new ActionReference();
	ref73.putClass(charIDToTypeID('Dcmn'));
	desc143.putReference(charIDToTypeID('null'), ref73);
	desc143.putString(charIDToTypeID('Nm  '), layer.name);
	var ref74 = new ActionReference();
	ref74.putEnumerated(charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
	desc143.putReference(charIDToTypeID('Usng'), ref74);
	executeAction(charIDToTypeID('Mk  '), desc143, DialogModes.NO);
};

