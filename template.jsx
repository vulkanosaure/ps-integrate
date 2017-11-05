generate_template = function(items, tpl_id)
{
	trace("generate_template ("+tpl_id+")");
	
	var output = [];
	
	var listTextFormatID = new Array();
	var listTextFormat = new Array();
	
	var baseIndent = 2;
	var path_tpl = "templates/"+tpl_id+"/";
	
	var textFormatFile= true;
	var layoutFile= true;
	
	var bIndentation = true;
	
	var config_layout = {
		br_std : 1,
		br_before_separator : 1,
		br_after_separator : 1,
	};
	var config_main = {
		br_std : 0,
		br_before_separator : 1,
		br_after_separator : 0,
		br_before_closingtag : 1,
	};
	
	//haxe: 2, 1, 2
	
	var closeTags = true;
	var closeTagsConfig = {
		start:"<",
		end:">",
		close:"/",
	};
	
	
	
	
	//MAIN
	
	tpl_reset();
	rec(items, null, 0, "main");
	
	output.push({filename : "main.hx",  content : get_tpl_content()});
	
	
	
	
	//TEXT FORMAT
	
	if(textFormatFile){
		
		tpl_reset();
		baseIndent = 1;
		
		var len = listTextFormat .length;
		for(var i = 0; i < len; i++){
				
			var textdata = listTextFormat[i];
			var data_str = TPL_FUNCTIONS[tpl_id].getTextFormatData(textdata);
			
			var textformat_id = getTextFormatID(textdata);
			var data = {"textformat_id" : textformat_id, "data" : data_str};
			var str = convertTemplate(path_tpl + "textformat/textformat.txt", data);
			
			tpl_add_block(str, baseIndent);
			
		}
		output.push({filename : "textformat.hx",  content : get_tpl_content()});
		
	}
	
	
	//LAYOUT
	
	if(layoutFile){
		
		tpl_reset();
		baseIndent = 1;
		rec(items, null, 0, "layout");
		//todo : in rec function
		
		output.push({filename : "layout.hx",  content : get_tpl_content()});
	}
	
	
	return output;
	
	
	
	
	
	
	//___________________________________________________________________________________________
	
	
	function rec(items, parent, level, type)
	{
		var len = items.length;
		var config;
		if(type == "main") config = config_main;
		else if(type == "layout") config = config_layout;
		
		//for(var i=0; i<len; i++){
		for(var i=len - 1; i>=0; i--){
			
			var item = items[i];
			
			var parentname = (parent != null) ? parent.name : "";
			tracerec("item : "+item.name+", parentname : "+parentname, level);
			
			var iscontainer = CONTAINERS_TYPE.indexOf(item.type) != -1;
			
			var indent = baseIndent;
			if(type == "main" && bIndentation){
				indent += level;
			}
			
			//separator
			
			if(CONTAINERS_TYPE.indexOf(item.type) != -1  || level == 0){
				
				var tplname = level == 0 ? item.name.toUpperCase() : item.name;
				var templateprefix = (level == 0) ? "-big" : "-small";
				var str = convertTemplate(path_tpl + type + "/separator"+templateprefix+".txt", {name: tplname});
				
				var nbline;
				
				if(get_tpl_content() != ""){
					nbline = (level == 0) ? 5 : config.br_before_separator;
					tpl_br(nbline, indent, 1.5);
				}
				
				tpl_add_block(str, indent);
				
				nbline = (level == 0) ? 4 : config.br_after_separator;
				tpl_br(nbline, indent, 1);
			}
			
			var itemCode;
			
			if(type == "main"){
				//instanciation / integration code
				itemCode = getItemCode(item, parent, textFormatFile, layoutFile);
				
				var linebreak = (!closeTags || iscontainer);
				tpl_add_block(itemCode, indent, linebreak);
				
				if(closeTags && !iscontainer){
					var str = getCloseTag(closeTagsConfig, itemCode);
					if(str != "") tpl_add_line(str, 0);
				}
				
			}
			else if(type == "layout"){
				
				var data_str = TPL_FUNCTIONS[tpl_id].getLayoutData(item);
				
				var layout_id = getLayoutID(item);
				var data = {"layout_id" : layout_id, "data" : data_str};
				var str = convertTemplate(path_tpl + "layout/layout.txt", data);
				
				tpl_add_block(str, indent);
				
			}
			
			//line breaks
			tpl_br(config.br_std, indent, 2);
			
			
			
			if(type == "main" && textFormatFile && item.type == TYPE_TEXT){
				
				var textformat_id = getTextFormatID(item.textdata);
				//trace("listTextFormatID : "+typeof listTextFormatID);
				
				if(listTextFormatID.indexOf(textformat_id) == -1){
					listTextFormatID.push(textformat_id);
					listTextFormat.push(item.textdata);
				}
			}
			
			if(iscontainer){

				rec(item.childrens, item, level + 1, type);
			}
			
			
			//close tags
			
			if(type == "main" && closeTags && iscontainer){
				
				var str = getCloseTag(closeTagsConfig, itemCode);
				if(str != ""){
					if(config.br_before_closingtag > 0) tpl_br(config.br_before_closingtag, indent, 4);
					tpl_add_line(str, indent);
				}
			}
			
			
		}
		
	}
	
	
	
	


	
	function getItemCode(item, parent, _tffile, _layoutfile)
	{
		//instanciation + integration
		
		var varname = getVarname(item.name);
		var parent_varname = (parent != null) ? getVarname(parent.name) : "container";
		var layout_id = getLayoutID(item);
		
		var data = {
			"varname": varname,
			"parent_varname": parent_varname,
			"layout_id" : layout_id,
		};
		
		
		if(!_tffile && item.type == TYPE_TEXT){
			data["textformat_data"] = TPL_FUNCTIONS[tpl_id].getTextFormatData(item.textdata);
		}
		
		if(!_layoutfile){
			data["layout_data"] = TPL_FUNCTIONS[tpl_id].getLayoutData(item);
		}
		
		var ignore = ["childrens", "layoutx", "layouty", "parent", "position", "position_abs"];
		data["x"] = item.position[0];
		data["y"] = item.position[1];
		
		for(var k in item){
			if(ignore.indexOf(k) == -1){
				//trace("- add property : "+k);
				data[k] = item[k];
			}
		}
		
		
		
		var str = "";
		
		if(item.type == TYPE_CONTAINER){
			
			var str2 = convertTemplate(path_tpl + "main/"+item.type+".txt", data);
			str += str2;
		}
		else if(item.type == TYPE_GFX){
			
			var str2 = convertTemplate(path_tpl + "main/"+item.type+".txt", data);
			str += str2;
		}
		else if(item.type == TYPE_TEXT){
			
			data["textformat_id"] = getTextFormatID(item.textdata);
			
			//eventuellement une boucle sur textdata ici
			data["text"] = item.textdata.text;
			
			var str2 = convertTemplate(path_tpl + "main/"+item.type+".txt", data);
			str += str2;
		}
		
		else if(BTNS_TYPE.indexOf(item.type) != -1){
			
			var str3 = convertTemplate(path_tpl + "main/"+TYPE_BTN+".txt", data);
			str += str3;
		}
		
		
		var common_post_str = convertTemplate(path_tpl + "main/common-post.txt", data);
		if(common_post_str != ""){
			str += "\n" + common_post_str;
		}
		
			
		return str;
	}

}




