function recursive_loop(container, parentItem, parentLayer, level) {
	//tracerec("recursive_loop", level);

	var layers = getLayersArray(container);
	var len = layers.length;

	for (var _i = 0; _i < len; _i++) {

		var i;
		if (globalSettings.indexTpl == 0) i = _i;
		else i = len - 1 - _i;


		var layer = layers[i];

		var enable = isLayerVisible(layer);
		if (!enable) continue;

		var isContainer = isLayerContainer(layer);
		var name = getLayerName(layer);


		if (has_prefix(name)) {

			//shortcuts
			name = handleShorcuts(name);
			
			var errors = check_error_layername(name, parentItem);
			if (errors.length > 0) {
				trace("errors : " + errors);
				listErrors = listErrors.concat(errors);
			}

		}
		
		
		
		var isRoot = (parentItem == null);
		var type = get_type(layer, name, isRoot, level);

		var parentitemname = (parentItem) ? parentItem.name : "";


		if (type != "") {

			var item = create_item(layer, name, type, parentItem, level, i);
			tracerec("item type : " + type + ", name: " + item.name + ", path : " + item.path + ", btnc : " + item.btnc + ", width : " + item.width + ", height : " + item.height, level);

			var errors = check_error_item(name, item);
			if (errors.length > 0) {
				trace("errors : " + errors);
				listErrors = listErrors.concat(errors);
			}

			if (!item["disable"]) {
				if (isRoot) listItem.push(item);
				else parentItem.childrens.push(item);
			}

			if (EXPORTS_TYPE.indexOf(type) != -1 && item[OPT_DOEXPORT]) {

				item.has_graphic = true;
				var path = EXPORT_FOLDER + "/" + EXPORT_FOLDER_IMG + "/";
				if (item.path != "") path += item.path + "/";
				path += item[OPT_FILENAME];
				path += ".png";
				//tracerec("path : "+path, level);

				if (overwrite || !fileExist(path, exportPath)) {

					var bounds = null;
					if (parentItem && parentItem[OPT_EQUALOFFSET] == 1) {
						bounds = parentItem.bounds;
					}

					saveLayer(layer, path, exportPath, false, bounds);
					trace("saveLayer " + path);
				}

			}

		}

		if (isContainer && CONTAINERS_TYPE.indexOf(type) != -1) {
			
			parentLayer = null;	//never used
			tracerec("reccc type : " + type, level);

			var newParentItem = parentItem;
			if (CONTAINERS_TYPE.indexOf(type) != -1) newParentItem = item;

			recursive_loop(layer, newParentItem, parentLayer, level + 1);
			
		}
		

	}
	
	
	
}






function create_item(layer, name, type, parentItem, level, index) {
	var output = {};


	if (CONTAINERS_TYPE.indexOf(type) != -1) output.childrens = [];

	output[OPT_TYPE] = type;

	//output.layerName = name;
	output[OPT_NAME] = get_value_option_safe(name, OPT_NAME);
	
	
	if (output[OPT_NAME] == "") {
		// output[OPT_NAME] = "" + type + "-" + getLayerId(app.activeDocument, layer);
		
		if(parentItem) output[OPT_NAME] += parentItem.name;
		else output[OPT_NAME] += type;
		output[OPT_NAME] += '_' + index;
		
	}
	
	output[OPT_FILENAME] = output[OPT_NAME];

	// var bounds = layer.bounds;
	var bounds = getBounds(layer, type);
	output.bounds = bounds;

	// if (parentItem != null) {
	if (true) {
		
		var x1 = bounds[0];
		var y1 = bounds[1];
		var x2 = bounds[2];
		var y2 = bounds[3];

		if (x1 < 0) x1 = 0;
		if (y1 < 0) y1 = 0;
		
		trace(output[OPT_NAME]+" :: x, y : "+x1+", "+y1);

		output.position = [x1, y1];
		output.width = x2 - x1;
		output.height = y2 - y1;

		trace("output.width : " + output.width + ", output.height:  " + output.height);
		trace("bounds[2] : " + bounds[2] + ", bounds[0]:  " + bounds[0]);
		trace("bounds[3] : " + bounds[3] + ", bounds[1]:  " + bounds[1]);
	}
	/* 
	else {
		output.position = [0, 0];
		output.width = DOC_WIDTH;
		output.height = DOC_HEIGHT;
	}
	 */
	 
	if (has_option(name, OPT_POS_X)) output.position[0] = get_value_option(name, OPT_POS_X);
	if (has_option(name, OPT_POS_Y)) output.position[1] = get_value_option(name, OPT_POS_Y);

	if (has_option(name, OPT_WIDTH)) {
		var val = get_value_option(name, OPT_WIDTH);
		val = getPercentValue(val) / 100;
		output[OPT_WIDTH] = Math.round(val * DOC_WIDTH);
	}
	if (has_option(name, OPT_HEIGHT)) {
		var val = get_value_option(name, OPT_HEIGHT);
		val = getPercentValue(val) / 100;
		output[OPT_HEIGHT] = Math.round(val * DOC_HEIGHT);
	}
	
	if (has_option(name, OPT_DOEXPORT)) {
		var val = get_value_option(name, OPT_DOEXPORT);
		if(val == "!export") val = false;
		else val = true;
		output[OPT_DOEXPORT] = val;
	}
	else output[OPT_DOEXPORT] = true;
	trace('OPT_DOEXPORT '+output[OPT_DOEXPORT]);


	tracerec("item " + name + ", parentItem : " + ((parentItem) ? parentItem.name : "") + ", position : " + output.position + ", exp : "+output.doexport, level);

	//save pos absolute
	output.position_abs = [output.position[0], output.position[1]];

	//substract parent position
	if (parentItem) {
		output.position[0] -= parentItem.position_abs[0];
		output.position[1] -= parentItem.position_abs[1];
		trace('minus parent w - '+parentItem.position_abs[0]+' : '+output.position[0]);
		trace('minus parent h - '+parentItem.position_abs[1]+' : '+output.position[1]);
		trace('parent : '+parentItem[OPT_NAME]);
	}
	
	
	
	//position
	if (has_option(name, OPT_POSITION)) {
		output[OPT_POSITION] = get_value_option(name, OPT_POSITION);
	}
	else output[OPT_POSITION] = "static";
	
	
	//direction
	if (has_option(name, OPT_DIRECTION)) {
		output[OPT_DIRECTION] = get_value_option(name, OPT_DIRECTION);
	}
	//default value (only if container)
	else if(CONTAINERS_TYPE.indexOf(type) != -1){
		output[OPT_DIRECTION] = "col";
	}
	
	
	//align-items
	if (has_option(name, OPT_ALIGN_ITEMS)) {
		output[OPT_ALIGN_ITEMS] = get_value_option(name, OPT_ALIGN_ITEMS);
	}
	
	
	


	//layout
	output.margin_left = output.position[0];
	if (has_option(name, OPT_LAYOUT_X)) {
		var layout = get_value_option(name, OPT_LAYOUT_X);

		var parentsize = parentItem ? parentItem.width : DOC_WIDTH;
		if (layout == "right"){
			output.margin_right = parentsize - (output.position[0] + output.width);
			output[OPT_POSITION] = "absolute";
		}
		else if (layout == "center") {
			output.center_h = Math.round(output.position[0] / (parentsize - output.width) * 100);
			if (isNaN(output.center_h)) output.center_h = 0.5;
		}

		output[OPT_LAYOUT_X] = layout;
		
	}
	else output[OPT_LAYOUT_X] = "left";
	
	

	output.margin_top = output.position[1];
	if (has_option(name, OPT_LAYOUT_Y)) {
		var layout = get_value_option(name, OPT_LAYOUT_Y);

		var parentsize = parentItem ? parentItem.height : DOC_HEIGHT;
		if (layout == "bottom"){
			output.margin_bottom = parentsize - (output.position[1] + output.height);
			output[OPT_POSITION] = "absolute";
		}
		else if (layout == "center") {
			output.center_v = Math.round(output.position[1] / (parentsize - output.height) * 100);
			if (isNaN(output.center_v)) output.center_v = 0.5;
		}

		output[OPT_LAYOUT_Y] = layout;
		
	}
	else output[OPT_LAYOUT_Y] = "top";





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

	if (type == TYPE_CONTAINER) {
		output[OPT_EQUALOFFSET] = get_value_option_safe(name, OPT_EQUALOFFSET);
	}

	if (type == TYPE_GFX) {

		output[OPT_GFX_TYPE] = get_value_option_safe(name, OPT_GFX_TYPE);
		if (output[OPT_GFX_TYPE] == "") output[OPT_GFX_TYPE] = "layout";	//layout/data

		output[OPT_BGPARENT] = get_value_option_safe(name, OPT_BGPARENT);
		output[OPT_BGPARENT] = (output[OPT_BGPARENT] == "1");

		if (output[OPT_BGPARENT]) {
			parentItem[OPT_PATH] = output[OPT_PATH];
			parentItem[OPT_FILENAME] = output[OPT_NAME];
			parentItem.has_graphic = true;
			output["disable"] = true;
		}
	}
	
	
  
	
	//font information (regroupées en un objet) pour type TXT
	if (type == TYPE_TEXT) {
		
		output["textdata"] = getTextData(layer);

	}
	

	output.parent = parentItem;

	return output;
}




