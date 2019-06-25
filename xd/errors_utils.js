var imp = {};

const file_debug = require('./debug.js');
var trace = file_debug.trace;

const file_constantes = require('./constantes.js');
var PREFIX = file_constantes.PREFIX;
var OPTIONS_RULES = file_constantes.OPTIONS_RULES;
var TYPE_GFX = file_constantes.TYPE_GFX;
var TYPE_TEXT = file_constantes.TYPE_TEXT;
var TYPE_CONTAINER = file_constantes.TYPE_CONTAINER;
var CONTAINERS_TYPE = file_constantes.CONTAINERS_TYPE;
var EXPORT_FOLDER = file_constantes.EXPORT_FOLDER;

var OPT_PATH = file_constantes.OPT_PATH;
var OPT_FILENAME = file_constantes.OPT_FILENAME;
var OPT_BGPARENT = file_constantes.OPT_BGPARENT;
var OPT_GFX_TYPE = file_constantes.OPT_GFX_TYPE;
var OPT_DIRECTION = file_constantes.OPT_DIRECTION;

imp = {...imp, ...require('./platform_export.js')};
imp = {...imp, ...require('./utils.js')};
imp = {...imp, ...file_constantes};

var list_tplmodel = [];



function check_error_layername(name, parentItem)
{
	// trace('check_error_layername('+name+')');
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
	
	if(name.indexOf('name=$') > -1){
		value = props[imp.OPT_NAME];
		output.push(getErrorObject("Wrong value for property '"+'name'+"' : '"+value+"'", getItemStructureStr(parentItem), name));
	}
	
	
	for(var k in props){
		if(OPTIONS_RULES[k] == undefined) output.push(getErrorObject("Property '"+k+"' doesn't exist", getItemStructureStr(parentItem), name));
		else{
			var value = props[k];
			var rule = OPTIONS_RULES[k];
			
			var type = typeof rule;
			// trace('type : '+type+', rule : '+rule+', value : '+value);
			
			//regex
			if(rule instanceof RegExp){
				
				var matches = rule.exec(value);
				//trace("matches:"+matches);
				if(false){
					output.push(getErrorObject("Wrong value for property '"+k+"' : '"+value+"'", getItemStructureStr(parentItem), name));
				}
			}
			else if(rule == "*"){
				//nothing to do
			}
			//tab possible options
			else if(type == "object"){
				if(rule.indexOf(value) == -1){
					output.push(getErrorObject("Wrong value for property '"+k+"' : '"+value+"'", getItemStructureStr(parentItem), name));
				}
			}
		}
	}
	
	return output;
}





function check_error_item(name, item, tplmodels)
{
	var output = [];
	
	// trace('imp.TYPE_SHAPE : '+imp.TYPE_SHAPE);
	// trace('CONTAINERS_TYPE : '+CONTAINERS_TYPE);
	
	if(item[OPT_DIRECTION] && CONTAINERS_TYPE.indexOf(item.type) == -1){
		output.push(getErrorObject("Only containers can set option '"+OPT_DIRECTION+"'", getItemStructureStr(item), name));
	}
	if(item[OPT_BGPARENT] && [TYPE_GFX, imp.TYPE_SHAPE].indexOf(item.type) == -1){
		output.push(getErrorObject("Only img and shape can set option '"+OPT_BGPARENT+"'", getItemStructureStr(item), name+', type : '+item.type));
	}
	
	if(item.name.charAt(0) == '$'){
		output.push(getErrorObject("Name property can't start with a $", getItemStructureStr(item), name));
	}
	
	if(item[imp.OPT_TPLMODEL]){
		var tplmodel = item[imp.OPT_TPLMODEL];
		if(list_tplmodel.indexOf(tplmodel) > -1){
			output.push(getErrorObject("tplmodel '"+tplmodel+"' has already been defined", getItemStructureStr(item), name));
		}
		list_tplmodel.push(tplmodel);
	}
	
	if(item[imp.OPT_PLACEHOLDER] && item['templateMode'] == ''){
		output.push(getErrorObject("Only tpl or tplmodel can set option '"+imp.OPT_PLACEHOLDER+"'", getItemStructureStr(item), name));
	}
	
	
	//define w or h for natural img
	if(item['templateMode'] != 'read'){
		if(item[imp.OPT_TAG] == 'img' && !item[imp.OPT_WIDTH] && !item[imp.OPT_HEIGHT]){
			output.push(getErrorObject("You must define width or height option for 'img' tag", getItemStructureStr(item), name));
		}
	}
	
	
	//ph 'img...' in tpl file : must set type or imgtype
	
	if(item[imp.OPT_PLACEHOLDER]){
		var ph = item[imp.OPT_PLACEHOLDER];
		if(ph.substr(0, 3) == 'img'){
			if(item['templateMode'] == 'read'){
				var idtpl = item['tplparent'];
				if(tplmodels.indexOf(idtpl) == -1){
					if(!imp.has_option(name, imp.OPT_TYPE) && !item[imp.OPT_IMGTYPE]){
						output.push(getErrorObject("You must define option '"+imp.OPT_TYPE+"' or '"+imp.OPT_IMGTYPE+"' for a placeholder named 'img...' in a file tpl", getItemStructureStr(item), name));
					}	
				}
			}
		}
	}
	
	
	
	return output;
}




function check_error_item2(parent)
{
	var output = [];
	
	if(parent && parent["pos"] == 'static'){
		
		// trace('parent name : '+parent.name);
		
		let dir = parent["dir"];
		// trace('dir : '+dir);
		let prop = dir == 'row' ? 'x' : 'y';
		let index_pos = dir == 'row' ? 0 : 1;
		
		// trace('dir : '+dir);
		// trace('cur_pos : '+cur_pos);
		
		var len = parent.childrens.length;
		let prev_pos;
		
		//wrapping
		if(parent[imp.OPT_DIRECTION] == 'row' && parent[imp.OPT_WIDTH]){
			return output;
		}
		if(parent[imp.OPT_NAME] == 'bloc-quiz-answers'){
			
			trace(parent[imp.OPT_DIRECTION]);
			trace(parent[imp.OPT_WIDTH]);
			throw new Error('name');
		}
		
		for(let i=0; i<len; i++){
			// var _i = len - 1 - i;
			var _i = i;
			let _item = parent.childrens[_i];
			let pos = _item.position[index_pos];
			// trace('-- '+_item.name+', pos : '+pos+', bgparnet : '+_item["bgparent"]);
			
			if(i > 0 && _item["pos"] == "static" && !_item["bgparent"]){
				if(pos < prev_pos){
					output.push(getErrorObject("The order of the layer seems incorrect : "+prev_pos+" / "+pos, getItemStructureStr(_item), ''));
					
					break;
				}
			}
			prev_pos = pos;
		}
	}
	/* 
	if(item.name == 'page-step-content-block-mclass-title'){
		trace('output: '+output);
		trace('parent pos: '+parent["pos"]);
		throw new Error('check_error_item2');
	}
	 */
	
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
		// trace("item.name : "+item.name+", parent : "+item.parent);
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


async function createErrorFile(listErrors)
{
	var path2 = EXPORT_FOLDER + "/";
	
	var content = "";
	
	var len = listErrors.length;
	for(var i = 0; i<len; i++){
		
		//linebreak don't work
		var obj = listErrors[i];
		var str = "";	
		str += "Msg : "+obj.msg+"\n";
		str += "Layer name : "+obj.name+"\n";
		str += "Path : "+obj.path+"\n";
		content += str + "\n";
	}
	await imp.createFile('export', path2, "errors.log", content);
	
}


module.exports = {
	check_error_layername,
	check_error_item,
	check_error_item2,
	getErrorObject,
	getItemStructureStr,
	createErrorFile,
};
