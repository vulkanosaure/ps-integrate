function generate_template(items, tpl_id, config)
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
	var path_tpl = "templates/" + tpl_id + "/";
	
	var textFormatFile= (configTextformat.file != undefined);
	var layoutFile= (configLayout.file != undefined);
	
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
		
		var len = listTextFormat.length;
		for(var i = 0; i < len; i++){
				
			var textdata = listTextFormat[i];
			var data_str = TPL_FUNCTIONS[tpl_id].getTextFormatData(textdata, configConfig);
			
			var textformat_id = getTextFormatID(textdata, configConfig);
			var data = {"textformat_id" : textformat_id, "textformat_data" : data_str};
			var str = convertTemplate(path_tpl + "textformat/textformat.txt", data);
			
			tpl_add_block(null, str, baseIndent);
			
		}
		
		var filename = configTextformat.file.filename;
		output.push({filename : filename,  content : get_tpl_content()});
		
	}
	
	
	
	
	//LAYOUT
	
	if(layoutFile){
		
		trace('_____________________________________');
		trace('recLayoutData');
		recLayoutData(items, null);
		
		recTransformLvl(items, null, items);
		
		tpl_reset();
		baseIndent = configLayout.file.base_indent;
		
		trace('_____________________________________');
		trace('rec');
		
		rec(items, null, 0, "layout");
		//todo : in rec function
		
		var filename = configLayout.file.filename;
		output.push({filename : filename,  content : get_tpl_content()});
		
		
		
		for(var idtpl in templateData){
			var filename = idtpl + '.txt';
			var data = getTemplateData(idtpl);
			
			if(data.type == 'file') throw new Error('why ?');
			
			output.push({
				filename : filename,  
				content : data.output,
				path : 'tpl/',
			});
		}
		
	}
	
	
	
	return output;
	
	
	
	
	
	
	//___________________________________________________________________________________________
	
	
	function rec(items, parent, level, type)
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
		
		
		for(var i=0; i < len; i++){
		// for(var i=len - 1; i>=0; i--){
			
			var item = items[i];
			
			var parentname = (parent != null) ? parent.name : "";
			tracerec("item : "+item.name+", parentname : "+parentname, level);
			
			var iscontainer = CONTAINERS_TYPE.indexOf(item.type) != -1;
			var readMode = (item[OPT_TPL]) ? true : false;
			
			
			var indent = baseIndent;
			if(type == "main" && configMain.indent) indent += level;
			if(type == "layout" && configLayout.file.sass_indent) indent += level;
			
			
			
			
			//separator
			
			if(level == 0){
				
				//linebreak before (root) comment
				if(get_tpl_content() != ""){
					tpl_br(4, indent, 1.5);
				}
				
				var str = convertTemplate(path_tpl + type + "/separator.txt", {name: item.name});
				
				//allow separator for
				if(type=='main' && level <= 0) tpl_add_block(null, str, indent);
				else if(type=='layout' && level <= 1) tpl_add_block(null, str, indent);
				
				//linebreak after (root) comment
				tpl_br(1, indent, 1);
			}
			
			//linebreak level > 0
			else{
				
				var nbline = 1;
				if(type == "main"){
					if(prevItem || len == 1) nbline = 0;
				}
				else if(type == "layout"){
					if(item[OPT_TPLMODEL]) nbline += 1;
					else if(item[OPT_TPL]) nbline = 0;
				}
				
				tpl_br(nbline, indent);
			}
			
			
			var itemCode;
			
			if(type == "main"){
				
				
				//define selector type
				
				if(item.useTag && item.countTagUnnamed <= 2 && configLayout.file.sass_indent){
					item.selectorType = 'tag';
				}
				else item.selectorType = 'classname';
				
				
				//transform text
				
				if(item.type == TYPE_TEXT){
					var text = item.textdata.text;
					text = nl2br(text);
					item.textdata.text = text;
				}
				
				
				
				
				//instanciation / integration code
				
				var itemCodeObj = {};
				
				if(item[OPT_TPL]){
					
					var values = getPlaceHolderValues(item, configConfig);
					itemCode = getTemplateCode(item, values);
				}
				else{
					itemCodeObj = getItemCode(item, parent, textFormatFile, layoutFile);
					itemCode = itemCodeObj.main;
				}
				
				
				var linebreak = (!closeTags || iscontainer || readMode);
				tpl_add_content(item, itemCode, indent, linebreak, true, itemCodeObj.tpl);
				
				
				//close tag (one line item, non container)
				if(closeTags && !iscontainer && !readMode){
					
					var isClosableTag = LIST_TAGS_NOCLOSE.indexOf(item.tag) == -1;
					if(isClosableTag){
						var str = getCloseTag(closeTagsConfig, itemCode);
						if(str != ""){
							tpl_add_content(item, str, 0, true, false);
						}
					}
					else tpl_add_content(item, '', 0, true, false);
				}
				
			}
			else if(type == "layout" && item.layoutData != undefined){
				
				//print 1st selector
				var data = item.layoutData[0];
				var str = convertTemplate(path_tpl + "layout/layout.txt", data);
				tpl_add_block(null, str, indent);
				
				if(item[OPT_TPLMODEL]){
					
				}
			}
			
			
			
			if(type == "main" && textFormatFile && item.type == TYPE_TEXT){
				
				var textformat_id = getTextFormatID(item.textdata, configConfig);
				//trace("listTextFormatID : "+typeof listTextFormatID);
				
				if(listTextFormatID.indexOf(textformat_id) == -1){
					listTextFormatID.push(textformat_id);
					listTextFormat.push(item.textdata);
				}
			}
			
			
			
			if(iscontainer && 
				(item['templateMode'] != 'read')
			){
				
				rec(item.childrens, item, level + 1, type);
			}
			
			
			
			
			
			//close tags
			if(type == "main" && closeTags && iscontainer && !readMode){
				
				var str = getCloseTag(closeTagsConfig, itemCode);
				if(str != ""){
					tpl_add_content(item, str, indent, true, false);
				}
			}
			if(type == "layout" && configLayout.file.sass_indent){
				var str = "}";
				tpl_add_line(null, str, indent);
			}
			
			
			//linebreak (after tpl definition)
			if(type == "layout"){
				var nbline = 0;
				if(item[OPT_TPLMODEL]) nbline += 2;
				tpl_br(nbline, indent);
			}
			
			
			
			
			
			
			//print other selector if any (position after render, mode write)
			
			if(type == "layout" && item.layoutData != undefined){
				
				var len2 = item.layoutData.length;
				for(var j=1;j<len2;j++){
					
					var data = item.layoutData[j];
					var str = convertTemplate(path_tpl + "layout/layout.txt", data);
					tpl_add_block(null, str, indent);
				}
			}
			
			
			
			
			prevItem = item;
			if(item[OPT_POSITION] == 'static') prevStaticItem = item;
			
		}
		
	}
	
	
	
	
	
	
	
	
	
	function recLayoutData(items, parent)
	{
		var len = items.length;
		var prevItem = null;
		var prevStaticItem = null;
		
		
		// for(var i=len - 1; i>=0; i--){
		for(var i=0; i < len; i++){
			
			var item = items[i];
			
			var data = TPL_FUNCTIONS[tpl_id].getLayoutData(item, parent, prevItem, prevStaticItem, configConfig, configLayout);
			
			var sass_indent = configLayout.file.sass_indent;
			var closeTag = !sass_indent;
			var selectorName = getSelector(item, parent, sass_indent);
			
			
			item.layoutData = [];
			var data_str;
			
			//write (render + position)
			if(item[OPT_TPLMODEL]){
				
				var selectorTemplate = '.' + item[OPT_TPLMODEL];
				data_str = propsToString(data, {multiline : true, separator : ";", quoteProperty:"none", equal:':'}, closeTag, 'render');
				item.layoutData.push({ selector: selectorTemplate, layout_data: data_str });
				
				data_str = propsToString(data, {multiline : true, separator : ";", quoteProperty:"none", equal:':'}, true, 'position');
				item.layoutData.push({ selector: selectorName, layout_data: data_str });
				
			}
			//read (position only)
			else if(item[OPT_TPL]){
				
				data_str = propsToString(data, {multiline : true, separator : ";", quoteProperty:"none", equal:':'}, closeTag, 'position');
				item.layoutData.push({ selector: selectorName, layout_data: data_str });
			}
			//normal (both mixed)
			else{
				data_str = propsToString(data, {multiline : true, separator : ";", quoteProperty:"none", equal:':'}, closeTag);
				item.layoutData.push({ selector: selectorName, layout_data: data_str });
			}
			
			
			var iscontainer = CONTAINERS_TYPE.indexOf(item.type) != -1;
			
			if(iscontainer){
				recLayoutData(item.childrens, item);
			}
			
			prevItem = item;
			if(item[OPT_POSITION] == 'static') prevStaticItem = item;
		}
		
	}
	
	
	
	

	function getTemplateCode(item, values)
	{
		var idtemplate = item[OPT_TPL];
		var templateDataObj = getTemplateData(idtemplate);
		var templateData = templateDataObj.output;
		var type = templateDataObj.type;
		
		var layout_id = getLayoutID(item);
		
		var classes = [];
		classes.push(item[OPT_TPL]);
		if(item.selectorType == 'classname') classes.push(layout_id);
		
		
		var data = {};
		
		var strclasses = classes.join(' ');
		data["classes"] = strclasses;
		// data = Object.assign(data, values);
		for(var k in values) data[k] = values[k];
		
		
		var output = convertTemplateFromStr(templateData, data, false);
		
		return output;
	}
	
	
	
	
	
	function getItemCode(item, parent, _tffile, _layoutfile)
	{
		var output = {};
		
		//instanciation + integration
		
		
		var varname = getVarname(item.name);
		var parent_varname = (parent != null) ? getVarname(parent.name) : "container";
		var layout_id = getLayoutID(item);
		if(!parent && configConfig.classname_root) layout_id = configConfig.classname_root;
		
		var data = {
			"varname": varname,
			"parent_varname": parent_varname,
			"layout_id" : layout_id,
		};
		
		var classes = [];
		if(item[OPT_TPLMODEL]) classes.push(item[OPT_TPLMODEL]);
		if(item.selectorType == 'classname') classes.push(layout_id);
		
		
		if(!_tffile && item.type == TYPE_TEXT){
			data["textformat_data"] = TPL_FUNCTIONS[tpl_id].getTextFormatData(item.textdata, configConfig);
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
		if(LIST_TAGS_NOCLOSE.indexOf(item.tag) > -1) data['autoclose'] = ' /';
		
		
		
		var attributes = [];
		
		if(item.type == TYPE_GFX){
			if(!item.has_graphic && item[OPT_IMGTYPE] == 'svg-inline'){
				
				attributes.push({ key: 'width', value: item.widthPx });
				attributes.push({ key: 'height', value: item.heightPx });
				data["content"] = '<path d="'+ item.pathdata.data +'"/>';
			}
		}
		else if(item.type == TYPE_TEXT){
			
			var textformat_id = getTextFormatID(item.textdata, configConfig);
			/* 
			var text_color = getTextColorID(item.textdata, config.colors);
			var text_align = "text_" + item.textdata.halign;
			 */
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
		
		
		//classes2
		var strclasses2 = '';
		if(item[OPT_CLASS]){
			var classes2 = item[OPT_CLASS].split('/');
			strclasses2 = classes2.join(' ');
		}
		data["classes2"] = strclasses2 ? ' ' + strclasses2 : '';
		
		
		
		
		var strattributes = '';
		if(attributes && attributes.length > 0){
			var tabattrs = attributes.map(function(obj){ return obj.key+'="'+obj.value+'"' });
			strattributes = ' '+tabattrs.join(' ');
		}
		data["attributes"] = strattributes;
		
		
		
		var fileTpl = path_tpl + "main/elmt.txt";
		var contentMain = convertTemplate(fileTpl, data);
		contentMain = contentMain.replace(" class=''", "");
		output['main'] = contentMain;
		
		
		
		//override tplmodel root for classname
		if(item[OPT_TPLMODEL]){
			data["classes"] = '{{classes}}';
			output['tpl'] = convertTemplate(fileTpl, data, true);
		}
		
		
		
		//override elmt with placeholder for write tplmodel
		//(replace real value by {{placeholder}})
		
		if(item['templateMode'] == 'write' && item[OPT_PLACEHOLDER]){
			
			if(item.type == TYPE_TEXT){
				data["content"] = '{{'+item[OPT_PLACEHOLDER]+'}}';
			}
			//img src
			else if(item.type == TYPE_GFX && item.tag == 'img'){
				var attr = attributes.find(function(obj){ return obj.key == 'src';});
				attr.value = '{{'+item[OPT_PLACEHOLDER]+'}}';
			}
			//svg-inline
			else if(item.type == TYPE_GFX && item.tag == 'svg'){
				data["content"] = '{{'+item[OPT_PLACEHOLDER]+'}}';
				
				var attrw = attributes.find(function(obj){ return obj.key == 'width';});
				var attrh = attributes.find(function(obj){ return obj.key == 'height';});
				attrw.value = '{{'+item[OPT_PLACEHOLDER]+'_width}}';
				attrh.value = '{{'+item[OPT_PLACEHOLDER]+'_height}}';
				
			}
			
			
			var strattributes = '';
			if(attributes && attributes.length > 0){
				var tabattrs = attributes.map(function(obj){ return obj.key+'="'+obj.value+'"' });
				strattributes = ' '+tabattrs.join(' ');
			}
			data["attributes"] = strattributes;
			
			output['tpl'] = convertTemplate(fileTpl, data, true);
		}
		
		
		
		return output;
	}

}

