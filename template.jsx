generate_template = function(indextpl, items)
{
	trace("generate_template ("+indextpl+")");
	
	var output = [];
	
	var listStylesTextID = new Array();
	var listStylesText = new Array();
	
	var styleTextFile = "StylesText";
	var baseIndent = 2;
	
	tpl_reset();
	
	
	rec(items, null, 0);
	
	output.push({filename : "template.hx",  content : get_tpl_content()});
	
	
	//styles fonts
	
	tpl_reset();
	baseIndent = 1;
	
	var len = listStylesText .length;
	for(var i = 0; i < len; i++){
			
		var textdata = listStylesText [i];
		var str = getStyleTextCode(textdata);
		tpl_add_block(str, baseIndent);
		
	}
	output.push({filename : styleTextFile + ".hx",  content : get_tpl_content()});
	
	trace("retour output.length : "+output.length);
	return output;
	
	
	
	function rec(items, parent, level)
	{
		var len = items.length;
		//for(var i=0; i<len; i++){
		for(var i=len - 1; i>=0; i--){
			
			var item = items[i];
			
			var parentname = (parent != null) ? parent.name : "";
			tracerec("item : "+item.name+", parentname : "+parentname, level);
			
			
			//separator
			if(CONTAINERS_TYPE.indexOf(item.type) != -1  || level == 0){
				
				var tplname = level == 0 ? item.name.toUpperCase() : item.name;
				var templateprefix = (level == 0) ? "-big" : "-small";
				var str = convertTemplate("generate-script/templates/haxe-separator"+templateprefix+".txt", {name: tplname});
				tpl_add_block(str, baseIndent);
				var nbline = (level == 0) ? 3 : 1;
				tpl_br(nbline, baseIndent);
			}
			
			//instanciation / integration code
			var itemCode = getItemCode(item, parent);
			tpl_add_block(itemCode, baseIndent);
			
			tpl_br(2, baseIndent);
			
			if(item.type == TYPE_TEXT){
				
				var idstyletext = getStyleTextID(item.textdata);
				
				//trace("listStylesTextID : "+typeof listStylesTextID);
				
				if(listStylesTextID.indexOf(idstyletext) == -1){
					listStylesTextID.push(idstyletext);
					listStylesText.push(item.textdata);
				}
			}
			
			if(CONTAINERS_TYPE.indexOf(item.type) != -1){

				rec(item.childrens, item, level + 1);
			}
			
			if(i == len - 1) tpl_br(2, baseIndent);
			if(level == 0) tpl_br(5, baseIndent);
			
		}
		
	}


	
	function getItemCode(item, parent)
	{
		//instanciation + integration
		
		var varname = getVarname(item.name);
		var classname;
		if(item.type == TYPE_CONTAINER) classname = "LayoutSprite";
		else if(item.type == TYPE_GFX) classname = "VImage";
		else if(item.type == TYPE_TEXT) classname = "VText";
		else if(item.type == TYPE_BTN || item.type == TYPE_BTNC) classname = "VButton1";
		
		
		var parentname = (parent != null) ? getVarname(parent.name) : "container";
		
		var paramconst = "";
		if(item.type == TYPE_GFX || item.type == TYPE_BTN){
			paramconst = '"' + item.path + "/" + item[OPT_FILENAME] + '"';
		}
		else if(item.type == TYPE_BTNC){
			paramconst = '"' + item.path + "/" + item[OPT_FILENAME] + '"';
		}
		
		else if(item.type == TYPE_TEXT){
			paramconst = styleTextFile + "." + getStyleTextID(item.textdata);
		}
		
		//layout code
		
		var x = item.position[0];
		var y = item.position[1];
		var lx = item[OPT_LAYOUT_X];
		var ly = item[OPT_LAYOUT_Y];
		
		var layout_props = {};
		
		if(lx == "left" && x != 0) layout_props["margin-left"] = x;
		else if(lx == "right") layout_props["margin-right"] = item.margin_right;
		else if(lx == "center") layout_props["center-h"] = item.center_h / 100;
		
		if(ly == "top" && y != 0) layout_props["margin-top"] = y;
		else if(ly == "bottom") layout_props["margin-bottom"] = item.margin_bottom;
		else if(ly == "center") layout_props["center-v"] = item.center_v / 100;
		
		if(lx !="left") layout_props["width"] = item.width;
		if(ly != "top") layout_props["height"] = item.height;
	
		var layout_props_str = propsToString(layout_props);
		//LayoutManager.addItem(_btnrate, { "center-h" : 0.5, "margin-top" : 200} );
		
		
		var data = {
			"var": varname,
			"classname": classname,
			"parent": parentname,
			"paramconst": paramconst,
			"layout_props": layout_props_str,
		};
		
		var str = convertTemplate("generate-script/templates/haxe-instance.txt", data);
		
		
		
		if(item.type == TYPE_TEXT){
			
			data = {"var" : varname, "text" : item.textdata.text, "width" : item.width};
			var str2 = convertTemplate("generate-script/templates/haxe-set-text.txt", data);
			str += "\n" + str2;
		}
		
		if(BTNS_TYPE.indexOf(item.type) != -1){
			
			data = {"var" : varname};
			var str3 = convertTemplate("generate-script/templates/haxe-btn-onclick.txt", data);
			str += "\n"+ str3;
		}
		
			
		return str;
	}
	
	

	function getStyleTextID(textdata)
	{
		var output = "";
		output += textdata.font;
		output += "_";
		output += textdata.color;
		output += "_";
		output += textdata.size;
		
		output += textdata.halign.substr(0, 1) + "";
		output += textdata.letterspacing + "";
		if(textdata.leading != undefined) output += textdata.leading + "";
		
		output = getVarname(output);
		return output;
	}
	


	function getStyleTextCode(textdata)
	{
		var stylename = getStyleTextID(textdata);
		var props = {};
		
		var mapProps = {
			'color' : ['', '0x'],
			'font' : ['', '"', '"'],
			'size' : null,
			'leading' : null,
			'letterspacing' : null,
			'halign' : ['', '"', '"'],
		};
		
		for(var i in mapProps){
			//trace("textdata["+i+"] : "+textdata[i]);
			if(textdata[i] != undefined){
				
				var tab = mapProps[i];
				var propname = (tab != null && tab.length >= 1 && tab[0] != "") ? propname = tab[0] : i;
				var char1 = (tab != null && tab.length >= 2) ? tab[1] : "";
				var char2 = (tab != null && tab.length >= 3) ? tab[2] : "";
				
				props[propname] = char1 + textdata[i] + char2;
			}
		}
		
		var props_str = propsToString(props, true);
		var data = {"stylename" : stylename, "props" : props_str};
		var str = convertTemplate("generate-script/templates/haxe-style-text.txt", data);
		
		return str;
	}
	
	
	
	function getVarname(str)
	{
		str = str.replace(/-/g, "_");
		//remove all chars not good for variable names
		
		return str;
	}
	
	
	
	function propsToString(props, multiline)
	{
		if(multiline == undefined) multiline = false;
		
		var output = "{";
		if(multiline) output += "\n\t";
		var tab = [];
		for(var i in props){
			var str = '"' + i + '" : ' + props[i];
			
			tab.push(str);
		}
	
		var str;
		if(!multiline) str = ", ";
		else str = ",\n\t";
		output += tab.join(str);
		
		if(multiline) output += ",\n";
		output += "}";
		return output;
	}

	

}


Array.prototype.indexOf = function(value)
{
	var len = this.length;
	for(var i = 0; i< len; i++){
		//trace("this["+i+"] : "+this[i]);
		if(this[i] == value) return i;
	}
	return -1;
}