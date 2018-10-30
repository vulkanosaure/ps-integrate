var TPL_FUNCTIONS = {};





//______________________________________________________________
//OPENFL / STARLING 

TPL_FUNCTIONS["haxe"] = {

	getTextFormatData : function (textdata)
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

	getTextFormatData : function (textdata, config)
	{
		var mletterspacing = 0.00114285 * textdata.size;
		
		var propsModel = {
			// 'color' : {prefix : '#'},
			'font' : {name : 'font-family', quote : 'simple'},
			'size' : {name : 'font-size', sufix : 'px'},
			// 'leading' : {name : 'line-height', sufix : 'px'},
			'letterspacing' : {name : 'letter-spacing', sufix : 'px', multiplier : mletterspacing, round:true},
			// 'halign' : {name : 'text-align', quote : 'none'},
		};
		
		
		
		//______________________________
		//retina handling
		
		var retinaMultiplier = 0.5;
		
		var listPropertyRetina = [
			"size",
		];
		
		var len = listPropertyRetina.length;
		for(var i=0; i<len; i++){
			var prop = listPropertyRetina[i];
			var propkey = prop.replace('-', '_');
			var obj = propsModel[propkey];
			
			if(obj){
				var value = obj.value;
				if(!value || value.indexOf('%') == -1){
					obj.multiplier = retinaMultiplier;
					if(config && config.font_size_multiplier) obj.multiplier *= config.font_size_multiplier;
					obj.round = true;
				}
			}
		};
		
		
		var data = mapProps(propsModel, textdata);
		var str = propsToString(data, {multiline : true, separator : ";", quoteProperty:"none", equal:':'});
		return str;
	},
	
	
	getLayoutData : function (item, prevItem)
	{
		
		var x = item.position[0];
		var y = item.position[1];
		var lx = item[OPT_LAYOUT_X];
		var ly = item[OPT_LAYOUT_Y];
		
		var propsModel = {};
		
		
		//temp
		propsModel["position"] = { value: "absolute", quote: "none" };
		
		if(lx == "left" && x != 0) propsModel["margin_left"] = {name : "left", sufix : "px"};
		else if(lx == "right") propsModel["margin_right"] = {name : "right", sufix : "px"};
		else if(lx == "center"){
			propsModel["position"] = { value: "absolute", quote: "none" };
			propsModel["center_h"] = { name: 'left', sufix: '%', multiplier: 1 };
			propsModel["margin-left"] = { name : "left", value: -Math.round(item.width * item.center_h * 0.01), sufix: 'px'};
		}
		
		if(ly == "top" && y != 0) propsModel["margin_top"] = {name : "top", sufix : "px"};
		else if(ly == "bottom") propsModel["margin_bottom"] = {name : "bottom", sufix : "px"};
		else if(ly == "center"){
			propsModel["position"] = { value: "absolute", quote: "none" };
			propsModel["center_v"] = { name: 'top', sufix: '%', multiplier: 1 };
			propsModel["margin-top"] = { name : "top", value: -Math.round(item.height * item.center_v * 0.01), sufix: 'px'};
		}
		
		
		if(propsModel["position"]) propsModel["position"].comment = true;
		if(propsModel["margin_left"]) propsModel["margin_left"].comment = true;
		if(propsModel["margin_top"]) propsModel["margin_top"].comment = true;
		
		
		//_______________________________
		//margins left (relative)
		
		if(lx == "left" && x != 0){
			if(prevItem){
				var value = x - (prevItem.position[0] + prevItem[OPT_WIDTH]);
				if(value != 0) propsModel["margin_left2"] = { name: 'margin-left', value: value, sufix: 'px', comment:true };
			}
		}
		if(ly == "top" && y != 0){
			if(prevItem){
				var value = y - (prevItem.position[1] + prevItem[OPT_HEIGHT]);
				if(value != 0) propsModel["margin_top2"] = { name: 'margin-top', value: value, sufix: 'px', comment:true };
			}
		}
		
		
		
		
		if(lx != "left") propsModel["width"] = {sufix : "px"};
		if(ly != "top") propsModel["height"] = {sufix : "px"};
		
		if([TYPE_TEXT].indexOf(item.type) != -1){
			propsModel["width"] = {sufix : "px", comment:true};
			propsModel["height"] = {sufix : "px", comment:true};
		}
		
		if(item.has_graphic){
			var path = item.path;
			if(item.path != "") path += "/";
			path += item.filename;
			var path_noext = path;
			path += ".png";
			
			propsModel["background-image"] = {value : path, prefix : "url('/assets/images/", sufix : "')"};
			
			//retina
			var path = '/assets/images/' + path_noext;
			var w = Math.round(item['width'] * 0.5);
			var h = Math.round(item['height'] * 0.5);
			
			
			propsModel["retinaBG"] = {value : "@include retinaBg('"+path+"', "+w+"px, "+h+"px)", raw:true, comment:true};
			
			propsModel["width"] = {sufix : "px", br : false};
			propsModel["height"] = {sufix : "px"};
		
		}
		else if(item.type == TYPE_CONTAINER){
			//ajoute qd mm la width en comment
			propsModel["width"] = {sufix : "px", comment:true};
		}
		
		
		//CONTAINER ROOT => dimensions 100% / 100%
		if(item.parent == null && item.type == TYPE_CONTAINER){
			propsModel["width"] = {value : '100%'};
			propsModel["height"] = {value : '100%'};
		}
		
		
		//______________________________
		//retina handling
		
		var retinaMultiplier = 0.5;
		
		var listPropertyRetina = [
			"width",
			"height",
			"margin-left",
			"margin-right",
			"margin-top",
			"margin-bottom",
			"margin_left2",
			"margin_top2",
		];
		
		var len = listPropertyRetina.length;
		for(var i=0; i<len; i++){
			var prop = listPropertyRetina[i];
			var propkey = prop.replace('-', '_');
			
			if(propsModel[propkey]){
				
				var obj = propsModel[propkey];
				var value = obj.value;
				
				if(!value || typeof value=='number' || value.indexOf('%') == -1){
					obj.multiplier = retinaMultiplier;
					obj.round = true;
				}
			}
		};
		
		
		
		var data = mapProps(propsModel, item);
		
		var str = propsToString(data, {multiline : true, separator : ";", quoteProperty:"none", equal:':'});
		
		return str;
	}

}



