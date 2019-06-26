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
		value = props[OPT_NAME];
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
	
	// trace('TYPE_SHAPE : '+TYPE_SHAPE);
	// trace('CONTAINERS_TYPE : '+CONTAINERS_TYPE);
	
	if(item[OPT_DIRECTION] && CONTAINERS_TYPE.indexOf(item.type) == -1){
		output.push(getErrorObject("Only containers can set option '"+OPT_DIRECTION+"'", getItemStructureStr(item), name));
	}
	if(item[OPT_BGPARENT] && [TYPE_GFX, TYPE_SHAPE].indexOf(item.type) == -1){
		output.push(getErrorObject("Only img and shape can set option '"+OPT_BGPARENT+"'", getItemStructureStr(item), name+', type : '+item.type));
	}
	
	if(item.name.charAt(0) == '$'){
		output.push(getErrorObject("Name property can't start with a $", getItemStructureStr(item), name));
	}
	
	if(item[OPT_TPLMODEL]){
		var tplmodel = item[OPT_TPLMODEL];
		if(list_tplmodel.indexOf(tplmodel) > -1){
			output.push(getErrorObject("tplmodel '"+tplmodel+"' has already been defined", getItemStructureStr(item), name));
		}
		list_tplmodel.push(tplmodel);
	}
	
	if(item[OPT_PLACEHOLDER] && item['templateMode'] == ''){
		output.push(getErrorObject("Only tpl or tplmodel can set option '"+OPT_PLACEHOLDER+"'", getItemStructureStr(item), name));
	}
	
	
	//define w or h for natural img
	if(item['templateMode'] != 'read'){
		if(item[OPT_TAG] == 'img' && !item[OPT_WIDTH] && !item[OPT_HEIGHT]){
			output.push(getErrorObject("You must define width or height option for 'img' tag", getItemStructureStr(item), name));
		}
	}
	
	
	//ph 'img...' in tpl file : must set type or imgtype
	
	if(item[OPT_PLACEHOLDER]){
		var ph = item[OPT_PLACEHOLDER];
		if(ph.substr(0, 3) == 'img'){
			if(item['templateMode'] == 'read'){
				var idtpl = item['tplparent'];
				if(tplmodels.indexOf(idtpl) == -1){
					if(!has_option(name, OPT_TYPE) && !item[OPT_IMGTYPE]){
						output.push(getErrorObject("You must define option '"+OPT_TYPE+"' or '"+OPT_IMGTYPE+"' for a placeholder named 'img...' in a file tpl", getItemStructureStr(item), name));
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
		
		var dir = parent["dir"];
		// trace('dir : '+dir);
		var prop = dir == 'row' ? 'x' : 'y';
		var index_pos = dir == 'row' ? 0 : 1;
		
		// trace('dir : '+dir);
		// trace('cur_pos : '+cur_pos);
		
		var len = parent.childrens.length;
		var prev_pos;
		
		//wrapping
		if(parent[OPT_DIRECTION] == 'row' && parent[OPT_WIDTH]){
			return output;
		}
		if(parent[OPT_NAME] == 'bloc-quiz-answers'){
			
			trace(parent[OPT_DIRECTION]);
			trace(parent[OPT_WIDTH]);
			throw new Error('name');
		}
		
		for(var i=0; i<len; i++){
			// var _i = len - 1 - i;
			var _i = i;
			var _item = parent.childrens[_i];
			var pos = _item.position[index_pos];
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


function createErrorFile(listErrors)
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
	createFile('export', path2, "errors.log", content);
	
}

