generate_template = function(indextpl, items)
{
	trace("generate_template ("+indextpl+")");
	
	var output = [];
	
	var listStylesTextID = new Array();
	var listStylesText = new Array();
	
	var styleTextFile = "StylesText";
	
	tpl_reset();
	
	
	rec(items, null, 0);
	
	output.push({filename : "template.hx",  content : get_tpl_content()});
	
	
	//styles fonts
	
	tpl_reset();
	
	var len = listStylesText .length;
	for(var i = 0; i < len; i++){
			
		var textdata = listStylesText [i];
		var str = getStyleTextCode(textdata);
		tpl_add_block(str, 0);
		
	}
	output.push({filename : styleTextFile + ".hx",  content : get_tpl_content()});
	
	
	return output;
	
	
	
	function rec(items, parent, level)
	{
		var len = items.length;
		for(var i=0; i<len; i++){
			
			var item = items[i];
			
			var parentname = (parent != null) ? parent.name : "";
			tracerec("item : "+item.name+", parentname : "+parentname, level);
			
			
			//separator
			if(level == 0){
				tpl_add_line("//______________________________________________");
				tpl_add_line("//"+item.name);
				tpl_br(3);
			}
			
			//instanciation / integration code
			var itemCode = getItemCode(item, parent);
			tpl_add_block(itemCode, 0);
			
			tpl_br(2);
			
			if(item.type == TYPE_TEXT){
				
				var idstyletext = getIDstyletext(item.textdata);
				
				//trace("listStylesTextID : "+typeof listStylesTextID);
				
				if(listStylesTextID.indexOf(idstyletext) == -1){
					listStylesTextID.push(idstyletext);
					listStylesText.push(item.textdata);
				}
			}
			
			if(CONTAINERS_TYPE.indexOf(item.type) != -1){

				rec(item.childrens, item, level + 1);
			}
			
			if(i == len - 1) tpl_br(2);
			if(level == 0) tpl_br(5);
			
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
			
			data = {"var" : varname, "text" : item.textdata.text};
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
		output = getVarname(output);
		return output;
	}


	function getStyleTextCode(textdata)
	{
		var stylename = getStyleTextID(textdata);
		var props = {};
		var ignoreprops = ["text"];
		for(var i in textdata){
			if(ignoreprops .indexOf(i) == -1) props[i] = textdata[i];
		}
		
		props["color"] = "0x" + props["color"];
		props["font"] = '"' + props["font"] + '"';
		//props["uppercase"] = '"' + props["text"] + '"';
		
		var props_str = propsToString(props, true);
		
		var data = {"stylename" : stylename, "props" : props_str};
		var str = convertTemplate("generate-script/templates/haxe-style-text.txt", data);
		/*
		var str = _styletextTpl;
		str = str.replace(/{{stylename}}/g, stylename);
		str = str.replace(/{{props}}/g, props_str);
		*/
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

	function getIDstyletext(textdata)
	{
		var output = "";
		output += textdata.color + "";
		output += textdata.font + "";
		output += textdata.size + "";
		output += textdata.text + "";
		output += textdata.capitalization + "";
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