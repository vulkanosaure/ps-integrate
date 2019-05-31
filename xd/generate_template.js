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
			
			imp.tpl_add_block(null, str, baseIndent);
			
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
			var readMode = (item[imp.OPT_TPL]) ? true : false;
			
			
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
				if(type=='main' && level <= 0) imp.tpl_add_block(null, str, indent);
				else if(type=='layout' && level <= 1) imp.tpl_add_block(null, str, indent);
				
				//linebreak after (root) comment
				imp.tpl_br(1, indent, 1);
			}
			
			//linebreak level > 0
			else{
				
				var nbline = 1;
				if(type == "main"){
					if(prevItem || len == 1) nbline = 0;
				}
				else if(type == "layout"){
					if(item[imp.OPT_TPLMODEL]) nbline += 1;
					else if(item[imp.OPT_TPL]) nbline = 0;
				}
				
				imp.tpl_br(nbline, indent);
			}
			
			
			var itemCode;
			
			if(type == "main"){
				
				
				//define selector type
				
				if(item.useTag && item.countTag <= 2 && configLayout.file.sass_indent){
					item.selectorType = 'tag';
				}
				else item.selectorType = 'classname';
				
				
				//transform text
				
				if(item.type == imp.TYPE_TEXT){
					var text = item.textdata.text;
					//text = text.replace(/\\n/g, "<br />");	//phothoshop ? (introduire constante/conditions)
					text = text.replace(/\n/g, "<br />");
					item.textdata.text = text;
				}
				
				
				
				
				//instanciation / integration code
				
				var itemCodeObj = {};
				
				if(item[imp.OPT_TPL]){
					
					var values = imp.getPlaceHolderValues(item, configConfig);
					itemCode = await getTemplateCode(item, values);
				}
				else{
					itemCodeObj = await getItemCode(item, parent, textFormatFile, layoutFile);
					itemCode = itemCodeObj.main;
				}
				
				
				var linebreak = (!closeTags || iscontainer || readMode);
				imp.tpl_add_content(item, itemCode, indent, linebreak, true, itemCodeObj.tpl);
				
				if(item['templateMode'] == 'write'){
					trace('check library');
					trace(imp.templateData[item['tplparent']]);
				}
				
				
				
				//close tag (one line item, non container)
				if(closeTags && !iscontainer && !readMode){
					
					var isClosableTag = imp.LIST_TAGS_NOCLOSE.indexOf(item.tag) == -1;
					if(isClosableTag){
						var str = imp.getCloseTag(closeTagsConfig, itemCode);
						if(str != ""){
							imp.tpl_add_content(item, str, 0, true, false);
						}
					}
					else imp.tpl_add_content(item, '', 0, true, false);
				}
				
			}
			else if(type == "layout" && item.layoutData != undefined){
				
				//print 1st selector
				var data = item.layoutData[0];
				var str = await imp.convertTemplate(path_tpl + "layout/layout.txt", data);
				imp.tpl_add_block(null, str, indent);
			}
			
			
			
			if(type == "main" && textFormatFile && item.type == imp.TYPE_TEXT){
				
				var textformat_id = imp.getTextFormatID(item.textdata, configConfig);
				//trace("listTextFormatID : "+typeof listTextFormatID);
				
				if(listTextFormatID.indexOf(textformat_id) == -1){
					listTextFormatID.push(textformat_id);
					listTextFormat.push(item.textdata);
				}
			}
			
			
			
			if(iscontainer && 
				(item['templateMode'] != 'read')
			){
				
				await rec(item.childrens, item, level + 1, type);
			}
			
			
			
			
			
			//close tags
			if(type == "main" && closeTags && iscontainer && !readMode){
				
				var str = imp.getCloseTag(closeTagsConfig, itemCode);
				if(str != ""){
					imp.tpl_add_content(item, str, indent, true, false);
				}
			}
			if(type == "layout" && configLayout.file.sass_indent){
				var str = "}";
				imp.tpl_add_line(null, str, indent);
			}
			
			
			//linebreak (after tpl definition)
			if(type == "layout"){
				var nbline = 0;
				if(item[imp.OPT_TPLMODEL]) nbline += 2;
				imp.tpl_br(nbline, indent);
			}
			
			
			
			
			
			
			//print other selector if any (position after render, mode write)
			
			if(type == "layout" && item.layoutData != undefined){
				
				var len = item.layoutData.length;
				for(var j=1;j<len;j++){
					
					var data = item.layoutData[j];
					var str = await imp.convertTemplate(path_tpl + "layout/layout.txt", data);
					imp.tpl_add_block(null, str, indent);
				}
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
			
			var data = imp.TPL_FUNCTIONS[tpl_id].getLayoutData(item, parent, prevItem, prevStaticItem, configConfig, configLayout);
			
			var sass_indent = configLayout.file.sass_indent;
			var closeTag = !sass_indent;
			var selectorName = imp.getSelector(item, parent, sass_indent);
			
			
			item.layoutData = [];
			var data_str;
			
			trace('item : '+item.name);
			
			//write (render + position)
			if(item[imp.OPT_TPLMODEL]){
				
				var selectorTemplate = '.' + item[imp.OPT_TPLMODEL];
				data_str = imp.propsToString(data, {multiline : true, separator : ";", quoteProperty:"none", equal:':'}, closeTag, 'render');
				item.layoutData.push({ selector: selectorTemplate, layout_data: data_str });
				
				data_str = imp.propsToString(data, {multiline : true, separator : ";", quoteProperty:"none", equal:':'}, true, 'position');
				item.layoutData.push({ selector: selectorName, layout_data: data_str });
				
			}
			//read (position only)
			else if(item[imp.OPT_TPL]){
				
				data_str = imp.propsToString(data, {multiline : true, separator : ";", quoteProperty:"none", equal:':'}, closeTag, 'position');
				item.layoutData.push({ selector: selectorName, layout_data: data_str });
			}
			//normal (both mixed)
			else{
				data_str = imp.propsToString(data, {multiline : true, separator : ";", quoteProperty:"none", equal:':'}, closeTag);
				item.layoutData.push({ selector: selectorName, layout_data: data_str });
			}
			
			
			var iscontainer = imp.CONTAINERS_TYPE.indexOf(item.type) != -1;
			
			if(iscontainer){
				recLayoutData(item.childrens, item);
			}
			
			prevItem = item;
			if(item[imp.OPT_POSITION] == 'static') prevStaticItem = item;
		}
		
	}
	
	
	
	

	async function getTemplateCode(item, values)
	{
		var idtemplate = item[imp.OPT_TPL];
		var templateDataObj = await imp.getTemplateData(idtemplate);
		var templateData = templateDataObj.output;
		var type = templateDataObj.type;
		
		var layout_id = imp.getLayoutID(item);
		
		var classes = [];
		if(type == 'memory') classes.push(item[imp.OPT_TPL]);
		if(item.selectorType == 'classname') classes.push(layout_id);
		
		var data = {};
		
		var strclasses = classes.join(' ');
		data["classes"] = strclasses;
		data = Object.assign(data, values);
		
		var output = await imp.convertTemplateFromStr(templateData, data, false);
		
		return output;
	}
	
	
	
	
	
	async function getItemCode(item, parent, _tffile, _layoutfile)
	{
		var output = {};
		
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
		if(item[imp.OPT_TPLMODEL]) classes.push(item[imp.OPT_TPLMODEL]);
		
		if(item.selectorType == 'classname') classes.push(layout_id);
		
		
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
		
		
		//autoclose tag
		data['autoclose'] = '';
		if(imp.LIST_TAGS_NOCLOSE.indexOf(item.tag) > -1) data['autoclose'] = ' /';
		
		
		
		var attributes = [];
		
		if(item.type == imp.TYPE_GFX){
			if(!item.has_graphic && item[imp.OPT_IMGTYPE] == 'svg-inline'){
				
				attributes.push({ key: 'width', value: item.width });
				attributes.push({ key: 'height', value: item.height });
				data["content"] = '<path d="'+ item.pathdata.data +'"/>';
			}
		}
		else if(item.type == imp.TYPE_TEXT){
			
			var textformat_id = imp.getTextFormatID(item.textdata, configConfig);
			var text_color = imp.getTextColorID(item.textdata, config.colors);
			var text_align = "text_" + item.textdata.halign;
			classes.unshift(textformat_id);
			
			data["content"] = item.textdata.text;	
		}
		
		
		
		//add attribute for specific balise
		//todo : gérer ça plus proprement plus tard
		
		if(item.tag == 'a') attributes.push({key: 'href', value: '#'});
		else if(item.tag == 'button') attributes.push({key: 'type', value: 'button'});
		else if(item.tag == 'img'){
			attributes.push({key: 'src', value: configConfig.prefix_images + item.fullpath});
		}
		
		
		
		
		
		var strclasses = '';
		if(classes && classes.length > 0){
			strclasses = classes.join(' ');
		}		
		data["classes"] = strclasses;
		
		
		var strattributes = '';
		if(attributes && attributes.length > 0){
			var tabattrs = attributes.map(obj => obj.key+'="'+obj.value+'"');
			strattributes = ' '+tabattrs.join(' ');
		}
		data["attributes"] = strattributes;
		
		
		tracerec('item__ : '+item.name, 0);
		
		var fileTpl = path_tpl + "main/elmt.txt";
		var contentMain = await imp.convertTemplate(fileTpl, data);
		contentMain = contentMain.replace(" class=''", "");
		output['main'] = contentMain;
		
		
		
		//override tplmodel root for classname
		if(item[imp.OPT_TPLMODEL]){
			data["classes"] = '{{classes}}';
			output['tpl'] = await imp.convertTemplate(fileTpl, data, true);
		}
		
		
		
		//override elmt with placeholder for write tplmodel
		//(replace real value by {{placeholder}})
		
		if(item['templateMode'] == 'write' && item[imp.OPT_PLACEHOLDER]){
			
			if(item.type == imp.TYPE_TEXT){
				data["content"] = '{{'+item[imp.OPT_PLACEHOLDER]+'}}';
			}
			else if(item.type == imp.TYPE_GFX && item.tag == 'img'){
				var attr = attributes.find(function(obj){
					return obj.key == 'src';
				});
				trace('attr : '+attr);
				attr.value = '{{'+item[imp.OPT_PLACEHOLDER]+'}}';
			}
			
			
			var strattributes = '';
			if(attributes && attributes.length > 0){
				var tabattrs = attributes.map(obj => obj.key+'="'+obj.value+'"');
				strattributes = ' '+tabattrs.join(' ');
			}
			data["attributes"] = strattributes;
			
			output['tpl'] = await imp.convertTemplate(fileTpl, data, true);
		}
		
		
		
		return output;
	}

}


module.exports = {
	generate_template,
};

