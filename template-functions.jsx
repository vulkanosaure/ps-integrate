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
			'font' : {name : 'font-family', quote : 'simple'},
			'size' : {name : 'font-size', sufix : 'px'},
			'leading' : {name : 'line-height', sufix : 'px'},
			'letterspacing' : {name : 'letter-spacing', sufix : 'px'},
			'halign' : {name : 'text-align', quote : 'none'},
		};
		
		var data = mapProps(propsModel, textdata);
		var str = propsToString(data, {multiline : true, separator : ";", quoteProperty:"none", equal:':'});
		return str;
	},
	
	
	getLayoutData : function (item)
	{
		var base_folder_img = "images";
		
		var x = item.position[0];
		var y = item.position[1];
		var lx = item[OPT_LAYOUT_X];
		var ly = item[OPT_LAYOUT_Y];
		
		var propsModel = {};
		
		//temp
		propsModel["position"] = { value: "absolute", quote: "none" };
		
		if(lx == "left" && x != 0) propsModel["margin_left"] = {name : "margin-left", sufix : "px"};
		else if(lx == "right") propsModel["margin_right"] = {name : "margin-right", sufix : "px"};
		else if(lx == "center"){
			propsModel["position"] = { value: "absolute", quote: "none" };
			propsModel["center_h"] = { name: 'left', sufix: '%', multiplier: 1 };
			propsModel["margin-left"] = { value: -Math.round(item.width * item.center_h * 0.01), sufix: 'px' };
		}
		
		if(ly == "top" && y != 0) propsModel["margin_top"] = {name : "margin-top", sufix : "px"};
		else if(ly == "bottom") propsModel["margin_bottom"] = {name : "margin-bottom", sufix : "px"};
		else if(ly == "center"){
			propsModel["position"] = { value: "absolute", quote: "none" };
			propsModel["center_v"] = { name: 'top', sufix: '%', multiplier: 1 };
			propsModel["margin-top"] = { value: -Math.round(item.height * item.center_v * 0.01), sufix: 'px' };
		}
		
		if(lx != "left") propsModel["width"] = {sufix : "px"};
		if(ly != "top") propsModel["height"] = {sufix : "px"};
		
		if(item.type == TYPE_GFX || item.type == TYPE_BTN || item.type == TYPE_BTNC){
			var path = base_folder_img + "/" + item.path;
			if(item.path != "") path += "/";
			path += item.filename;
			path += ".png";
			propsModel["background-image"] = {value : path, prefix : "url('/", sufix : "')"};
			
			propsModel["width"] = {sufix : "px"};
			propsModel["height"] = {sufix : "px"};
		
		}
		
		
		var data = mapProps(propsModel, item);
		
		var str = propsToString(data, {multiline : true, separator : ";", quoteProperty:"none", equal:':'});
		return str;
	}

}



