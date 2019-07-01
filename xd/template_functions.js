var imp = {};
imp = {...imp, ...require('./constantes.js')};
imp = {...imp, ...require('./template_utils.js')};
imp = {...imp, ...require('./platform/debug.js')};

var trace = imp.trace;

//___________________________________________________________________


var TPL_FUNCTIONS = {};

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
	
	
	
	
	
	
	getLayoutData : function (item, parent, prevItem, prevStaticItem, nextStaticItem, config, configLayout)
	{
		// trace('item.position : '+item.position);
		
		var x = item.position[0];
		var y = item.position[1];
		var lx = item[imp.OPT_LAYOUT_X];
		var ly = item[imp.OPT_LAYOUT_Y];
		var cx = item[imp.OPT_CHILDREN_X];
		var cy = item[imp.OPT_CHILDREN_Y];
		var parentcx = parent ? parent[imp.OPT_CHILDREN_X] : null;
		var parentcy = parent ? parent[imp.OPT_CHILDREN_Y] : null;
		
		var isText = ([imp.TYPE_TEXT].indexOf(item.type) != -1);
		
		var propsModel = {};
		var name = item[imp.OPT_NAME];
		var valuedir = item[imp.OPT_DIRECTION] == 'row' ? 'row' : 'column';
		
		if(valuedir == 'row' || cx || cy){
			
			item.display = 'flex';
		}
		
		
		if(item.display == 'flex'){
			
			propsModel["display"] = { value: "flex", quote: "none" };
			
			//todo : use 1 line shortcut
			propsModel["direction"] = { name: "flex-direction", value: valuedir, quote: "none" };
			
			
			if(cx){
				var valuecx = imp.getFlexAlignValue(cx);
				if(!valuecx) throw new Error('wrong value '+cx);
				var prop = valuedir == 'column' ? 'align-items' : 'justify-content';
				propsModel["childrenx"] = { name: prop, value: valuecx, quote: "none" };
			}
			if(cy){
				var valuecy = imp.getFlexAlignValue(cy);
				if(!valuecy) throw new Error('wrong value '+cy);
				var prop = valuedir == 'row' ? 'align-items' : 'justify-content';
				propsModel["childreny"] = { name: prop, value: valuecy, quote: "none" };
			}
			
			
			
			if(item[imp.OPT_POSITION] != "absolute" && parent && parent.display != 'flex'){
				if(lx != 'left'){
					//if text : text align
					if(isText){
						// item.halignLayout = lx;
					}
					else{
						var valuecx = imp.getFlexAlignValue(lx);
						if(!valuecx) throw new Error('wrong value '+lx);
						var prop = valuedir == 'column' ? 'align-items' : 'justify-content';
						propsModel["layoutx"] = { name: prop, value: valuecx, quote: "none" };
					}
					
				}
				if(ly != 'top'){
					var valuecy = imp.getFlexAlignValue(ly);
					if(!valuecy) throw new Error('wrong value '+ly);
					var prop = valuedir == 'row' ? 'align-items' : 'justify-content';
					propsModel["layouty"] = { name: prop, value: valuecy, quote: "none" };
				}
			}
		}
		//no flex
		else{
			if(item[imp.OPT_POSITION] != "absolute" && parent && parent.display != 'flex'){
				if(lx != 'left'){
					trace('text align for layout '+lx);
					item.halignLayout = lx;
				}
			}
		}
		
		
		
		//CANCEL PADDINGS
		
		
		//if all children (static, !bgparent) are centerx : pas de padding x
		
		if(item.allCenterX){
			item["p_left"] = 0; item["p_right"] = 0;
		}
		if(item.allCenterY){	
			item["p_top"] = 0; item["p_bottom"] = 0;
			item[imp.OPT_HEIGHT] = 'px';
		}
		//if only 1 child
		if(item.childrens && item.childrens.length == 1){
			item["p_left"] = 0; item["p_right"] = 0
			item["p_top"] = 0; item["p_bottom"] = 0;
			item[imp.OPT_HEIGHT] = 'px';
		}
		
		//not if childrenx
		if(cx){
			item["p_left"] = 0; item["p_right"] = 0;
		}
		//not if childreny
		if(cy){
			item["p_top"] = 0; item["p_bottom"] = 0;
			item[imp.OPT_HEIGHT] = 'px';
		}
		
		if(valuedir == 'row'){
			item["p_left"] = 0; item["p_right"] = 0;
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
				propsModel["position"] = { value: "relative", quote: "none", filter: "render" };
			}
			
			var direction = parent ? parent[imp.OPT_DIRECTION] : 'col';
			
			
			//_________________________
			if(direction == "row"){
				
				var prevPosition = prevStaticItem ? prevStaticItem.position[0] : 0;
				var prevDim = prevStaticItem ? prevStaticItem.widthPx : 0;
				var valuex = x - (prevPosition + prevDim);
				var valuey = y;
				if(parent){
					var nextPosition = nextStaticItem ? nextStaticItem.position[0] : parent.widthPx;
					var valuex2 = nextPosition - (x + item.widthPx);
					var valuey2 = parent.heightPx - (y + item.heightPx);
				}
			}
			else if(direction == "col"){
				
				var prevPosition = prevStaticItem ? prevStaticItem.position[1] : 0;
				var prevDim = prevStaticItem ? prevStaticItem.heightPx : 0;
				var valuex = x;
				var valuey = y - (prevPosition + prevDim);
				if(parent){
					var nextPosition = nextStaticItem ? nextStaticItem.position[1] : parent.heightPx;
					var valuex2 = parent.widthPx - (x + item.widthPx);
					var valuey2 = nextPosition - (y + item.heightPx);
				}
			}
			
			
			
			var firstX = direction == 'col' || !prevStaticItem;
			var firstY = direction == 'row' || !prevStaticItem;
			
			if(parent){
				//si parent align en x, et first child child
				var pcx = parent[imp.OPT_CHILDREN_X] || 'left';
				if(pcx != 'left' && firstX) valuex = 0;
				
				var pcy = parent[imp.OPT_CHILDREN_Y] || 'top';
				if(pcy != 'top' && firstY) valuey = 0;
			}
			
			
			var top = ly != 'top' ? 'auto' : valuey;
			var left = lx != 'left' ? 'auto' : valuex;
			
			var bottom;
			if(ly == 'center') bottom = 'auto';
			else if(ly == 'bottom' || parentcy == 'bottom') bottom = valuey2; 
			
			var right;
			if(lx == 'center') right = 'auto';
			else if(lx == 'right' || parentcx == 'right') right = valuex2; 
			
			
			
			if(isText){
				if(lx != 'left'){
					item.halignLayout = lx;
					left = null; 
					if(right == 'auto') right = null;
				}
				if(ly == 'center'){
					var v = parent.heightPx;
					propsModel["lineHeight"] = {name : 'line-height', value : v, sufix : 'px', quote : 'none'};
					top = null; bottom = null;
				}
			}
			
			
			//todo later 
			//if item no width and lx != left
			//item.display = inline-block
			//parent.text-align = 'center'
			//a faire dans recursive loop
			
			
			//root element, remove margin (except auto)
			if(!parent){
				top = null;
				if(left != 'auto') left = null;
			}
			
			
			
			
			
			
			//substract padding parent to margin item
			if(parent){
				if(!prevStaticItem || direction == "col"){		//is first static item
					if(parent["p_left"] > 0){
						if(left && left != 'auto') left -= parent["p_left"];
					}
				}
				
				if(!prevStaticItem || direction == "row"){		//is first static item
					if(parent["p_top"] > 0){
						if(top && top != 'auto') top -= parent["p_top"];
					}
				}
			}
			
			
			
			// collapsed margin
			
			if(top && top != 0 && top != 'auto'){
				if(parent && parent.display != 'flex' && parent[imp.OPT_POSITION]=="static" && item[imp.OPT_POSITION]=="static"){
					if(!prevStaticItem){		//is first static item
						if(!parent.shapedata || !parent.shapedata.borderWidth){
							item["p_top"] = top;
							top = null;
						}
					}
				}
			}
			
			
			imp.setMarginValue(propsModel, 'margin_top2', 'margin-top', top);
			imp.setMarginValue(propsModel, 'margin_left2', 'margin-left', left);
			imp.setMarginValue(propsModel, 'margin_right2', 'margin-right', right);
			imp.setMarginValue(propsModel, 'margin_bottom2', 'margin-bottom', bottom);
			
			
			
		}
		else throw new Error('unknown position '+item[imp.OPT_POSITION]);
		
		
		
		
		
		//WRITE PADDINGS
		
		if(item["p_left"] > 0) propsModel["p_left"] = { name: 'padding-left', sufix: 'px' };
		if(item["p_top"] > 0) propsModel["p_top"] = { name: 'padding-top', sufix: 'px' };
		if(item["p_right"] > 0){
			//if more padding right than left, equalize
			var value = item["p_left"];
			propsModel["p_right"] = { name: 'padding-right', value: value, sufix: 'px' };
		}
		
		if(item["p_bottom"] > 0) propsModel["p_bottom"] = { name: 'padding-bottom', sufix: 'px' };
		
		
		
		
		
		/* 
		if(lx != "left") item[imp.OPT_WIDTH] = 'px';
		if(ly != "top") item[imp.OPT_HEIGHT] = 'px';
		*/
		
		if(isText){
			
			var tdata = item.textdata;
			
			if(item[imp.OPT_WIDTH]){
				var halign = tdata.halign;
				propsModel["halign"] = {name : 'text-align', value : halign, quote : 'none'};
			}
			
			var colorValue = imp.getColorProperty(tdata.color, config.sass_variable.colors);
			propsModel["color"] = {name : 'color', value : colorValue, quote : 'none'};
			
		}
		
		if(item.halignLayout){
			propsModel["halign"] = {name : 'text-align', value : item.halignLayout, quote : 'none'};
		}
		
		
		if(item.has_graphic){
			
			if(item.tag != 'img'){
				
				item[imp.OPT_WIDTH] = 'px';
				item[imp.OPT_HEIGHT] = 'px';
				
				propsModel["background-image"] = {
					value : config.prefix_images + item.fullpath, prefix : "url('", sufix : "')"
				};
			}
			
			//retina
			if(config.retina){
				var w = Math.round(item.widthPx * 0.5);
				var h = Math.round(item.heightPx * 0.5);
				
				propsModel["retinaBG"] = {
					value : "@include retinaBg('"+config.prefix_images + item.fullpath_noext+"', "+w+"px, "+h+"px)", raw:true, comment:true
				};
			}
			
		}
		
		
		//no else, can be cumulative
		if(item.shapedata){
			
			var s = item.shapedata;
			var isContainer = (imp.CONTAINERS_TYPE.indexOf(item.type) != -1);
			
			//if type img : can have shapedata too
			if(item[imp.OPT_TAG] != 'img'){
				item[imp.OPT_WIDTH] = 'px';
				if(!isContainer || item[imp.OPT_DIRECTION] == 'row') item[imp.OPT_HEIGHT] = 'px';
			}
			
			//temp
			// if(imp.DEBUG_MODE) item[imp.OPT_HEIGHT] = 'px';
			
			
			if(s.bgColor){
				var value = imp.getColorProperty(s.bgColor, config.sass_variable.colors);
				propsModel["bgColor"] = {name : "background-color", value: value};
			}
			else if(s.bgGradient){
				//linear-gradient(to left, $color-purple, $color-purple-gradient);
				
				var value = getGradientColorStr(s.bgGradient, config.sass_variable.colors);
				propsModel["bgGradient"] = {name : "background", value: value};
				//default : to bottom
				
			}
			
			
			if(s.borderWidth){	
				var borderValue = s.borderWidth + 'px solid '+imp.getColorProperty(s.borderColor, config.sass_variable.colors);
				propsModel["border"] = {name : "border", value:borderValue};
			}
			if(s.radius_topLeft) propsModel["radius_topLeft"] = {name : "border-top-left-radius", value:s.radius_topLeft, sufix:"px"};
			if(s.radius_topRight) propsModel["radius_topRight"] = {name : "border-top-right-radius", value:s.radius_topRight, sufix:"px"};
			if(s.radius_bottomRight) propsModel["radius_bottomRight"] = {name : "border-bottom-right-radius", value:s.radius_bottomRight, sufix:"px"};
			if(s.radius_bottomLeft) propsModel["radius_bottomLeft"] = {name : "border-bottom-left-radius", value:s.radius_bottomLeft, sufix:"px"};
			
			if(s.radius) propsModel["radius"] = {name : "border-radius", value:s.radius, sufix:"px"};
			
		}
		
		if(item.pathdata){
			var value = imp.getColorProperty(item.pathdata.bgColor, config.sass_variable.colors);
			propsModel["bgColor"] = {name : "fill", value: value};
		}
		
		if(item.shadow){
			
			var s = item.shadow;
			var c  = s.color;
			
			var isBox = item[imp.OPT_TYPE] != imp.TYPE_TEXT;
			
			var tab = [];
			tab.push(s.x + 'px');
			tab.push(s.y + 'px');
			tab.push(s.blur + 'px');
			if(isBox) tab.push('0px');
			tab.push(c.rgba);
			var value = tab.join(' ');
			
			var propname = isBox ? 'box-shadow' : 'text-shadow';
			propsModel['shadow'] = {name: propname, value: value};
		}
		
		
		if(parent && parent.display == 'flex'){
			
			var testdim = parent[imp.OPT_DIRECTION] == 'row' ? imp.OPT_WIDTH : imp.OPT_HEIGHT;
			if(item[testdim]){
				var value = '0 0 auto';
				propsModel['flex_shorhand'] = {name: "flex", value: value};
			}
			
		}
		
		
		
		//si child set width px : et parent DIRECT has same width px : set 100%
		if(item[imp.OPT_WIDTH] == 'px' && parent && parent[imp.OPT_WIDTH] == 'px'){
			if(item.widthPx == parent.widthPx) item[imp.OPT_WIDTH] = '%';
		}
		if(item[imp.OPT_HEIGHT] == 'px' && parent && parent[imp.OPT_HEIGHT] == 'px'){
			if(item.heightPx == parent.heightPx) item[imp.OPT_HEIGHT] = '%';
		}
		
		//write dimensions
		
		if(item[imp.OPT_WIDTH]){
			propsModel["width"] = imp.getDimensionValue(parent, item, imp.OPT_WIDTH, 'widthPx');
		}
		if(item[imp.OPT_HEIGHT]){
			propsModel["height"] = imp.getDimensionValue(parent, item, imp.OPT_HEIGHT, 'heightPx');
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
				"margin_bottom2",
				"margin_right2",
				"margin_global",
				"lineHeight",
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
		var propsClean = ['margin_left2', 'margin_top2', 'margin_bottom2', 'margin_right2']
		for(var k in propsClean){
			var prop = propsClean[k];
			if(propsModel[prop] && propsModel[prop].value == 0){
				delete propsModel[prop];
			}
		}
		
		
		
		var data = imp.mapProps(propsModel, item);
		
		
		data = imp.transformMargins(data, 'margin');
		data = imp.transformMargins(data, 'padding');
		
		return data;
		
	}

}




function getGradientColorStr(obj, colors)
{
	var output = '';
	var dir = "to " + obj.dir;
	var col1 = "";
	var col2 = "";
	var tab = [];
	tab.push(dir);
	var nbColor = obj.colorStops.length;
	
	for(var i in obj.colorStops){
		var item = obj.colorStops[i];
		var col = imp.getColorProperty(item.color, colors);
		
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






//___________________________________________________________________

module.exports = {
	TPL_FUNCTIONS,
	recTransformLvl,
};
