var TPL_FUNCTIONS = {};

var imp = {};
imp = {...imp, ...require('./constantes.js')};
imp = {...imp, ...require('./template_utils.js')};






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
		
		if(config.retina){
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
		}
		
		
		
		var data = imp.mapProps(propsModel, textdata);
		var str = imp.propsToString(data, {multiline : true, separator : ";", quoteProperty:"none", equal:':'});
		return str;
	},
	
	
	getLayoutData : function (item, parent, prevItem, prevStaticItem, config)
	{
		
		var x = item.position[0];
		var y = item.position[1];
		var lx = item[imp.OPT_LAYOUT_X];
		var ly = item[imp.OPT_LAYOUT_Y];
		
		var propsModel = {};
		var name = item[imp.OPT_NAME];
		
		if(item[imp.OPT_DIRECTION] == 'row' || item[imp.OPT_ALIGN_ITEMS]){
			
			var valuedir = item[imp.OPT_DIRECTION] == 'row' ? 'row' : 'column';
			
			propsModel["display"] = { value: "flex", quote: "none" };
			propsModel["direction"] = { name: "flex-direction", value: valuedir, quote: "none" };
			propsModel["align_items"] = { name: 'align-items', value: item[imp.OPT_ALIGN_ITEMS], quote: "none" };
			
		}
		
		
		//____________________________________________________________
		//position absolute
		
		if(item[imp.OPT_POSITION] == "absolute"){
		
			propsModel["position"] = { value: "absolute", quote: "none" };
			
			if(lx == "left") propsModel["margin_left"] = {name : "left", sufix : "px", br : false};
			else if(lx == "right") propsModel["margin_right"] = {name : "right", sufix : "px", br : false};
			
			
			//transform: translateX(-50%);
			
			if(ly == "top") propsModel["margin_top"] = {name : "top", sufix : "px"};
			else if(ly == "bottom") propsModel["margin_bottom"] = {name : "bottom", sufix : "px"};
			
			
			if(lx == "center" && ly=="center"){
				propsModel["margin_left_p"] = {name : "left", sufix : "%", value:50, br : false};
				propsModel["margin_top_p"] = {name : "top", sufix : "%", value:50, br : false};
				propsModel["translate"] = {name : "transform", sufix : "", value:'translate(-50%, -50%)', br : true};
			}
			else if(lx=="center"){
				propsModel["margin_left_p"] = {name : "left", sufix : "%", value:50, br : false};
				propsModel["translate"] = {name : "transform", sufix : "", value:'translateX(-50%)', br : true};
			}
			else if(ly=="center"){
				propsModel["margin_top_p"] = {name : "top", sufix : "%", value:50, br : false};
				propsModel["translate"] = {name : "transform", sufix : "", value:'translateY(-50%)', br : true};
			}
			
			
			/* 
			if(propsModel["position"]) propsModel["position"].comment = true;
			if(propsModel["margin_left"]) propsModel["margin_left"].comment = true;
			if(propsModel["margin_top"]) propsModel["margin_top"].comment = true;
			 */
		}
		
		//_______________________________
		//margins left (relative)
		
		else{
			
			var direction = parent ? parent[imp.OPT_DIRECTION] : 'col';
			
			if(direction == "row"){
				
				//relative to prev child
				var prevPosition = prevStaticItem ? prevStaticItem.position[0] : 0;
				var prevDim = prevStaticItem ? prevStaticItem[imp.OPT_WIDTH] : 0;
				var value = x - (prevPosition + prevDim);
				var value2 = y;
				
				if(lx == "center"){
					propsModel["margin_global"] = { name: 'margin', value: value, prefix:'auto 0 auto ', sufix:'px' };
				}
				else{
					if(value != 0) propsModel["margin_left2"] = { name: 'margin-left', value: value, sufix: 'px' };
					//define other one as abs
					if(value2 != 0) propsModel["margin_top2"] = { name: 'margin-top', value: value2, sufix: 'px' };
				}
				
			}
			else if(direction == "col"){
				
				//define other one as abs
				var value2 = x;
				
				//relative to prev child
				var prevPosition = prevStaticItem ? prevStaticItem.position[1] : 0;
				var prevDim = prevStaticItem ? prevStaticItem[imp.OPT_HEIGHT] : 0;
				var value = y - (prevPosition + prevDim);
				
				if(lx == "center"){
					propsModel["margin_global"] = { name: 'margin', value: value, sufix:'px auto 0 auto' };
				}
				else{
					
					var alignParent = (parent && parent[imp.OPT_ALIGN_ITEMS]);
					if(value2 != 0 && !alignParent) propsModel["margin_left2"] = { name: 'margin-left', value: value2, sufix: 'px' };
					if(value != 0) propsModel["margin_top2"] = { name: 'margin-top', value: value, sufix: 'px' };
				}
				
			}
		}
		
		
		
		if(lx != "left") propsModel["width"] = {sufix : "px"};
		if(ly != "top") propsModel["height"] = {sufix : "px"};
		
		if([imp.TYPE_TEXT].indexOf(item.type) != -1){
			propsModel["width"] = {sufix : "px", comment:true};
			propsModel["height"] = {sufix : "px", comment:true};
		}
		
		if(item.has_graphic){
			
			propsModel["width"] = {sufix : "px", br : false};
			propsModel["height"] = {sufix : "px"};
			
			var path = item.path;
			if(item.path != "") path += "/";
			path += item.filename;
			var path_noext = path;
			
			if(!item[imp.OPT_IMGTYPE]) item[imp.OPT_IMGTYPE] = 'png';
			var ext = item[imp.OPT_IMGTYPE];
			path += "." + ext;
			
			propsModel["background-image"] = {
				value : path, prefix : "url('" + config.prefix_images, sufix : "')"
			};
			
			
			//retina
			if(config.retina){
				var path = config.prefix_images + path_noext;
				var w = Math.round(item['width'] * 0.5);
				var h = Math.round(item['height'] * 0.5);
				
				propsModel["retinaBG"] = {value : "@include retinaBg('"+path+"', "+w+"px, "+h+"px)", raw:true, comment:true};
			}
			
		}
		else if(item.type == imp.TYPE_CONTAINER){
			//ajoute qd mm la width en comment
			propsModel["width"] = {sufix : "px", comment:true};
		}
		
		
		
		
		//______________________________
		//retina handling
		
		if(config.retina){
			
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
				"margin_global",
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
		}
		
		
		
		var data = imp.mapProps(propsModel, item);
		
		var str = imp.propsToString(data, {multiline : true, separator : ";", quoteProperty:"none", equal:':'});
		
		return str;
	}

}



module.exports = {
	TPL_FUNCTIONS,
};
