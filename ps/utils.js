function has_prefix(name)
{
	var isprefix = (name.substr(0, PREFIX_LENGTH) == PREFIX);
	return isprefix;
}

function has_option(name, idoption)
{
	var isprefix = (name.substr(0, PREFIX_LENGTH) == PREFIX);
	if(!isprefix) return false;
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
	if (forced_type != "") return forced_type;

	if (!isroot || has_prefix(name)) {
		var natural_type = get_natural_type(layer);
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
		var parentName = '';
		if(parentItem) parentName = (parentItem[OPT_TPLMODEL] || parentItem.name);
		name = parentName + name.substr(1);
	}
	return name;
}

function encodeNameParentRef(name, parentItem)
{
	if(!parentItem) return name;
	var parentName = (parentItem[OPT_TPLMODEL] || parentItem.name);
	var lenParent = parentName.length;
	
	if(name.substr(0, lenParent) == parentName){
		name = "&" + name.substr(lenParent);
	}
	return name;
}


function isItemExport(item, type, templateMode)
{
	return (
		EXPORTS_TYPE.indexOf(type) != -1 
		&& item[OPT_IMGTYPE] != 'svg-inline'
		&& (templateMode != 'read' || item[OPT_PLACEHOLDER])
	);
}



function getParentsProperty(item, prop)
{
	var count = 0;
	while(item && item.parent){
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
	var output = '';
	if(parentItem){
		var parentName;
		if(typeName == 'name') parentName = (parentItem[OPT_TPLMODEL] || parentItem.name);
		else if(typeName == 'filename') parentName = parentItem.name;
		else throw new Error('wrong type for typeName');
		
		output += parentName;
	}
	else output += type;
	output += '-' + index;
	return output;
}



var templateItems = {};
function saveTemplateItem(tplname, ph, item)
{
	if(!templateItems[tplname]) templateItems[tplname] = {};
	templateItems[tplname][ph] = item;
}

function getTemplateItem(tplname, ph)
{
	if(!templateItems[tplname]) return null;
	return templateItems[tplname][ph];
}


function setItemPath(item)
{
	var path = item.path;
	if(path != "") path += "/";
	path += item.filename;
	item.fullpath_noext = path;
	path += "." + item[OPT_IMGTYPE];
	item.fullpath = path;
}

