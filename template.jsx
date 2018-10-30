generate_template = function(items, tpl_id, config)
{
	trace("generate_template ("+tpl_id+")");
	
	var output = [];
	
	var listTextFormatID = new Array();
	var listTextFormat = new Array();
	
	var configMain = config.main;
	var configTextformat = config.textformat;
	var configLayout = config.layout;
	var configConfig = config.config;
	
	var baseIndent = configMain.base_indent;
	var path_tpl = "templates/"+tpl_id+"/";
	
	var textFormatFile= (configTextformat.file != undefined);
	var layoutFile= (configLayout.file != undefined);
	
	var bIndentation = configMain.indent;
	
	var closeTags = configMain.close_tags;
	var closeTagsConfig = configMain.close_tags_config;
	
	
	
	//MAIN
	
	tpl_reset();
	rec(items, null, 0, "main");
	
	var filename = configMain.filename;
	output.push({filename : filename,  content : get_tpl_content()});
	
	
	
	
	//TEXT FORMAT
	
	if(textFormatFile){
		
		tpl_reset();
		
		baseIndent = configTextformat.file.base_indent;
		
		var len = listTextFormat .length;
		for(var i = 0; i < len; i++){
				
			var textdata = listTextFormat[i];
			var data_str = TPL_FUNCTIONS[tpl_id].getTextFormatData(textdata, configConfig);
			
			var textformat_id = getTextFormatID(textdata, configConfig);
			var data = {"textformat_id" : textformat_id, "textformat_data" : data_str};
			var str = convertTemplate(path_tpl + "textformat/textformat.txt", data);
			
			tpl_add_block(str, baseIndent);
			
		}
		
		var filename = configTextformat.file.filename;
		output.push({filename : filename,  content : get_tpl_content()});
		
	}
	
	
	//LAYOUT
	
	if(layoutFile){
		
		tpl_reset();
		baseIndent = configLayout.file.base_indent;
		rec(items, null, 0, "layout");
		//todo : in rec function
		
		var filename = configLayout.file.filename;
		output.push({filename : filename,  content : get_tpl_content()});
	}
	
	
	return output;
	
	
	
	
	
	
	//___________________________________________________________________________________________
	
	
	function rec(items, parent, level, type)
	{
		var len = items.length;
		var linebreaks;
		var prevItem = null;
		
		if(type == "main"){
			linebreaks = configMain.linebreaks;
		}
		else if(type == "layout"){
			linebreaks = configLayout.file.linebreaks;
		}
		
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
					nbline = (level == 0) ? 5 : linebreaks.before;
					tpl_br(nbline, indent, 1.5);
				}
				
				tpl_add_block(str, indent);
				
				nbline = (level == 0) ? 3 : linebreaks.after;
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
				
				if(items.length > 1)
				
				var data_str = TPL_FUNCTIONS[tpl_id].getLayoutData(item, prevItem);
				
				/* 
				if(data_str == undefined){
					data_str = "{}";
				}
				 */
				if(data_str != undefined){
					var layout_id = getLayoutID(item);
					
					if(parent){
						var data = {"layout_id" : layout_id, "layout_data" : data_str};
						var str = convertTemplate(path_tpl + "layout/layout.txt", data);
						
						tpl_add_block(str, indent);
					}
				}
				
			}
			
			//line breaks
			tpl_br(linebreaks.std, indent, 2);
			
			
			
			if(type == "main" && textFormatFile && item.type == TYPE_TEXT){
				
				var textformat_id = getTextFormatID(item.textdata, configConfig);
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
					if(linebreaks.before_closetag > 0) tpl_br(linebreaks.before_closetag, indent, 4);
					tpl_add_line(str, indent);
				}
			}
			
			prevItem = item;
		}
		
	}
	
	
	
	


	
	function getItemCode(item, parent, _tffile, _layoutfile)
	{
		//instanciation + integration
		
		var varname = getVarname(item.name);
		var parent_varname = (parent != null) ? getVarname(parent.name) : "container";
		var layout_id = getLayoutID(item);
		if(!parent) layout_id = configConfig.classname_root || "root";
		
		var data = {
			"varname": varname,
			"parent_varname": parent_varname,
			"layout_id" : layout_id,
		};
		
		
		if(!_tffile && item.type == TYPE_TEXT){
			data["textformat_data"] = TPL_FUNCTIONS[tpl_id].getTextFormatData(item.textdata, configConfig);
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
			
			data["textformat_id"] = getTextFormatID(item.textdata, configConfig);
			
			data["text_color"] = getTextColorID(item.textdata, config.colors);
			
			data["text_align"] = "text_" + item.textdata.halign;
			
			//eventuellement une boucle sur textdata ici
			data["text"] = item.textdata.text;
			data["text_br"] = item.textdata.text.replace(/\\n/g, "<br />");
			
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




