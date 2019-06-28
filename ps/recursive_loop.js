var listTplModel = [];



function recursive_loop(container, parentItem, parentLayer, level, params, paramscopy) 
{	
	var layers = getLayersArray(container);
	var len = layers.length;
	// trace('layers : '+layers);
	
	var allCenterX = true;
	var allCenterY = true;
	var lastitem;
	

	for (var _i = 0; _i < len; _i++) {

		// var i = _i;
		var i_invert =  len - 1 - _i;
		var i_normal = _i;
		
		
		tracerec('_____________________________________ _i : '+_i, level);
		
		
		var layer;
		if(PLATFORM == 'xd') layer = layers[i_invert];
		else if(PLATFORM == 'ps') layer = layers[i_normal];

		var enable = isLayerVisible(layer);
		if (!enable) continue;

		var isContainer = isLayerContainer(layer);
		var name = getLayerName(layer);
		
		

		
		if (has_prefix(name)) {
			
			//shortcuts
			name = handleShorcuts(name);
			
			var errors = check_error_layername(name, parentItem);
			if (errors.length > 0) {
				params.listErrors = params.listErrors.concat(errors);
			}
		}
		
		
		
		var isRoot = (parentItem == null);
		var type = get_type(layer, name, isRoot, level);
		tracerec('isRoot : '+isRoot+', type : '+type, level);
		

		var parentitemname = (parentItem) ? parentItem.name : "";
		
		// tracerec('type : '+type+', parentitemname : '+parentitemname, level);

		if (type != "") {

			var item = create_item(layer, name, type, parentItem, level, i_normal, params);
			lastitem = item;
			type = item[OPT_TYPE];
			tracerec("item type : " + type + ", name: " + item.name + ", path : " + item.path + ", width : " + Math.round(item.widthPx) + ", height : " + Math.round(item.heightPx), level);
			
			
			var errors = check_error_item(name, item, listTplModel);
			
			if (errors.length > 0) {
				tracerec("errors : " + errors, level);
				params.listErrors = params.listErrors.concat(errors);
			}
			
			if (!item["disable"]) {
				if (isRoot) params.listItem.push(item);
				else parentItem.childrens.push(item);
			}
			
			
			//allCenterX/Y for canceling some padding
			if(item[OPT_POSITION] == 'static' && !item[OPT_BGPARENT]){
				
				if(item[OPT_LAYOUT_X] != 'center') allCenterX = false;
				if(item[OPT_LAYOUT_Y] != 'center') allCenterY = false;
			}
			
			
			

			if (isItemExport(item, type, item['templateMode'])) {
				
				item.has_graphic = true;
				
				var path = EXPORT_FOLDER + "/" + EXPORT_FOLDER_IMG + "/";
				if (item.path != "") path += item.path + "/";
				path += item[OPT_FILENAME];
				
				var hasError = params.listErrors.length >= 1;
				
				if ((params.overwrite || !fileExist(path, params.exportPath)) && ENABLE_EXPORT && !hasError) {
					
					var bounds = null;
					if (parentItem && parentItem[OPT_EQUALOFFSET] == 1) {
						bounds = parentItem.bounds;
					}

					var imgtype = item[OPT_IMGTYPE];
					
					trace('params.exportPath : '+params.exportPath);
					saveLayer(layer, path, params.exportPath, false, bounds, imgtype, params.config);
					
					
				}

			}

		}
		
		
		if (isContainer && CONTAINERS_TYPE.indexOf(type) != -1) {
			
			parentLayer = null;	//never used

			var newParentItem = parentItem;
			if (CONTAINERS_TYPE.indexOf(type) != -1) newParentItem = item;

			recursive_loop(layer, newParentItem, parentLayer, level + 1, params, paramscopy);
			
		}
		
		
	}
	//end loop
	
	
	//for padding cancelations
	if(parentItem){
		parentItem['allCenterX'] = allCenterX;
		parentItem['allCenterY'] = allCenterY;
		
	}
	
	
	
	
	
	
	//error positionning
	
	var isParentTemplate = (getParentsProperty(lastitem, OPT_TPL));
	
	if(!isParentTemplate){
		var errors2 = check_error_item2(parentItem);
		if (errors2.length > 0) {
			tracerec("errors2 : " + errors2, level);
			params.listErrors = params.listErrors.concat(errors2);
		}
	}
	
	
	
	
	//count tags number in sibblings
	var listitems;
	if (parentItem) listitems = parentItem.childrens;
	else listitems = params.listItem;
	
	var _len = listitems.length;
	var listtags = listitems.map(function(item){ return item.tag});
	var listtagsUnnamed = listitems.map(function(item){ return item.useTag ? item.tag : null });
	
	
	for (var _i = 0; _i < _len; _i++) {
		var item = listitems[_i];
		var count = 0;
		var countUnnamed = 0;
		var countBefore = 0;
		listtags.forEach(function(tag, index){
			if(tag == item.tag){
				count++;
				if(index < _i) countBefore++;
			}
		});
		listtagsUnnamed.forEach(function(tag, index){
			if(tag == item.tag) countUnnamed++;
		});
		item.countTag = count;
		item.countTagUnnamed = countUnnamed;
		item.indexTag = _i;
		// item.positionTag = count - 1 - countBefore;
		item.positionTag = countBefore;
	}
	
	
}






function create_item(layer, name, type, parentItem, level, index, params) {
	
	// trace("create_item");
	var output = {};


	if (CONTAINERS_TYPE.indexOf(type) != -1) output.childrens = [];
	output[OPT_TYPE] = type;
	
	
	output['indent'] = level;
	output.parent = parentItem;
	
	
	//template
	if (has_option(name, OPT_TPL)) {
		var val = get_value_option(name, OPT_TPL);
		output[OPT_TPL] = val;
	}
	if (has_option(name, OPT_TPLMODEL)) {
		var val = get_value_option(name, OPT_TPLMODEL);
		output[OPT_TPLMODEL] = val;
		listTplModel.push(val);
	}
	
	
	
	//placeholders
	if (has_option(name, OPT_PLACEHOLDER)) {
		var val = get_value_option(name, OPT_PLACEHOLDER);
		output[OPT_PLACEHOLDER] = val;
	}
	
	
	
	
	//templateMode
	
	var isTemplate = ((output[OPT_TPL]) || (getParentsProperty(output, OPT_TPL)));
	var isTemplateModel = ((output[OPT_TPLMODEL]) || (getParentsProperty(output, OPT_TPLMODEL)));
	
	var templateMode = '';
	if(isTemplate){
		templateMode = 'read';
		output['tplparent'] = isTemplate;
	}
	else if(isTemplateModel){
		templateMode = 'write';
		output['tplparent'] = isTemplateModel;
		if(output[OPT_TPLMODEL]) output['tplmodelIndent'] = output.indent;
		else output['tplmodelIndent'] = getParentsProperty(output, 'tplmodelIndent');
		// tracerec('tplmodelIndent : '+output.tplmodelIndent, level);
	}
	output['templateMode'] = templateMode;
	
	
	
	// tracerec('isTemplate : '+isTemplate+', isTemplateModel : '+isTemplateModel, level);
	// tracerec('templateMode : '+templateMode, level);
	
	
	
	if(isTemplateModel && output[OPT_PLACEHOLDER]){
		
		saveTemplateItem(isTemplateModel, output[OPT_PLACEHOLDER], output);
	}
	else if(isTemplate && output[OPT_PLACEHOLDER]){
		
		var itemmodel = getTemplateItem(isTemplate, output[OPT_PLACEHOLDER]);
		if(itemmodel){
			output[OPT_TYPE] = itemmodel[OPT_TYPE];
			output[OPT_IMGTYPE] = itemmodel[OPT_IMGTYPE];
			type = output[OPT_TYPE];
		}
	}
	
	
	
	
	
	/* 
	if(output[OPT_PLACEHOLDER] && output[OPT_PLACEHOLDER].substr(0, 3) == 'img'){
		type = TYPE_GFX;
		output[OPT_TYPE] = type;
	}
	 */
	
	
	//lvl
	if (has_option(name, OPT_LVL)) {
		var val = get_value_option(name, OPT_LVL);
		output[OPT_LVL] = val;
	}
	
	
	//classname
	if (has_option(name, OPT_CLASS)) {
		var val = get_value_option(name, OPT_CLASS);
		output[OPT_CLASS] = val;
	}
	
	
	//output.layerName = name;
	output[OPT_NAME] = get_value_option_safe(name, OPT_NAME);
	
	//if &-name and parent.useTag : parent.useTag = false
	if(parentItem && parentItem.useTag && output[OPT_NAME].charAt(0) == "&"){
		parentItem.useTag = false;
	}
	
	output[OPT_NAME] = decodeNameParentRef(output[OPT_NAME], parentItem);
	
	
	
	
	if (output[OPT_NAME] == "") {
		output[OPT_NAME] = generateItemName(parentItem, type, index, 'name');
		output.useTag = true;
		
	}
	
	if (has_option(name, OPT_FILENAME)) {
		output[OPT_FILENAME] = get_value_option(name, OPT_FILENAME);
	}
	else{
		if(output[OPT_PLACEHOLDER]) output[OPT_FILENAME] = generateItemName(parentItem, type, index, 'filename');
		else output[OPT_FILENAME] = output[OPT_NAME];
	}
	

	var bounds = getBounds(layer, type);
	output.bounds = bounds;
	
		
	var x1 = Math.round(bounds[0]);
	var y1 = Math.round(bounds[1]);
	var x2 = Math.round(bounds[2]);
	var y2 = Math.round(bounds[3]);
	
	
	output.position = [x1, y1];
	
	output.widthPx = Math.round(bounds[4]);
	output.heightPx = Math.round(bounds[5]);
	
	
	
	if (has_option(name, OPT_WIDTH)) output[OPT_WIDTH] = get_value_option(name, OPT_WIDTH);
	if (has_option(name, OPT_HEIGHT)) output[OPT_HEIGHT] = get_value_option(name, OPT_HEIGHT);
	
	
	
	
	
	
	if (has_option(name, OPT_IMGTYPE)) {
		var val = get_value_option(name, OPT_IMGTYPE);
		output[OPT_IMGTYPE] = val;
	}
	else if(type == TYPE_GFX && !output[OPT_IMGTYPE]){
		output[OPT_IMGTYPE] = get_natural_imgtype(layer);
		if(!output[OPT_IMGTYPE]) output[OPT_IMGTYPE] = 'png';
	}
	
	
	
	
	var shadow = getShadowData(layer);
	if(shadow) output.shadow = shadow;
	
	
	
	


	tracerec("item " + name + ", parentItem : " + ((parentItem) ? parentItem.name : "") + ", position : " + output.position + ", exp : "+output.doexport, level);

	//save pos absolute
	output.position_abs = [output.position[0], output.position[1]];

	//substract parent position
	if (parentItem) {
		output.position[0] -= parentItem.position_abs[0];
		output.position[1] -= parentItem.position_abs[1];
	}
	else{
		output.position[0] -= params.boundsRoot[0];
		output.position[1] -= params.boundsRoot[1];
	}
	
	
	//position
	if (has_option(name, OPT_POSITION)) {
		output[OPT_POSITION] = get_value_option(name, OPT_POSITION);
	}
	else output[OPT_POSITION] = "static";
	
	
	//set parent relative
	if(output[OPT_POSITION] == 'absolute'){
		if(parentItem && parentItem[OPT_POSITION] == 'static'){
			parentItem.positionRelative = true;
		}
	}
	
	
	
	
	
	//direction
	if (has_option(name, OPT_DIRECTION)) {
		output[OPT_DIRECTION] = get_value_option(name, OPT_DIRECTION);
	}
	//default value (only if container)
	else if(CONTAINERS_TYPE.indexOf(type) != -1){
		output[OPT_DIRECTION] = "col";
	}
	
	
	
	


	//layout
	output.margin_left = output.position[0];
	if (has_option(name, OPT_LAYOUT_X)) {
		var layout = get_value_option(name, OPT_LAYOUT_X);

		var parentsize = parentItem ? parentItem.widthPx : DOC_WIDTH;
		if (layout == "right"){
			output.margin_right = parentsize - (output.position[0] + output.widthPx);
			// output[OPT_POSITION] = "absolute";
		}
		output[OPT_LAYOUT_X] = layout;
	}
	else output[OPT_LAYOUT_X] = "left";
	
	
	output.margin_top = output.position[1];
	if (has_option(name, OPT_LAYOUT_Y)) {
		var layout = get_value_option(name, OPT_LAYOUT_Y);

		var parentsize = parentItem ? parentItem.heightPx : DOC_HEIGHT;
		if (layout == "bottom"){
			output.margin_bottom = parentsize - (output.position[1] + output.heightPx);
			// output[OPT_POSITION] = "absolute";
		}
		output[OPT_LAYOUT_Y] = layout;
	}
	else output[OPT_LAYOUT_Y] = "top";
	
	
	
	
	//children layout
	
	if (has_option(name, OPT_CHILDREN_X)) {
		output[OPT_CHILDREN_X] = get_value_option(name, OPT_CHILDREN_X);
	}
	if (has_option(name, OPT_CHILDREN_Y)) {
		output[OPT_CHILDREN_Y] = get_value_option(name, OPT_CHILDREN_Y);
	}
	


	if (type != TYPE_TEXT) {
		var path = get_value_option_safe(name, OPT_PATH);
		var startSlash = path.substr(0, 1) == '/';
		path = removePathSlash(path);
		

		output[OPT_PATH] = "";
		if (!startSlash && parentItem != null && parentItem.path != "") {
			output[OPT_PATH] += parentItem.path;
			if (path != "") output[OPT_PATH] += "/";
		}
		output[OPT_PATH] += path;
	}
	
	
	if(type == TYPE_GFX){
		setItemPath(output);
	}
	
	
	
	
	if (type == TYPE_CONTAINER) {
		output[OPT_EQUALOFFSET] = get_value_option_safe(name, OPT_EQUALOFFSET);
	}
	
	
	
	if([TYPE_GFX, TYPE_SHAPE, TYPE_CONTAINER].indexOf(type) > -1){
		output[OPT_BGPARENT] = get_value_option_safe(name, OPT_BGPARENT);
		output[OPT_BGPARENT] = (output[OPT_BGPARENT] == "1");
	}
	
	
	if (type == TYPE_GFX) {

		output[OPT_GFX_TYPE] = get_value_option_safe(name, OPT_GFX_TYPE);
		if (output[OPT_GFX_TYPE] == "") output[OPT_GFX_TYPE] = "layout";	//layout/data
		
		
		if (output[OPT_BGPARENT]) {
			parentItem[OPT_PATH] = output[OPT_PATH];
			parentItem[OPT_FILENAME] = output[OPT_NAME];
			if(output.shadow) parentItem.shadow = output.shadow;
			if(output[OPT_IMGTYPE]) parentItem[OPT_IMGTYPE] = output[OPT_IMGTYPE];
			else parentItem[OPT_IMGTYPE] = 'png';
			parentItem.has_graphic = true;
			output["disable"] = true;
			
			setItemPath(parentItem);
		}
		
		var filter = [
			'bgColor',
			'bgGradient',
		];
		
		//added for : border and radius
		output["shapedata"] = getShapeData(layer, output.widthPx, output.heightPx, filter);
		
		for(var k in output["shapedata"]){
			if(filter.indexOf(k) > -1) delete output["shapedata"][k];
		}
		

	}


          

	//font information (regroupées en un objet) pour type TXT
	if (type == TYPE_TEXT) {
		
		output["textdata"] = getTextData(layer);
	}
	
	if (type == TYPE_SHAPE) {
		
		output["shapedata"] = getShapeData(layer, output.widthPx, output.heightPx);
		
		if (output[OPT_BGPARENT]) {
			parentItem.shapedata = output.shapedata;
			if(output.shadow) parentItem.shadow = output.shadow;
			output["disable"] = true;
		}
		
	}
	
	
	//inline svg
	if(type == TYPE_GFX && output[OPT_IMGTYPE]=='svg-inline'){
		
		output["pathdata"] = getPathData(layer);
		trace('pathdata : '+output["pathdata"]);
		//maybe refactor later in list of PathData object
	}
	
	
	//fait ici car ça concerne le parent, trop tard dans getLayoutData
	//set parent flex if col / centery
	if(output[OPT_POSITION] == 'static'){
		if(parentItem && parentItem[OPT_DIRECTION] == 'col'){
			if(output[OPT_LAYOUT_Y] == 'center'){
				parentItem.display = 'flex';
			}
		}
	}
	
	
	
	//rotation
	/* 
	var rotation = getRotation(layer);
	if(rotation != 0){
		
		throw new Error('rotation : '+rotation);
	}
	 */
	
	
	
	var tag;
	if(type == TYPE_CONTAINER) tag = 'div';
	else if(type == TYPE_GFX && output[OPT_IMGTYPE]=='svg-inline') tag = 'svg';
	else if(type == TYPE_GFX && output[OPT_PLACEHOLDER]) tag = 'img';
	else if(type == TYPE_GFX) tag = 'div';
	else if(type == TYPE_SHAPE) tag = 'div';
	else if(type == TYPE_TEXT) tag = 'p';
	else throw new Error('type unknown : '+type);
	output[OPT_TAG] = tag;
	
	if (has_option(name, OPT_TAG)) {
		output[OPT_TAG] = get_value_option(name, OPT_TAG);
	}
	
	
	
	
	
	//paddings
	if(parentItem){
		
		if(output[OPT_POSITION] == 'static' && !output[OPT_BGPARENT]){
			
			if(output[OPT_LAYOUT_X] != 'right'){
				if(!parentItem.hasOwnProperty("p_left")) parentItem["p_left"] = output.position[0];
				else if(output.position[0] < parentItem["p_left"]) parentItem["p_left"] = output.position[0];
			}
			
			if(output[OPT_LAYOUT_Y] != 'bottom'){
				if(!parentItem.hasOwnProperty("p_top")) parentItem["p_top"] = output.position[1];
				else if(output.position[1] < parentItem["p_top"]) parentItem["p_top"] = output.position[1];
			}
			
			var p_right = parentItem.widthPx - (output.position[0] + output.widthPx);
			var p_bottom = parentItem.heightPx - (output.position[1] + output.heightPx);
			
			if(!parentItem.hasOwnProperty("p_right")) parentItem["p_right"] = p_right;
			else if(p_right < parentItem["p_right"]) parentItem["p_right"] = p_right;
			
			if(!parentItem.hasOwnProperty("p_bottom")) parentItem["p_bottom"] = p_bottom;
			else if(p_bottom < parentItem["p_bottom"]) parentItem["p_bottom"] = p_bottom;
			
			
		}
		
		
	}
	
	
	
	return output;
}


