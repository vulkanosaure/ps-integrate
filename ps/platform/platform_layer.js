function get_natural_imgtype(layer)
{
	//svg / png in XD
	return null;
}



function get_natural_type(layer)
{
	if(layer.typename == "LayerSet") return TYPE_CONTAINER;
	else{
		var kind = layer.kind;
		if(kind == LayerKind.NORMAL) return TYPE_GFX;
		else if(kind == LayerKind.TEXT) return TYPE_TEXT;
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
	var output = container.layers;
	output = array_reverse(output);
	return output;
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
	
	var tabcolor;
	try {
		var rgb = ti.color.rgb;
		tabcolor = [rgb.red, rgb.green, rgb.blue];
	}
	catch (e) {
		tabcolor = [0, 0, 0];
	}
	textdata.color = getColorData(tabcolor, 1.0);

	textdata.font = ti.font;
	// textdata.size = Math.round(ti.size.value);
	textdata.size = Math.round(getFontSize(layer));
	textdata.text = ti.contents;
	
	//remove linebreak before and after
	textdata.text = textdata.text.replace(/\r/g, "\\n");
	textdata.text = textdata.text.replace(/^\\n/g, "");
	textdata.text = textdata.text.replace(/(\\n)+$/g, "");

	//textdata.uppercase = (ti.capitalization == "TextCase.ALLCAPS");



	tracerec("textItem : " + layer.textItem + ", " + textdata.text, 0);
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


function isFxVisible()
{
	var ref = new ActionReference();  
	ref.putEnumerated( charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") );   
	var fxVisible = executeActionGet(ref).getBoolean(stringIDToTypeID('layerFXVisible')); 
	return fxVisible;
}



function getShadowData(layer, retina)
{
	trace('getShadowData '+retina);
	
	
	activeDocument.activeLayer = layer;
	var output;
	
	if(isFxVisible()){
	
		var listidfx = ['dropShadow', 'outerGlow'];
		
		var properties = [
			['Opct', 'opacity', 'unitdouble'],				//71	//OK
			['Clr' , 'color', 'color'],
			// ['RGBC' , 'RGBColor', 'color'],
			['Nose', 'noise', 'unitdouble'],					//OK
			['blur', 'blur', 'double'],								//blur = size (in ps)
			// ['Sz'  , 'size', 'integer'],
			['Dstn', 'distance', 'unitdouble'],				//OK
			['#Ang', 'angleUnit', 'string'],					//undefined
			['lagl', 'localLightingAngle', 'double'],	//OK
			['uglg', 'useGlobalAngle', 'boolean'],		//undefined
		];
		
		/* 
		var listdebug = [];
		for(var i in listdebug){
			var charID = listdebug[i];
			trace(charID+' : '+charIDtoStringID(charID));
		}
		*/
		
		//use the first fx it finds, with dropShadow as a priority
		
		var len = listidfx.length;
		for(var i=0;i<len;i++){
			var idfx = listidfx[i];
			trace('getLayerFx : '+idfx+' / '+i);
			var fx = getLayerFx(layer, idfx);
			
			if(fx){
				trace('______________________fx : '+idfx);
				
				var obj = {};
				
				// ['enab', 'enabled', 'boolean'],						//OK
				var enabled = getFxAttribute(fx, 'enabled', 'boolean');
				if(enabled){
					
					var len2 = properties.length;
					for(var j=0;j<len2;j++){
						var tab = properties[j];
						var stringID = tab[1];
						var type = tab[2];
						var value;
						try{ value = getFxAttribute(fx, stringID, type) }
						catch(e){}
						
						if(value != undefined){
							obj[stringID] = value;
						}
					}
					
					// for(var k in obj) trace('-- '+k+' : '+obj[k]);
					
					var x, y;
					
					if(obj['localLightingAngle'] != undefined){
						var angle = obj['localLightingAngle'] || 0;
						var anglerad = angle * Math.PI / 180;
						// trace('anglerad : '+anglerad);
						var dist = obj['distance'];
						x = Math.round(Math.cos(anglerad) * dist);
						y = Math.round(Math.sin(anglerad) * dist);
					}
					else{
						x = 0;
						y = 0;
					}
					
					var opacity = obj['opacity'] / 100;
					
					//opacity is too weak in css
					if(idfx == 'outerGlow') opacity *= 2.0;
					
					if(opacity > 1) opacity = 1;
					
					var tabcolor = obj['color'];
					var objcolor = getColorData(tabcolor, opacity);
					
					var blur = obj['blur'];
					
					if(retina){
						x = Math.round(x * 0.5);
						y = Math.round(y * 0.5);
						blur = Math.round(blur * 0.6);
					}
					
					output = {
						x: x, y: y,
						blur: blur,
						color: objcolor,
						colorHex: objcolor.hex,
					};
					break;
				}
			}
		}
	}
	/* 
	trace('output : ');
	if(output){
		for(var k in output){
			trace('- '+k+' : '+output[k]);
			if(k == 'color'){
				trace('--- r : '+output[k].r);
				trace('--- g : '+output[k].g);
				trace('--- b : '+output[k].b);
				trace('--- a : '+output[k].a);
				trace('--- hex : '+output[k].hex);
			}
		}
	}
	 */
	// throw new Error('yo');
	return output;
}




function hasShadowFx(layer)
{
	var output = false;
	var listidfx = ['dropShadow', 'outerGlow'];
	var len = listidfx.length;
	for(var i=0;i<len;i++){
		var idfx = listidfx[i];
		var fx = getLayerFx(layer, idfx);
		trace('get '+idfx+' : '+fx);
		if(fx){
			output = true;
			break;
		}
	}
	return output;
}




function charIDtoStringID(charID)
{
	// trace('charIDtoStringID : '+charID);
	return app.typeIDToStringID(app.charIDToTypeID(charID));  
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
		try{
			res = executeActionGet(ref).getObjectValue(stringIDToTypeID('layerEffects')).getObjectValue(stringIDToTypeID(type));
		}
		catch(e){};
	}
	return res;
}
function getFxAttribute(fx, attribute, type)
{
	// trace('getAttr : '+attribute+', type : '+type);
	var typeid = stringIDToTypeID(attribute);
	
	var output;
	if(type == 'unitdouble') output = fx.getUnitDoubleValue(typeid);
	else if(type == 'double') output = fx.getDouble(typeid);
	else if(type == 'integer') output = fx.getInteger(typeid);
	else if(type == 'boolean') output = fx.getBoolean(typeid);
	else if(type == 'color'){
		var obj = fx.getObjectValue(typeid);
		var r = obj.getDouble(stringIDToTypeID('red'));
		var g = obj.getDouble(stringIDToTypeID('grain'));
		var b = obj.getDouble(stringIDToTypeID('blue'));
		output = [Math.round(r), Math.round(g), Math.round(b)];
	}
	
	return output;
}

function getBackgroundColor()
{
	var ref = new ActionReference();  
	ref.putEnumerated( charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") );   
	var layerDesc = executeActionGet(ref);  
	var adjList = layerDesc.getList(stringIDToTypeID('adjustment'));  
	var theColors = adjList.getObjectValue(0).getObjectValue(stringIDToTypeID('color'));  
	var tab = [];
	for(var i=0;i<theColors.count;i++){ //enumerate descriptor's keys  
		var val = Math.round(theColors.getUnitDoubleValue(theColors.getKey(i)));
		tab.push(val);
	}
	return tab;
}

function hasBgColor(layer)
{
	activeDocument.activeLayer = layer;
	var ref = new ActionReference();  
	ref.putEnumerated( charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") );   
	var layerDesc = executeActionGet(ref);  
	var adjList;
	try{
		adjList = layerDesc.getList(stringIDToTypeID('adjustment'));
	}
	catch(e){}
	return (adjList);
}


function getFillOpacity()
{
	var ref = new ActionReference();  
	ref.putEnumerated( charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") );   
	var layerDesc = executeActionGet(ref);  
	var output = layerDesc.getUnitDoubleValue(stringIDToTypeID('fillOpacity'));  
	return output;
}

 
function getColorData(colorTab, globalAlpha)
{
	var colorObj = {
		r: colorTab[0],
		g: colorTab[1],
		b: colorTab[2],
		a: 255,
	};
	var c = colorObj;
	var alpha = c.a * globalAlpha;
	var alpha1 = alpha / 255;
	
	if(alpha1 < 1){
		alpha1 = MathService.round(alpha1, 0.01);
	}
	
	return {
		r: c.r,
		g: c.g,
		b: c.b,
		a: alpha,
		rgba: "rgba(" + c.r + ", " + c.g + ", " + c.b + ", " + alpha1 + ")",
		hex: '#' + rgbToHex(c.r, c.g, c.b),
	}
}



function rgbToHex2(rgb) { 
  var hex = Number(rgb).toString(16);
  if (hex.length < 2) hex = "0" + hex;
  return hex;
}
function rgbToHex(r, g, b) {   
  var red = rgbToHex2(r);
  var green = rgbToHex2(g);
  var blue = rgbToHex2(b);
  return red+green+blue;
};



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





function getShapeData(layer, width, height, filter)
{
	trace('getShapeData '+layer.name);
	/*
	borderWidth
	borderColor
	radius
	radius_topLeft, ...
	bgColor
	bgGradient
	*/
	
	//dans la version XD :
	//je cherche parmis les enfants le premier child de type :
	//rectangle, ellipse, line
	
	/*
	idée : 
	- les property que je cherche peuvent etre sur des sub children
	indépendemment pour chacune
	
	fonction recursive get
		je transmet une fonction test
		avec un arg
		
	
	*/
	
	var output = {};
	
	//border
	
	var l = retriveLayerWithFX(layer, hasFX, 'frameFX');
	// trace('l retrieved : '+(l && l.name));
	
	if(l){
		
		activeDocument.activeLayer = l;
		var fx = getLayerFx(l, 'frameFX');
		if(fx){
			trace('fx');
			var enabled = getFxAttribute(fx, 'enabled', 'boolean');
			if(enabled){
				trace('enabled');
				var borderWidth = getFxAttribute(fx, 'size', 'unitdouble');
				var tabcolor = getFxAttribute(fx, 'color', 'color');
				var opacity = getFxAttribute(fx, 'opacity', 'unitdouble');
				
				opacity = opacity / 255;
				output['borderColor'] = getColorData(tabcolor, opacity);
				output['borderWidth'] = borderWidth;
				
			}
		}
	}
	
	
	//bgColor
	
	if(!filter || filter.indexOf('bgColor') == -1){
		
		var l = retriveLayerWithFX(layer, hasBgColor, null);
		if(l){
			activeDocument.activeLayer = l;
			
			var tabcolor = getBackgroundColor();
			// trace('tabcolor : '+tabcolor);
			var fillOpacity = getFillOpacity() / 255;
			// trace('fillOpacity : '+fillOpacity);
			var opacity = l.opacity / 255;
			output['bgColor'] = getColorData(tabcolor, opacity * fillOpacity);
			
		}
	}
	
	
	// if(layer.name == 'ps--shape--bgparent--*bgbtn') throw new Error('yo');
	
	return output;
}



var layer_with_fx;

function retriveLayerWithFX(baselayer, fn, arg)
{
	retriveLayerWithFX_rec(baselayer, 0, fn, arg);
	return layer_with_fx;
}
function retriveLayerWithFX_rec(container, level, fn, arg)
{
	var layers = getLayersArray(container);
	var len = layers ? layers.length : 0;
	for (var i = 0; i < len; i++) {
		
		var layer = layers[i];
		tracerec(i+' :: '+layer.name);
		
		var success = fn(layer, arg);
		if(success){
			layer_with_fx = layer;
			break;
		}
		else{
			var isContainer = isLayerContainer(layer);
			if(isContainer){
				retriveLayerWithFX_rec(layer, level + 1, fn, arg);
			}
		}
	}
}

function hasFX(layer, type)
{
	activeDocument.activeLayer = layer;
	if(isFxVisible()){
		var fx = getLayerFx(layer, type);
		if(fx){
			var enabled = getFxAttribute(fx, 'enabled', 'boolean');
			if(enabled) return true;
		}
	}
	return false;
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



