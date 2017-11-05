function check_error_layername(name, parentItem)
{
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
	trace("props : "+props);
	
	for(var k in props){
		if(OPTIONS_RULES[k] == undefined) output.push(getErrorObject("Property '"+k+"' doesn't exist", getItemStructureStr(parentItem), name));
		else{
			var value = props[k];
			var rule = OPTIONS_RULES[k];
			
			var type = typeof rule;
			
			//regex
			if(type == "function"){
				
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

	if(has_option(name, OPT_BTNC)){
		if(parentItem == null || parentItem.type != TYPE_BTNC){
			output.push(getErrorObject("Property '"+OPT_BTNC+"' is only allowed for children of element of type '"+TYPE_BTNC+"'", getItemStructureStr(parentItem), name));
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
	tab.reverse();
	var str = tab.join(" / ");
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
