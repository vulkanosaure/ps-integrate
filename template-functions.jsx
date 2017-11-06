var TPL_FUNCTIONS = {};





//______________________________________________________________
//OPENFL / STARLING 

TPL_FUNCTIONS["haxe"] = {

	getTextFormatData : function (textdata, path_tpl)
	{
		var propsModel = {
			'color' : {prefix : '0x'},
			'font' : {quote : 'simple'},
			'size' : {},
			'leading' : {},
			'letterspacing' : {},
			'halign' : {quote : 'double'},
		};
		
		var data = mapProps(propsModel, textdata);
		var str = propsToString(data, {multiline : true, separator : ","});
		return str;
	},
	
	
	getLayoutData : function (item)
	{
		var x = item.position[0];
		var y = item.position[1];
		var lx = item[OPT_LAYOUT_X];
		var ly = item[OPT_LAYOUT_Y];
		
		var layout_data = {};
		
		if(lx == "left" && x != 0) layout_data["margin-left"] = x;
		else if(lx == "right") layout_data["margin-right"] = item.margin_right;
		else if(lx == "center") layout_data["center-h"] = item.center_h / 100;
		
		if(ly == "top" && y != 0) layout_data["margin-top"] = y;
		else if(ly == "bottom") layout_data["margin-bottom"] = item.margin_bottom;
		else if(ly == "center") layout_data["center-v"] = item.center_v / 100;
		
		if(lx !="left") layout_data["width"] = item.width;
		if(ly != "top") layout_data["height"] = item.height;
	
		var layout_data_str = propsToString(layout_data, {multiline : false, separator : ","});
		return layout_data_str;
	}

}









//______________________________________________________________
//HTML 

TPL_FUNCTIONS["html"] = {

	getTextFormatData : function (textdata, path_tpl)
	{
		var propsModel = {
			'color' : {prefix : '#'},
			'font' : {quote : 'simple'},
			'size' : {sufix : 'px'},
			'leading' : {},
			'letterspacing' : {},
			'halign' : {quote : 'double'},
		};
		
		var data = mapProps(propsModel, textdata);
		var str = propsToString(data, {multiline : true, separator : ";", quoteProperty:"none"});
		return str;
	},
	
	
	getLayoutData : function (item)
	{
		var x = item.position[0];
		var y = item.position[1];
		var lx = item[OPT_LAYOUT_X];
		var ly = item[OPT_LAYOUT_Y];
		
		var propsModel = {};
		/*
		if(lx == "left" && x != 0) layout_data["margin-left"] = x;
		else if(lx == "right") layout_data["margin-right"] = item.margin_right;
		else if(lx == "center") layout_data["center-h"] = item.center_h / 100;
		
		if(ly == "top" && y != 0) layout_data["margin-top"] = y;
		else if(ly == "bottom") layout_data["margin-bottom"] = item.margin_bottom;
		else if(ly == "center") layout_data["center-v"] = item.center_v / 100;
		
		if(lx !="left") layout_data["width"] = item.width;
		if(ly != "top") layout_data["height"] = item.height;
		*/
		if(lx == "left" && x != 0) propsModel["margin_left"] = {name : "margin-left", sufix : "px"};
		else if(lx == "right") propsModel["margin_right"] = {name : "margin-right", sufix : "px"};
		else if(lx == "center") propsModel["center_h"] = {};
		
		if(ly == "top" && x != 0) propsModel["margin_top"] = {name : "margin-top", sufix : "px"};
		else if(ly == "bottom") propsModel["margin_bottom"] = {name : "margin-bottom", sufix : "px"};
		else if(ly == "center") propsModel["center_v"] = {};
		
		if(lx !="left") propsModel["width"] = {sufix : "px"};
		if(ly != "top") propsModel["height"] = {sufix : "px"};
		
		var data = mapProps(propsModel, item);
		
		var str = propsToString(data, {multiline : true, separator : ";", quoteProperty:"none"});
		return str;
	}

}



