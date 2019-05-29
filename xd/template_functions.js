var TPL_FUNCTIONS = {};

var imp = {};
imp = {...imp, ...require('./constantes.js')};
imp = {...imp, ...require('./template_utils.js')};
const file_debug = require('./debug.js');
var trace = file_debug.trace;





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
		};
		
		if(textdata.bold) propsModel['bold'] = { name:'font-weight', value:'bold'};
		if(textdata.italic) propsModel['italic'] = { name:'font-style', value:'italic'};
		
		
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
	
	
	
	
	
	
	getLayoutData : function (item, parent, prevItem, isLayerOfType, config, configLayout)
	{
		trace('item.position : '+item.position);
		
		var x = item.position[0];
		var y = item.position[1];
		var lx = item[imp.OPT_LAYOUT_X];
		var ly = item[imp.OPT_LAYOUT_Y];
		
		var propsModel = {};
		var name = item[imp.OPT_NAME];
		
		if(item[imp.OPT_DIRECTION] == 'row' || item[imp.OPT_ALIGN_ITEMS]){
			
			var valuedir = item[imp.OPT_DIRECTION] == 'row' ? 'row' : 'column';
			item.isFlex = true;
			
			propsModel["display"] = { value: "flex", quote: "none" };
			propsModel["direction"] = { name: "flex-direction", value: valuedir, quote: "none" };
			propsModel["align_items"] = { name: 'align-items', value: item[imp.OPT_ALIGN_ITEMS], quote: "none" };
			
		}
		
		if(item.setFlex){
			propsModel["display"] = { value: "flex", quote: "none" };
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
			
			
			
		}
		
		//_______________________________
		//position static
		
		else if(item[imp.OPT_POSITION] == "static"){
			
			if(item.positionRelative){
				propsModel["position"] = { value: "relative", quote: "none" };
			}
			
			var direction = parent ? parent[imp.OPT_DIRECTION] : 'col';
			
			if(direction == "row"){
				
				//relative to prev child
				var prevPosition = isLayerOfType ? isLayerOfType.position[0] : 0;
				var prevDim = isLayerOfType ? isLayerOfType[imp.OPT_WIDTH] : 0;
				var value = x - (prevPosition + prevDim);
				var value2 = y;
				
				
				if(lx == "center"){
					// propsModel["margin_global"] = { name: 'margin', value: value, prefix:'auto 0 auto ', sufix:'px' };
					
					//ce scenario n'a aucun sens
					throw new Error('ce scenario n\'a aucun sens');
					
					propsModel["margin_top2"] = { name: 'margin-top', value: value, sufix: 'px' };
					propsModel["margin_left2"] = { name: 'margin-left', value: 'auto' };
					propsModel["margin_right2"] = { name: 'margin-right', value: 'auto' };
					
				}
				else{
					
					if(value != 0) propsModel["margin_left2"] = { name: 'margin-left', value: value, sufix: 'px' };
					
					//define other one as abs (unless cross axis alignement set)
					let parentCrossAlign = (parent && parent[imp.OPT_ALIGN_ITEMS]);
					if(!parentCrossAlign && value2 != 0){
						propsModel["margin_top2"] = { name: 'margin-top', value: value2, sufix: 'px' };
					}
					
				}
				
				
				if(ly == "center"){
					propsModel["margin_top2"] = { name: 'margin-top', value: 'auto' };
					propsModel["margin_bottom2"] = { name: 'margin-bottom', value: 'auto' };
				}
				
			}
			else if(direction == "col"){
				
				//define other one as abs
				var value2 = x;
				
				//relative to prev child
				var prevPosition = isLayerOfType ? isLayerOfType.position[1] : 0;
				var prevDim = isLayerOfType ? isLayerOfType[imp.OPT_HEIGHT] : 0;
				var value = y - (prevPosition + prevDim);
				
				
				
				if(lx == "center"){
					// propsModel["margin_global"] = { name: 'margin', value: value, sufix:'px auto 0 auto' };
					
					propsModel["margin_top2"] = { name: 'margin-top', value: value, sufix: 'px' };
					propsModel["margin_left2"] = { name: 'margin-left', value: 'auto' };
					propsModel["margin_right2"] = { name: 'margin-right', value: 'auto' };
					
				}
				else{
					
					var alignParent = (parent && parent[imp.OPT_ALIGN_ITEMS]);
					
					if(parent){
						if(value2 != 0 && !alignParent) propsModel["margin_left2"] = { name: 'margin-left', value: value2, sufix: 'px' };
						if(value != 0) propsModel["margin_top2"] = { name: 'margin-top', value: value, sufix: 'px' };
					}
				}
				
				
				
				if(ly == "center"){
					propsModel["margin_top2"] = { name: 'margin-top', value: 'auto' };
					propsModel["margin_bottom2"] = { name: 'margin-bottom', value: 'auto' };
					//todo : parent flex
					
				}
				
			}
			
			
			
			
			
			
			//substract padding to margin
			if(parent){
				if(!isLayerOfType || direction == "col"){		//is first static item
					if(parent["p_left"] > 0){
						if(propsModel["margin_left2"] && propsModel["margin_left2"].value != 'auto'){
							propsModel["margin_left2"].value -= parent["p_left"];
						}
					}
				}
				
				if(!isLayerOfType || direction == "row"){		//is first static item
					if(parent["p_top"] > 0){
						if(propsModel["margin_top2"] && propsModel["margin_top2"].value != 'auto'){
							propsModel["margin_top2"].value -= parent["p_top"];
						}
					}
				}
				
			}
			
			
			
			//PROBABLY USELESS NOW (tocheck)
			
			//collapsed margin 
			//(top only, voir si left necessary)
			/* 
			if(propsModel["margin_top2"] && propsModel["margin_top2"].value != 0){
				if(parent && parent[imp.OPT_POSITION]=="static" && item[imp.OPT_POSITION]=="static"){
					if(!isLayerOfType){		//is first static item
						if(!parent.shapedata || !parent.shapedata.borderWidth){
							
							var marginValue = propsModel["margin_top2"].value;
							delete propsModel["margin_top2"];
							propsModel["padding_top"] = { name: 'padding-top', value: marginValue, sufix: 'px' };
						}
					}
				}
			}
			*/
			
			
			
			
		}
		else throw new Error('unknown position '+item[imp.OPT_POSITION]);
		
		
		
		
		
		//paddings
		if(item["p_left"] > 0) propsModel["p_left"] = { name: 'padding-left', sufix: 'px' };
		if(item["p_top"] > 0) propsModel["p_top"] = { name: 'padding-top', sufix: 'px' };
		if(item["p_right"] > 0){
			
			//if more padding right than left, 
			//we consider it's because the content doesn't fill up the line
			let value = item["p_right"];
			if(value > item["p_left"]) value = item["p_left"];
			propsModel["p_right"] = { name: 'padding-right', value: value, sufix: 'px' };
		}
		
		if(item["p_bottom"] > 0) propsModel["p_bottom"] = { name: 'padding-bottom', sufix: 'px' };
		
		
		
		
		
		
		if(lx != "left") propsModel["width"] = {sufix : "px"};
		if(ly != "top") propsModel["height"] = {sufix : "px"};
		
		if([imp.TYPE_TEXT].indexOf(item.type) != -1){
			
			let tdata = item.textdata;
			
			propsModel["width"] = {sufix : "px", comment:true};
			// propsModel["height"] = {sufix : "px", comment:true};
			
			propsModel["halign"] = {name : 'text-align', value : tdata.halign, quote : 'none'};
			
			
			
			
			if(lx == 'center'){
				delete propsModel["margin_left2"];
				delete propsModel["margin_right2"];
			}
			if(ly == 'center'){
				let value = parent[imp.OPT_HEIGHT] + "px";
				propsModel["lineHeight"] = {name : 'line-height', value : value, quote : 'none'};
				delete propsModel["margin_top2"];
				delete propsModel["margin_bottom2"];
				delete propsModel["padding_top"];
				delete propsModel["padding_bottom"];
			}
			
			// trace('tdata.color : '+tdata.color);
			let colorValue = imp.getColorProperty(tdata.color, config.sass_variable.colors);
			propsModel["color"] = {name : 'color', value : colorValue, quote : 'none'};
			
			
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
		
		//no else, can be cumulative
		if(item.shapedata){
			
			let s = item.shapedata;
			let isContainer = (imp.CONTAINERS_TYPE.indexOf(item.type) != -1);
			
			propsModel["width"] = {sufix : "px", br: false};
			if(!isContainer) propsModel["height"] = {sufix : "px"};
			
			
			if(s.bgColor){
				let value = imp.getColorProperty(s.bgColor, config.sass_variable.colors);
				propsModel["bgColor"] = {name : "background-color", value: value};
			}
			else if(s.bgGradient){
				//linear-gradient(to left, $color-purple, $color-purple-gradient);
				
				let value = getGradientColorStr(s.bgGradient, config.sass_variable.colors);
				propsModel["bgGradient"] = {name : "background", value: value};
				//default => to bottom
				
			}
			
			
			if(s.borderWidth){	
				let borderValue = s.borderWidth + 'px solid '+imp.getColorProperty(s.borderColor, config.sass_variable.colors);
				propsModel["border"] = {name : "border", value:borderValue};
			}
			if(s.radius_topLeft) propsModel["radius_topLeft"] = {name : "border-top-left-radius", value:s.radius_topLeft, sufix:"px"};
			if(s.radius_topRight) propsModel["radius_topRight"] = {name : "border-top-right-radius", value:s.radius_topRight, sufix:"px"};
			if(s.radius_bottomRight) propsModel["radius_bottomRight"] = {name : "border-bottom-right-radius", value:s.radius_bottomRight, sufix:"px"};
			if(s.radius_bottomLeft) propsModel["radius_bottomLeft"] = {name : "border-bottom-left-radius", value:s.radius_bottomLeft, sufix:"px"};
			
			if(s.radius) propsModel["radius"] = {name : "border-radius", value:s.radius, sufix:"px"};
			
		}
		
		if(item.pathdata){
			let value = imp.getColorProperty(item.pathdata.bgColor, config.sass_variable.colors);
			propsModel["bgColor"] = {name : "fill", value: value};
		}
		
		if(item.shadow){
			
			let s = item.shadow;
			let c  = s.color;
			
			let isBox = item[imp.OPT_TYPE] != imp.TYPE_TEXT;
			
			let tab = [];
			tab.push(s.x + 'px');
			tab.push(s.y + 'px');
			tab.push(s.blur + 'px');
			if(isBox) tab.push('0px');
			tab.push(c.rgba);
			let value = tab.join(' ');
			
			let propname = isBox ? 'box-shadow' : 'text-shadow';
			propsModel['shadow'] = {name: propname, value: value};
		}
		
		
		if(parent && parent.isFlex){
			
			var testdim = parent[imp.OPT_DIRECTION] == 'row' ? 'width' : 'height';
			if(propsModel[testdim] && !propsModel[testdim].comment){
				let value = '0 0 auto';
				propsModel['flex_shorhand'] = {name: "flex", value: value};
			}
			
		}
		
		if(false && parent && parent.name == "divcentery"){
			
			for(var i in propsModel){
				let obj = propsModel[i];
				trace(' - '+i+' : '+obj.value);
				for(var k in obj){
					trace('**** --- '+k+' : '+obj[k]);
				}
				trace('ùùùù -- '+item[i]);
			}
			
			throw new Error('debug');
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
		
		
		
		
		//delete useless margin_padding
		let propsClean = ['margin_left2', 'margin_top2', 'margin_bottom2', 'margin_right2']
		for(var k in propsClean){
			let prop = propsClean[k];
			if(propsModel[prop] && propsModel[prop].value == 0){
				delete propsModel[prop];
			}
		}
		
		
		
		var data = imp.mapProps(propsModel, item);
		
		
		data = imp.transformMargins(data, 'margin');
		data = imp.transformMargins(data, 'padding');
		
		
		
		
		var closeTag = !configLayout.file.sass_indent;
		var str = imp.propsToString(data, {multiline : true, separator : ";", quoteProperty:"none", equal:':'}, closeTag);
		
		
		return str;
	}

}


function getGradientColorStr(obj, colors)
{
	let output = '';
	let dir = "to " + obj.dir;
	let col1 = "";
	let col2 = "";
	let tab = [];
	tab.push(dir);
	let nbColor = obj.colorStops.length;
	
	for(var i in obj.colorStops){
		let item = obj.colorStops[i];
		let col = imp.getColorProperty(item.color, colors);
		
		if(nbColor > 2){
			col += ' ';
			col += Math.round(item.stop * 100) + '%';
		}
		tab.push(col);
	}
	
	output = "linear-gradient(" + tab.join(', ') + ")";
	
	return output;
}




function recTransformLvl(items, parent, root)
{
	var len = items.length;
	for(var i=len - 1; i>=0; i--){
		
		var item = items[i];
		
		if(item.hasOwnProperty(imp.OPT_LVL)){
			
			var lvl = item[imp.OPT_LVL];
			recTransformLvl_push(root, lvl, item);
			items.splice(i, 1);
		}
		
		var iscontainer = imp.CONTAINERS_TYPE.indexOf(item.type) != -1;
		if(iscontainer){
			recTransformLvl(item.childrens, item, root);
		}
		
	}
}

function cloneTree(items)
{
	
}



function recTransformLvl_push(root, lvl, item)
{
	//todo : if lvl=name
	if(['0', '1', '2'].indexOf(lvl) > -1){
		
		lvl = +lvl;
		var tab = root;
		for(var i=0; i<lvl; i++) {
			tab = tab[0].childrens;
		}
		tab.push(item);
	}
	
}








module.exports = {
	TPL_FUNCTIONS,
	recTransformLvl,
};
