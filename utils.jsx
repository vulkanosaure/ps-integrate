function has_prefix(name)
{
	var isprefix = (name.substr(0, PREFIX_LENGTH) == PREFIX);
	return isprefix;
}

function has_option(name, idoption)
{
	var isprefix = (name.substr(0, PREFIX_LENGTH) == PREFIX);
	if(!isprefix) return false;
	var hasoption = (name.indexOf(idoption) != -1);
	return hasoption;
}

function get_value_option(name, idoption)
{
	//trace("get_value_option : "+name+", idoption : "+idoption);
	var regexp = new RegExp(idoption+"=(\\w+)");
	output = name.match(regexp);
	//trace("output : "+output);
	return output[1];
}

function get_value_option_safe(name, idoption)
{
	if(!has_option(name, idoption)) return "";
	return get_value_option(name, idoption);
}

function get_forced_type(name)
{
	if(!has_prefix(name)) return "";
	if(!has_option(name, "type")) return "";
	return get_value_option(name, "type");
}

function get_natural_type(layer)
{
	if(layer.typename == "LayerSet") return TYPE_GFX;
	else{
		if(layer.kind == LayerKind.NORMAL) return TYPE_GFX;
		else if(layer.kind == LayerKind.TEXT) return TYPE_TEXT;
		else throw new Error("whats that "+layer.kind);
	}
}


function removePathSlash(path)
{
	path = path.replace(/^\//, "");
	path = path.replace(/\/$/, "");
	return path;
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


