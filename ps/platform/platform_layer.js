function get_natural_imgtype(layer)
{
	var kind = layer.constructor.name;
	if(kind == 'Path') return 'svg';
	else return 'png';
}



function get_natural_type(layer)
{
	var kind = layer.constructor.name;
	var fillkind = layer.fill ? layer.fill.constructor.name : '';
	// trace('kind : '+kind+', fillkind : '+fillkind);
	
	// trace('get_natural_type');
	if(layer.isContainer) return TYPE_CONTAINER;
	else{
		
		//todo later
		if(kind == '') return TYPE_GFX;
		else if(kind == 'Rectangle' && fillkind == 'ImageFill') return TYPE_GFX;
		else if(['Rectangle', 'Ellipse', 'Line'].indexOf(kind) > -1) return TYPE_SHAPE;
		else if(kind == 'Path') return TYPE_GFX;
		else if(kind == 'Text') return TYPE_TEXT;
		else return TYPE_CONTAINER;
		
		//else throw new Error("whats that "+kind+", name : "+layer.name);
	}
}


function getLayerId(doc, layer) { 
	
	doc.activeLayer = layer;
	
    var ref = new ActionReference();   
    ref.putProperty( charIDToTypeID("Prpr") , charIDToTypeID( "LyrI" ));   
    ref.putEnumerated( charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") );  
    return executeActionGet(ref).getInteger( stringIDToTypeID( "layerID" ) );  
}  

function getUnitValue(unitvalue)
{
	return unitvalue.value;
}

function getLayerParent(item)
{
	return item.parent;
}


function getLayersArray(container)
{
	return container.layers;
}




function setSelectedLayer(selection, layer)
{
	selection.items = layer;
}

function addLayerToSelection(selection, layer)
{
	var tab = selection.items;
	
	var index = tab.indexOf(layer);
	if(index > -1) tab.pop();
	else tab.push(layer);
	selection.items = tab;
}

function isLayerVisible(layer)
{
	return (layer.visible);
}

function isLayerContainer(layer)
{
	return (layer.typename == "LayerSet");
}

function getLayerName(layer)
{
	return layer.name;
}

function setLayerName(layer, name)
{
	layer.name = name;
}

function hasMask(layer)
{
	return (layer.mask);	
}


/*
output
	color (0x888888)
	font (number)
	size
	text
	letterspacing
	halign (left/center/right)
	
	NEW
	styleRanges	//
	fontStyle
	underline
*/

function getTextData(layer)
{
	var ti = layer.textItem;
	var textdata = {};
	trace("name : " + name + ", kind : " + layer.kind);
	try {
		textdata.color = ti.color.rgb.hexValue;
	}
	catch (e) {
		textdata.color = 0x888888;
	}

	textdata.font = ti.font;
	// textdata.size = Math.round(ti.size.value);
	textdata.size = Math.round(getFontSize(layer));
	textdata.text = ti.contents;

	//remove linebreak before and after
	textdata.text = textdata.text.replace(/\r/g, "\\n");
	textdata.text = textdata.text.replace(/^\\n/g, "");
	textdata.text = textdata.text.replace(/(\\n)+$/g, "");

	//textdata.uppercase = (ti.capitalization == "TextCase.ALLCAPS");



	tracerec("textItem : " + layer.textItem + ", " + textdata.text, level);
	trace("textdata.size : " + textdata.size);

	try { textdata.leading = Math.round(getUnitValue(ti.leading)); } catch (e) { };

	try { textdata.letterspacing = ti.tracking; } catch (e) { textdata.letterspacing = 0; };

	try {
		var justification = ti.justification;
		if (justification == "Justification.CENTER") textdata.halign = "center";
		else if (justification == "Justification.CENTERJUSTIFIED") textdata.halign = "center";
		else if (justification == "Justification.LEFT") textdata.halign = "left";
		else if (justification == "Justification.LEFTJUSTIFIED") textdata.halign = "left";
		else if (justification == "Justification.RIGHT") textdata.halign = "right";
		else if (justification == "Justification.RIGHTJUSTIFIED") textdata.halign = "right";
		else textdata.halign = "left";
	}
	catch (e) { textdata.halign = "left"; };

	trace("textdata.halign : " + textdata.halign);
	return textdata;
}





//Regular
//Bold
//Bold Italic
//Italic

function isTextItalic(fontStyle)
{
	fontStyle = fontStyle.toLowerCase();
	return (fontStyle.indexOf('italic') > -1);
}
function isTextBold(fontStyle)
{
	fontStyle = fontStyle.toLowerCase();
	return (fontStyle.indexOf('bold') > -1);
}


function isLayerOfType(layer, types)
{
	throw new Error('todo');
}

function isBorderRadiusEqual(r)
{
	throw new Error('todo');
}



function getShadowData(layer)
{
	//https://stackoverflow.com/questions/13301279/getting-text-layer-shadow-parameters-extendscript-cs5-photoshop-scripting
	//must check layerFXVisible
	
	//use scriptingListener to find out the fx names
	//and the props names
	
	let output;
	var idfx = [
		'dropShadow',
	];
	
	var fx;
	var ind = 0;
	while(fx == null){
		fx = getLayerFx(layer, idfx[ind]);
		ind++;
	}
	
	if(fx){
		trace('fx ok');
		var distance = getFxAttribute(fx, 'distance');
		trace('distance : '+distance);
	}
	
	throw new Error('todo');
	
	return output;
}


function getLayerFx(layer, type)
{
	var res = false;
	var ref = new ActionReference();
	ref.putEnumerated( charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") ); 
	var hasFX =  executeActionGet(ref).hasKey(stringIDToTypeID('layerEffects'));
	if ( hasFX ){
		var ref = new ActionReference();
		ref.putEnumerated( charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") ); 
		res = executeActionGet(ref).getObjectValue(stringIDToTypeID('layerEffects')).getObjectValue(stringIDToTypeID(type));
	}
	return res;
}
function getFxAttribute(fx, attribute)
{
	return fx.getUnitDoubleValue(stringIDToTypeID(attribute));
}




function getColorData(colorObj, globalAlpha)
{
	throw new Error('todo');
}

function getGradientColorData(colorObj, globalAlpha)
{
	throw new Error('todo');
}


function retrieveNestedType(layer, types)
{
	if(!isLayerOfType(layer, types)){
		for(var i=0; i<5; i++){
			var children = getLayersArray(layer);
			if(children && children.length > 0){
				layer = children[0];
				if(isLayerOfType(layer, types)) break;
			}
			else break;
		}
	}
	return layer;
}


/*
{
	data
	bgColor
}
*/

function getPathData(layer)
{
	throw new Error('todo');
	
	//recursive fix, if shape nested
	layer = retrieveNestedType(layer, ['Path']);
	
	var output = {};
	
	output.data = layer.pathData;
	output.bgColor = getColorData(layer.fill, layer.opacity);
	return output;
}




function getShapeData(layer, width, height)
{
	throw new Error('todo');
	
	var layerkind = layer.constructor.name;
	// trace('getShapeData '+width+', '+height+', layerkind : '+layerkind);
	
	//recursive fix, if shape nested
	layer = retrieveNestedType(layer, ['Rectangle', 'Ellipse', 'Line']);
	
	
	/*
	borderWidth
	borderColor
	radius
	radius_topLeft, ...
	bgColor
	bgGradient
	
	//todo line, (only consider non diagonal, shape sinon)
	
	//todo shadow (not here, global)
	//todo ellipse (only consider circle, sinon shape)
	//todo bgGradient
	*/
	var output = {};
	
	layerkind = layer.constructor.name;
	if(layer.fillEnabled){
		var fillkind = layer.fill ? layer.fill.constructor.name : '';
		if(fillkind == 'Color') output.bgColor = getColorData(layer.fill, layer.opacity);
		if(fillkind == 'LinearGradientFill') output.bgGradient = getGradientColorData(layer.fill, layer.opacity);
	}
	
	
	else output.bgColor = '';
	if(layer.strokeEnabled){
		output.borderWidth = layer.strokeWidth;
		output.borderColor = getColorData(layer.stroke, layer.opacity);
	}
	else{
		output.borderWidth = null;
		output.borderColor = null;
	}
	
	if(layerkind == 'Rectangle'){
		var radius = layer.cornerRadii;
		if(isBorderRadiusEqual(radius)){
			// trace('radius equal');
			output.radius = radius.topLeft;
		}
		else{
			output.radius_topLeft = radius.topLeft;
			output.radius_topRight = radius.topRight;
			output.radius_bottomRight = radius.bottomRight;
			output.radius_bottomLeft = radius.bottomLeft;
		}
	}
	else if(layerkind == 'Ellipse' && layer.isCircle){
		output.radius = Math.ceil(width / 2);
	}
	else if(layerkind == 'Line'){
		//Line: .start : !Point .end : !Point
		if(output.borderWidth) output.borderWidth *= 0.5;
	}
	
	
	
	return output;
}





function groupLayers(layers, sel)
{
	throw new Error('todo');
	//return new layer
	return sel.items[0];
}
function ungroupLayers(layer, sel)
{
	throw new Error('todo');
	
	//return some layer (useless probably)
	return sel.items[0];
}


//position = 'back', 'front', or index
function setLayerOrder(layer, position, sel)
{
	throw new Error('todo');
	
}

function removeLayer(layer)
{
	throw new Error('todo');
	// layer.removeFromParent();
}



