const file_debug = require('./debug.js');
var trace = file_debug.trace;

const file_constantes = require('./constantes.js');
var PREFIX = file_constantes.PREFIX;
var OPTIONS_RULES = file_constantes.OPTIONS_RULES;
var TYPE_GFX = file_constantes.TYPE_GFX;
var TYPE_TEXT = file_constantes.TYPE_TEXT;
var TYPE_BTN = file_constantes.TYPE_BTN;
var TYPE_BTNC = file_constantes.TYPE_BTNC;
var TYPE_CONTAINER = file_constantes.TYPE_CONTAINER;
var TYPE_DIV = file_constantes.TYPE_DIV;
var CONTAINERS_TYPE = file_constantes.CONTAINERS_TYPE;
var EXPORT_FOLDER = file_constantes.EXPORT_FOLDER;

var OPT_PATH = file_constantes.OPT_PATH;
var OPT_FILENAME = file_constantes.OPT_FILENAME;
var OPT_BGPARENT = file_constantes.OPT_BGPARENT;
var OPT_GFX_TYPE = file_constantes.OPT_GFX_TYPE;
var OPT_DIRECTION = file_constantes.OPT_DIRECTION;
var OPT_ALIGN_ITEMS = file_constantes.OPT_ALIGN_ITEMS;



function check_error_layername(name, parentItem)
{
	// trace('check_error_layername');
	var output = [];
	
	var len = PREFIX.length;
	var name2 = name.substr(len);
	
	var tab = name2.split("--");
	var props = {};
	len = tab.length;
	for(var i = 0; i<len; i++){
		var str = tab[i];
		if(str != PREFIX){
			var tab2 = str.split("=");
			props[tab2[0]] = tab2[1];
			
		}
	}
	
	//test, toremove
	props[OPT_PATH] = '';
	props[OPT_FILENAME] = '';
	props[OPT_BGPARENT] = '';
	props[OPT_GFX_TYPE] = '';
	// trace("props : "+props);
	
	
	for(var k in props){
		if(OPTIONS_RULES[k] == undefined) output.push(getErrorObject("Property '"+k+"' doesn't exist", getItemStructureStr(parentItem), name));
		else{
			var value = props[k];
			var rule = OPTIONS_RULES[k];
			
			var type = typeof rule;
			// trace('type : '+type+', rule : '+rule);
			
			//regex
			if(rule instanceof RegExp){
				
				var matches = rule.exec(value);
				//trace("matches:"+matches);
				if(false){
					output.push(getErrorObject("Wrong value for property '"+k+"' : '"+value+"'", getItemStructureStr(parentItem), name));
				}
			}
			//tab possible options
			else if(type == "object"){
				if(rule.indexOf(value) == -1){
					output.push(getErrorObject("Wrong value for property '"+k+"' : '"+value+"'", getItemStructureStr(parentItem), name));
				}
			}
			//string "*"
			else{
				//nothing to do
			}
		}
	}
	
	return output;
}





function check_error_item(name, item)
{
	var output = [];
	if(item.type != TYPE_GFX && item.type != TYPE_TEXT){
		if(item.parent != null && item.parent.type == TYPE_BTNC){
			output.push(getErrorObject("Only '"+TYPE_GFX+"' and '"+TYPE_TEXT+"' are allowed in '"+TYPE_BTNC+"'", getItemStructureStr(item), name));
		}
	}
	
	if(item[OPT_DIRECTION] && CONTAINERS_TYPE.indexOf(item.type) == -1){
		output.push(getErrorObject("Only containers can set options '"+OPT_DIRECTION+"'", getItemStructureStr(item), name));
	}
	if(item[OPT_ALIGN_ITEMS] && CONTAINERS_TYPE.indexOf(item.type) == -1){
		output.push(getErrorObject("Only containers can set options '"+OPT_ALIGN_ITEMS+"'", getItemStructureStr(item), name));
	}
	
	
	
	return output;
}




function getErrorObject(msg, path, name)
{
	if(path == "") path = "root";
	return {msg: msg, path: path, name: name};
}


function getItemStructureStr(item)
{
	var tab = [];
	var secu = 0;
	
	while(true){
		if(item == null) break;
		tab.push(item.name);
		trace("item.name : "+item.name+", parent : "+item.parent);
		secu++;
		item = item.parent;
		if(secu == 20) return;
	}
	// tab.reverse();
	// var str = tab.join(" / ");
	
	var str = '';
	var len = tab.length;
	for (var i = len - 1; i >= 0; i--) {
		var value = tab[i];
		str += value + ' / ';
	}
	
	return str;
}


function createErrorFile(listErrors)
{
	var path2 = EXPORT_FOLDER + "/";
	
	var content = "";
	
	var len = listErrors.length;
	for(var i = 0; i<len; i++){
		
		var obj = listErrors[i];
		var str = "";
		str += "Msg : "+obj.msg+"\n";
		str += "Path : "+obj.path+"\n";
		str += "Layer name : "+obj.name+"\n";
		content += str + "\n";
	}
	createFile(exportPath, path2 + "errors.log", content);
	
}


module.exports = {
	check_error_layername,
	check_error_item,
	getErrorObject,
	getItemStructureStr,
	createErrorFile,
};
