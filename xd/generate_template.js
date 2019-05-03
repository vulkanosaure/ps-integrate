var imp = {};

const file_debug = require('./debug.js');
var trace = file_debug.trace;
var tracerec = file_debug.tracerec;

imp = {...imp, ...require('./template_utils.js')};
imp = {...imp, ...require('./template_functions.js')};
imp = {...imp, ...require('./constantes.js')};


// var generate_template = function(items, tpl_id, config)
async function generate_template(items, tpl_id, config)
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
	
	imp.tpl_reset();
	await rec(items, null, 0, "main");
	
	var filename = configMain.filename;
	output.push({filename : filename,  content : imp.get_tpl_content()});
	
	
	
	//TEXT FORMAT
	
	if(textFormatFile){
		
		imp.tpl_reset();
		
		baseIndent = configTextformat.file.base_indent;
		
		var len = listTextFormat .length;
		for(var i = 0; i < len; i++){
				
			var textdata = listTextFormat[i];
			var data_str = imp.TPL_FUNCTIONS[tpl_id].getTextFormatData(textdata, configConfig);
			
			var textformat_id = imp.getTextFormatID(textdata, configConfig);
			var data = {"textformat_id" : textformat_id, "textformat_data" : data_str};
			var str = await imp.convertTemplate(path_tpl + "textformat/textformat.txt", data);
			
			imp.tpl_add_block(str, baseIndent);
			
		}
		
		var filename = configTextformat.file.filename;
		output.push({filename : filename,  content : imp.get_tpl_content()});
		
	}
	
	
	
	
	//LAYOUT
	
	if(layoutFile){
		
		imp.tpl_reset();
		baseIndent = configLayout.file.base_indent;
		await rec(items, null, 0, "layout");
		//todo : in rec function
		
		var filename = configLayout.file.filename;
		output.push({filename : filename,  content : imp.get_tpl_content()});
	}
	
	
	return output;
	
	
	
	
	
	
	//___________________________________________________________________________________________
	
	
	async function rec(items, parent, level, type)
	{
		var len = items.length;
		var linebreaks;
		var prevItem = null;
		var prevStaticItem = null;
		
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
			
			var iscontainer = imp.CONTAINERS_TYPE.indexOf(item.type) != -1;
			
			var indent = baseIndent;
			if(type == "main" && bIndentation){
				indent += level;
			}
			
			
			//separator
			
			if(imp.CONTAINERS_TYPE.indexOf(item.type) != -1  || level == 0){
				
				var tplname = level == 0 ? item.name.toUpperCase() : item.name;
				var templateprefix = (level == 0) ? "-big" : "-small";
				var str = await imp.convertTemplate(path_tpl + type + "/separator"+templateprefix+".txt", {name: tplname});
				
				var nbline;
				
				if(imp.get_tpl_content() != ""){
					nbline = (level == 0) ? 5 : linebreaks.before;
					imp.tpl_br(nbline, indent, 1.5);
				}
				
				
				//allow separator for
				if(type=='main' && level <= 0) imp.tpl_add_block(str, indent);
				else if(type=='layout' && level <= 1) imp.tpl_add_block(str, indent);
				
				nbline = (level == 0) ? 3 : linebreaks.after;
				imp.tpl_br(nbline, indent, 1);
			}
			
			
			var itemCode;
			
			if(type == "main"){
				
				//instanciation / integration code
				itemCode = await getItemCode(item, parent, textFormatFile, layoutFile);
				
				var linebreak = (!closeTags || iscontainer);
				imp.tpl_add_block(itemCode, indent, linebreak);
				
				if(closeTags && !iscontainer){
					var str = imp.getCloseTag(closeTagsConfig, itemCode);
					if(str != "") imp.tpl_add_line(str, 0);
				}
				
			}
			else if(type == "layout"){
				
				// if(items.length > 1)
				var data_str = imp.TPL_FUNCTIONS[tpl_id].getLayoutData(item, parent, prevItem, prevStaticItem, configConfig);
				
				if(data_str != undefined){
					var layout_id = imp.getLayoutID(item);
					
					var data = {"layout_id" : layout_id, "layout_data" : data_str};
					var str = await imp.convertTemplate(path_tpl + "layout/layout.txt", data);
					
					imp.tpl_add_block(str, indent);
				}
				
			}
			
			//line breaks
			imp.tpl_br(linebreaks.std, indent, 2);
			
			
			if(type == "main" && textFormatFile && item.type == imp.TYPE_TEXT){
				
				var textformat_id = imp.getTextFormatID(item.textdata, configConfig);
				//trace("listTextFormatID : "+typeof listTextFormatID);
				
				if(listTextFormatID.indexOf(textformat_id) == -1){
					listTextFormatID.push(textformat_id);
					listTextFormat.push(item.textdata);
				}
			}
			
			if(iscontainer){
				
				await rec(item.childrens, item, level + 1, type);
			}
			
			
			//close tags
			
			if(type == "main" && closeTags && iscontainer){
				
				var str = imp.getCloseTag(closeTagsConfig, itemCode);
				if(str != ""){
					if(linebreaks.before_closetag > 0) imp.tpl_br(linebreaks.before_closetag, indent, 4);
					imp.tpl_add_line(str, indent);
				}
			}
			
			prevItem = item;
			if(item[imp.OPT_POSITION] == 'static') prevStaticItem = item;
			
		}
		
	}
	
	
	
	


	
	async function getItemCode(item, parent, _tffile, _layoutfile)
	{
		//instanciation + integration
		
		var varname = imp.getVarname(item.name);
		var parent_varname = (parent != null) ? imp.getVarname(parent.name) : "container";
		var layout_id = imp.getLayoutID(item);
		if(!parent && configConfig.classname_root) layout_id = configConfig.classname_root;
		
		var data = {
			"varname": varname,
			"parent_varname": parent_varname,
			"layout_id" : layout_id,
		};
		
		
		if(!_tffile && item.type == imp.TYPE_TEXT){
			data["textformat_data"] = imp.TPL_FUNCTIONS[tpl_id].getTextFormatData(item.textdata, configConfig);
		}
		
		//not used
		if(!_layoutfile){
			data["layout_data"] = imp.TPL_FUNCTIONS[tpl_id].getLayoutData(item, parent);
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
		
		if(item.type == imp.TYPE_CONTAINER){
			
			var str2 = await imp.convertTemplate(path_tpl + "main/"+item.type+".txt", data);
			str += str2;
		}
		else if(item.type == imp.TYPE_GFX){
			
			var str2 = await imp.convertTemplate(path_tpl + "main/"+item.type+".txt", data);
			str += str2;
		}
		else if(item.type == imp.TYPE_TEXT){
			
			data["textformat_id"] = imp.getTextFormatID(item.textdata, configConfig);
			
			data["text_color"] = imp.getTextColorID(item.textdata, config.colors);
			
			data["text_align"] = "text_" + item.textdata.halign;
			
			//eventuellement une boucle sur textdata ici
			data["text"] = item.textdata.text;
			data["text_br"] = item.textdata.text.replace(/\\n/g, "<br />");
			
			var str2 = await imp.convertTemplate(path_tpl + "main/"+item.type+".txt", data);
			str += str2;
		}
		else if(item.type == imp.TYPE_SHAPE){
			
			var str2 = await imp.convertTemplate(path_tpl + "main/"+item.type+".txt", data);
			str += str2;
		}
		
		else if(imp.BTNS_TYPE.indexOf(item.type) != -1){
			
			var str3 = await imp.convertTemplate(path_tpl + "main/"+TYPE_BTN+".txt", data);
			str += str3;
		}
		
		
		
		var common_post_str = await imp.convertTemplate(path_tpl + "main/common-post.txt", data);
		if(common_post_str != ""){
			str += "\n" + common_post_str;
		}
		
			
		return str;
	}

}


module.exports = {
	generate_template,
};

