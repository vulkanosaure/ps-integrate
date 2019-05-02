const file_debug = require('./debug.js');
var trace = file_debug.trace;

const file_constantes = require('./constantes.js');
var TYPE_CONTAINER = file_constantes.TYPE_CONTAINER;
var TYPE_GFX = file_constantes.TYPE_GFX;
var TYPE_TEXT = file_constantes.TYPE_TEXT;


function get_natural_type(layer)
{
	trace('get_natural_type');
	if(layer.isContainer) return TYPE_CONTAINER;
	else{
		var kind = layer.constructor.name;
		//todo later
		trace('kind : '+kind);
		if(kind == '') return TYPE_GFX;
		else if(kind == 'Path') return TYPE_GFX;				//todo : vector
		else if(kind == '') return TYPE_TEXT;
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


function getLayersArray(container)
{
	let list = container.children;
	let output = [];
	list.forEach(item => output.push(item));
	return output;
}

function isLayerVisible(layer)
{
	return (layer.visible);
}

function isLayerContainer(layer)
{
	return (layer.isContainer);
}

function getLayerName(layer)
{
	return layer.name;
}


/*
output
	color (0x888888)
	font (number)
	size
	text
	letterspacing
	halign (left/center/right)
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



module.exports = {
	getTextData,
	getLayerName,
	getLayersArray,
	isLayerVisible,
	isLayerContainer,
	get_natural_type,
	getLayerId,
	
};
