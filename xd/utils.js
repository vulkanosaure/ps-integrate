var imp = {};

const file_constantes = require('./constantes.js');
var PREFIX_LENGTH = file_constantes.PREFIX_LENGTH;
var PREFIX = file_constantes.PREFIX;
var TYPE_CONTAINER = file_constantes.TYPE_CONTAINER;
var OPTIONS_SHORCUTS = file_constantes.OPTIONS_SHORCUTS;
var OPTIONS_SHORCUTS2 = file_constantes.OPTIONS_SHORCUTS2;
var OPTIONS_SHORCUTS3 = file_constantes.OPTIONS_SHORCUTS3;
var OPTIONS_SHORCUTS_PREFIX = file_constantes.OPTIONS_SHORCUTS_PREFIX;
imp = {...imp, ...file_constantes};

const file_debug = require('./debug.js');
var trace = file_debug.trace;
var tracerec = file_debug.tracerec;

const file_platform_layer_logic = require('./platform_layer_logic.js');
var get_natural_type = file_platform_layer_logic.get_natural_type;


function has_prefix(name)
{
	var isprefix = (name.substr(0, PREFIX_LENGTH) == PREFIX);
	return isprefix;
}

function has_option(name, idoption)
{
	var isprefix = (name.substr(0, PREFIX_LENGTH) == PREFIX);
	if(!isprefix) return false;
	trace(name+'.indexof('+ ("--" + idoption+"=") +')');
	var hasoption = (name.indexOf("--" + idoption+"=") != -1);
	return hasoption;
}


function get_value_option(name, idoption)
{
	//trace("get_value_option : "+name+", idoption : "+idoption);
	var regexp = new RegExp("--" + idoption + "=(([\\w%/!&]+(-(?!-))?)+)");
	var output = name.match(regexp);
	//trace("output : "+output);
	if(output == null) return "";
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

//maybe, normalize the type

function get_type(layer, name, isroot, level) {
	var forced_type = get_forced_type(name);
	// tracerec('forced_type : '+forced_type, level);
	if (forced_type != "") return forced_type;

	if (!isroot || has_prefix(name)) {
		var natural_type = get_natural_type(layer);
		// tracerec('natural_type : '+natural_type, level);
		if (natural_type != TYPE_CONTAINER || has_prefix(name)) return natural_type;
		else return "";
	}
	return "";
}


function removePathSlash(path)
{
	path = path.replace(/^\//, "");
	path = path.replace(/\/$/, "");
	return path;
}


function getPercentValue(value)
{
	return +value.substr(0, value.length-1);
}



function handleShorcuts(name)
{
	//for some specific registered case : if value only, convert into prop=value
	
	
	for(var k in OPTIONS_SHORCUTS){
		var tabprop = OPTIONS_SHORCUTS[k];
		var len = tabprop.length;
		for(var k2 = 0; k2 < len; k2++){
			var _prop = tabprop[k2];
			
			//case middle
			var regexp = new RegExp("--" + _prop + "--");
			var replace = "--" + k + "=" + _prop + "--";
			name = name.replace(regexp, replace);
			
			//case end
			var regexp = new RegExp("--" + _prop + "$");
			var replace = "--" + k + "=" + _prop + "";
			name = name.replace(regexp, replace);
			
		}
		
		
	}
	
	
	//specific keyboard with property association
	
	for(var k in OPTIONS_SHORCUTS2){
		var replace = OPTIONS_SHORCUTS2[k];
		var _prop = k;
		
		//case middle
		var regexp = new RegExp("--" + _prop + "--");
		name = name.replace(regexp, "--" + replace + "--");
		
		//case end
		var regexp = new RegExp("--" + _prop + "$");
		name = name.replace(regexp, "--" + replace + "");
		
	}
	
	//if only prop, add = 1
	var len = OPTIONS_SHORCUTS3.length;
	for(var i = 0; i<len; i++){
		var _prop = OPTIONS_SHORCUTS3[i];
		
		//case middle
		var regexp = new RegExp("--" + _prop + "--");
		var replace = "--" + _prop + "=1" + "--";
		name = name.replace(regexp, replace);
		
		//case end
		var regexp = new RegExp("--" + _prop + "$");
		var replace = "--" + _prop + "=1" + "";
		name = name.replace(regexp, replace);
		
	}
	
	
	for(var k in OPTIONS_SHORCUTS_PREFIX){
		
		var prefix = OPTIONS_SHORCUTS_PREFIX[k];
		var replace = "--" + k + "=";
		name = name.replace("--" + prefix, replace);
		
	}
	//fix
	name = name.replace("=*", "=");
	name = name.replace("=<", "=");
	
	
	return name;
	
}



function decodeNameParentRef(name, parentItem)
{
	if(name.charAt(0) == "&"){
		let parentName = '';
		if(parentItem) parentName = (parentItem[imp.OPT_TPLMODEL] || parentItem.name);
		name = parentName + name.substr(1);
	}
	return name;
}

function encodeNameParentRef(name, parentItem)
{
	if(!parentItem) return name;
	let parentName = (parentItem[imp.OPT_TPLMODEL] || parentItem.name);
	var lenParent = parentName.length;
	
	if(name.substr(0, lenParent) == parentName){
		name = "&" + name.substr(lenParent);
	}
	return name;
}


function isItemExport(item, type, templateMode)
{
	return (
		imp.EXPORTS_TYPE.indexOf(type) != -1 
		&& item[imp.OPT_IMGTYPE] != 'svg-inline'
		&& (templateMode != 'read' || item[imp.OPT_PLACEHOLDER])
	);
}



function getParentsProperty(item, prop)
{
	let count = 0;
	while(item.parent){
		if(item.parent[prop]) return item.parent[prop];
		count++;
		item = item.parent;
		if(count > 99) break;
	}
	return null;
}



/*
typeName = name / filename
*/

function generateItemName(parentItem, type, index, typeName)
{
	let output = '';
	if(parentItem){
		let parentName;
		if(typeName == 'name') parentName = (parentItem[imp.OPT_TPLMODEL] || parentItem.name);
		else if(typeName == 'filename') parentName = parentItem.name;
		else throw new Error('wrong type for typeName');
		
		output += parentName;
		trace('parent tplmodel : '+parentItem[imp.OPT_TPLMODEL]+', parentName : '+parentItem.name);
	}
	else output += type;
	output += '-' + index;
	return output;
}



let templateItems = {};
function saveTemplateItem(tplname, ph, item)
{
	trace('saveTemplateItem '+tplname+', '+ph);
	if(!templateItems[tplname]) templateItems[tplname] = {};
	templateItems[tplname][ph] = item;
}

function getTemplateItem(tplname, ph)
{
	trace('getTemplateItem '+tplname+', '+ph);
	if(!templateItems[tplname]) return null;
	return templateItems[tplname][ph];
}






module.exports = {
	has_prefix,
	has_option,
	get_value_option,
	get_value_option_safe,
	get_forced_type,
	get_type,
	removePathSlash,
	getPercentValue,
	handleShorcuts,
	decodeNameParentRef,
	encodeNameParentRef,
	isItemExport,
	getParentsProperty,
	generateItemName,
	saveTemplateItem,
	getTemplateItem,
};
