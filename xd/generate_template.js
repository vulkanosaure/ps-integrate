var imp = {};

const file_debug = require('./debug.js');
var trace = file_debug.trace;
var tracerec = file_debug.tracerec;

imp = {...imp, ...require('./template_utils.js')};
imp = {...imp, ...require('./template_functions.js')};
imp = {...imp, ...require('./constantes.js')};
imp = {...imp, ...require('./utils.js')};


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
		
		recLayoutData(items, null);
		
		imp.recTransformLvl(items, null, items);
		
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
		
		
		for(var i=len - 1; i>=0; i--){
			
			var item = items[i];
			
			var parentname = (parent != null) ? parent.name : "";
			tracerec("item : "+item.name+", parentname : "+parentname, level);
			
			var iscontainer = imp.CONTAINERS_TYPE.indexOf(item.type) != -1;
			
			var indent = baseIndent;
			if(type == "main" && configMain.indent) indent += level;
			if(type == "layout" && configLayout.file.sass_indent) indent += level;
			
			
			
			//separator
			
			if(level == 0){
				
				//linebreak before (root) comment
				if(imp.get_tpl_content() != ""){
					imp.tpl_br(4, indent, 1.5);
				}
				
				var str = await imp.convertTemplate(path_tpl + type + "/separator.txt", {name: item.name});
				
				//allow separator for
				if(type=='main' && level <= 0) imp.tpl_add_block(str, indent);
				else if(type=='layout' && level <= 1) imp.tpl_add_block(str, indent);
				
				//linebreak after (root) comment
				imp.tpl_br(1, indent, 1);
			}
			
			//linebreak level > 0
			else{
				
				var nbline = 1;
				if(type == "main"){
					if(prevItem || len == 1) nbline = 0;
				}
				imp.tpl_br(nbline, indent);
			}
			
			
			var itemCode;
			
			if(type == "main"){
				
				//instanciation / integration code
				itemCode = await getItemCode(item, parent, textFormatFile, layoutFile);
				
				var linebreak = (!closeTags || iscontainer);
				imp.tpl_add_block(itemCode, indent, linebreak);
				
				//close tag (one line item, non container)
				if(closeTags && !iscontainer){
					var str = imp.getCloseTag(closeTagsConfig, itemCode);
					if(str != "") imp.tpl_add_line(str, 0);
				}
				
			}
			else if(type == "layout"){
				
				
				// var data_str = imp.TPL_FUNCTIONS[tpl_id].getLayoutData(item, parent, prevItem, prevStaticItem, configConfig, configLayout);
				var data_str = item.layoutData;
				
				
				if(data_str != undefined){
					
					var selector;
					
					if(item.selectorType == 'classname'){
						var layout_id = imp.getLayoutID(item);
						selector = layout_id;
						if(configLayout.file.sass_indent){
							selector = imp.encodeNameParentRef(selector, parent);
						}
						if(selector.charAt(0) != '&') selector = '.' + selector;
					}
					else if(item.selectorType == 'tag'){
						selector = '& > ' + item.tag;
						if(item.countTag > 1){
							let positionTag = item.positionTag + 1;
							selector += ':nth-child(' + positionTag + ')';
						}
					}
					
					
					
					
					
					var data = {"selector" : selector, "layout_data" : data_str};
					var str = await imp.convertTemplate(path_tpl + "layout/layout.txt", data);
					
					imp.tpl_add_block(str, indent);
				}
				
			}
			
			
			
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
					imp.tpl_add_line(str, indent);
				}
			}
			if(type == "layout" && configLayout.file.sass_indent){
				var str = "}";
				imp.tpl_add_line(str, indent);
			}
			
			prevItem = item;
			if(item[imp.OPT_POSITION] == 'static') prevStaticItem = item;
			
		}
		
	}
	
	
	
	
	
	
	
	
	
	function recLayoutData(items, parent)
	{
		var len = items.length;
		var prevItem = null;
		var prevStaticItem = null;
		
		for(var i=len - 1; i>=0; i--){
			
			var item = items[i];
			
			var data_str = imp.TPL_FUNCTIONS[tpl_id].getLayoutData(item, parent, prevItem, prevStaticItem, configConfig, configLayout);
			item.layoutData = data_str;
			
			var iscontainer = imp.CONTAINERS_TYPE.indexOf(item.type) != -1;
			
			if(iscontainer){
				recLayoutData(item.childrens, item);
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
		
		var classes = [];
		classes.push(layout_id);
		
		
		if(item.generatedName && item.countTag <= 2 && configLayout.file.sass_indent){
			classes.splice(0, 1);
			item.selectorType = 'tag';
		}
		else item.selectorType = 'classname';
		
		
		if(!_tffile && item.type == imp.TYPE_TEXT){
			data["textformat_data"] = imp.TPL_FUNCTIONS[tpl_id].getTextFormatData(item.textdata, configConfig);
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
		let tplFile = "elmt";
		
		if(item.type == imp.TYPE_GFX){
			if(!item.has_graphic && item[imp.OPT_IMGTYPE] == 'svg-inline'){
				data['data'] = item.pathdata.data;
				tplFile = 'pathdata';
			}
		}
		else if(item.type == imp.TYPE_TEXT){
			
			let textformat_id = imp.getTextFormatID(item.textdata, configConfig);
			let text_color = imp.getTextColorID(item.textdata, config.colors);
			let text_align = "text_" + item.textdata.halign;
			classes.unshift(textformat_id);
			
			//eventuellement une boucle sur textdata ici
			
			let text = item.textdata.text;
			//text = text.replace(/\\n/g, "<br />");	//phothoshop ? (introduire constante/conditions)
			text = text.replace(/\n/g, "<br />");
			data["content"] = text;
			
		}
		
		
		//maybe deprecated
		if(item[imp.OPT_CLASS] && classes.indexOf(item[imp.OPT_CLASS]) == -1){
			classes.push(item[imp.OPT_CLASS]);
		}
		
		
		let strclasses = '';
		if(classes && classes.length > 0){
			strclasses = ' class="'+classes.join(' ')+'"';
		}		
		data["classes"] = strclasses;
		
		var str2 = await imp.convertTemplate(path_tpl + "main/"+tplFile+".txt", data);
		str += str2;
		
		// str += "\n" + common_post_str;
		
			
		return str;
	}

}


module.exports = {
	generate_template,
};

