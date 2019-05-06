var imp = {};

const file_debug = require('./debug.js');
var trace = file_debug.trace;

const file_constantes = require('./constantes.js');
var TYPE_CONTAINER = file_constantes.TYPE_CONTAINER;
var TYPE_GFX = file_constantes.TYPE_GFX;
var TYPE_TEXT = file_constantes.TYPE_TEXT;
imp = {...imp, ...file_constantes};


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
	trace('kind : '+kind+', fillkind : '+fillkind);
	
	// trace('get_natural_type');
	if(layer.isContainer) return TYPE_CONTAINER;
	else{
		
		//todo later
		if(kind == '') return TYPE_GFX;
		else if(kind == 'Rectangle' && fillkind == 'ImageFill') return TYPE_GFX;
		else if(['Rectangle', 'Ellipse', 'Line'].indexOf(kind) > -1) return imp.TYPE_SHAPE;
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
	
	NEW
	styleRanges	//
	fontStyle
	underline
*/
function getTextData(layer)
{
	var ti = layer;
	var textdata = {};
	textdata.color = getColorData(ti.fill);
	textdata.font = ti.fontFamily;
	textdata.size = ti.fontSize;
	textdata.text = ti.text;
	
	//remove linebreak before and after
	textdata.text = textdata.text.replace(/\r/g, "\\n");
	textdata.text = textdata.text.replace(/^\\n/g, "");
	textdata.text = textdata.text.replace(/(\\n)+$/g, "");

	//textdata.uppercase = (ti.capitalization == "TextCase.ALLCAPS");
	
	textdata.leading = ti.lineSpacing;
	textdata.letterspacing = ti.charSpacing;
	//new xd
	textdata.bold = isTextBold(ti.fontStyle);
	textdata.italic = isTextItalic(ti.fontStyle);
	textdata.underline = ti.underline;
	
	
	if(ti.textAlign == 'ALIGN_LEFT') textdata.halign = 'left';
	else if(ti.textAlign == 'ALIGN_CENTER') textdata.halign = 'center';
	else if(ti.textAlign == 'ALIGN_RIGHT') textdata.halign = 'right';
	else textdata.halign = 'left';
	
	var ranges = ti.styleRanges;
	textdata.styleRanges = [];
	for(var i in ranges){
		let range = ranges[i];
		let obj = {};
		obj.length = range.length;
		obj.font = range.fontFamily;
		obj.bold = isTextBold(range.fontStyle);
		obj.italic = isTextItalic(range.fontStyle);
		obj.color = range.fill.toHex();
		obj.letterspacing = range.charSpacing;
		obj.underline = range.underline;
		textdata.styleRanges.push(obj);
	}
	
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


function isLayerShape(layer)
{
	let layerkind = layer.constructor.name;
	if(['Rectangle', 'Ellipse', 'Line'].indexOf(layerkind) > -1) return true;
	else return false;
}

function isBorderRadiusEqual(r)
{
	return (r.topLeft==r.bottomLeft && r.bottomLeft==r.bottomRight && r.bottomRight==r.topRight && r.topRight==r.topLeft);
}



function getShadowData(layer)
{
	let output;
	if(layer.shadow && layer.shadow.visible){
		let s = layer.shadow;
		return {
			x: layer.shadow.x,
			y: layer.shadow.y,
			blur: layer.shadow.blur,
			colorHex: layer.shadow.color.toHex(),
			color: getColorData(s.color),
		};
	}
	
	return output;
}



function getColorData(colorObj)
{
	let c = colorObj;
	return {
		r: c.r,
		g: c.g,
		b: c.b,
		a: c.a,
		rgba: "rgba(" + c.r + "," + c.g + "," + c.b + "," + c.a / 255 + ")",
		hex: c.toHex(),
	}
}

function getGradientColorData(colorObj)
{
	let c = colorObj;
	
	let dir;
	let deltaX = c.endX - c.startX;
	let deltaY = c.endY - c.startY;
	let absDeltaX = Math.abs(deltaX);
	let absDeltaY = Math.abs(deltaY);
	
	if(deltaX > 0.5 && absDeltaY < 0.5) dir = 'right';
	else if(deltaX < 0.5 && absDeltaY < 0.5) dir = 'right';
	
	if(deltaY > 0.5 && absDeltaX < 0.5) dir = 'bottom';
	else if(deltaY < 0.5 && absDeltaX < 0.5) dir = 'top';
	
	//todo : 4 diagonales
	
	if(!dir){
		trace('c : '+c.endX+', '+c.startX+', '+c.endY+', '+c.startY);
		throw new Error('dir undefined');
	}
	
	return {
		colorStops: c.colorStops.map(item => {
			return {
				stop: item.stop, 
				color: getColorData(item.color),
			}
		}),
		dir: dir,
	};
}




function getShapeData(layer, width, height)
{
	let layerkind = layer.constructor.name;
	trace('getShapeData '+width+', '+height+', layerkind : '+layerkind);
	
	//recursive fix, if shape nested
	if(!isLayerShape(layer)){
		for(var i=0; i<5; i++){
			if(layer.children && layer.children.length > 0){
				layer = layer.children.at(0);
				if(isLayerShape(layer)) break;
			}
			else break;
		}
	}
	
	
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
		let fillkind = layer.fill ? layer.fill.constructor.name : '';
		if(fillkind == 'Color') output.bgColor = getColorData(layer.fill);
		if(fillkind == 'LinearGradientFill') output.bgGradient = getGradientColorData(layer.fill);
	}
	
	
	else output.bgColor = '';
	if(layer.strokeEnabled){
		output.borderWidth = layer.strokeWidth;
		output.borderColor = getColorData(layer.stroke);
	}
	else{
		output.borderWidth = null;
		output.borderColor = null;
	}
	
	if(layerkind == 'Rectangle'){
		let radius = layer.cornerRadii;
		if(isBorderRadiusEqual(radius)){
			trace('radius equal');
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


function getArtboardByLayer(layer)
{
	let count = 0;
	while(true){
		if(!layer) break;
		// trace('layer : '+layer);
		// trace('layer.constructor.name : '+layer.constructor.name);
		if(layer.constructor.name == 'Artboard') break;
		layer = layer.parent;
		count++;
		if(count > 999) return;
	}
	return layer;
}



module.exports = {
	getTextData,
	getShadowData,
	getShapeData,
	getLayerName,
	getLayersArray,
	isLayerVisible,
	isLayerContainer,
	get_natural_type,
	get_natural_imgtype,
	getLayerId,
	getArtboardByLayer,
};
