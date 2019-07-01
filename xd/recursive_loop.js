var imp = {};
imp = {...imp, ...require('./platform/debug.js')};
imp = {...imp, ...require('./platform/platform_layer.js')};
imp = {...imp, ...require('./platform/platform_layer2.js')};
imp = {...imp, ...require('./utils.js')};
imp = {...imp, ...require('./errors_utils.js')};
imp = {...imp, ...require('./constantes.js')};
imp = {...imp, ...require('./platform/platform_io.js')};

var trace = imp.trace;
var tracerec = imp.tracerec;

//___________________________________________________________________





var listTplModel = [];



async function recursive_loop(container, parentItem, parentLayer, level, params, paramscopy) 
{	
	var layers = imp.getLayersArray(container);
	var len = layers.length;
	// trace('layers : '+layers);
	
	
	
	var allCenterX = true;
	var allCenterY = true;
	var lastitem;
	

	for (var _i = 0; _i < len; _i++) {

		var i_invert =  len - 1 - _i;
		var i_normal = _i;
		
		tracerec('_____________________________________ _i : '+_i, level);
		/* 
		var layer;
		if(imp.PLATFORM == 'xd') layer = layers[i_invert];
		else if(imp.PLATFORM == 'ps') layer = layers[i_normal];
		 */
		var layer = layers[i_invert];

		var enable = imp.isLayerVisible(layer);
		if (!enable) continue;

		var isContainer = imp.isLayerContainer(layer);
		var name = imp.getLayerName(layer);
		
		


		if (imp.has_prefix(name)) {
			
			//shortcuts
			name = imp.handleShorcuts(name);
			
			var errors = imp.check_error_layername(name, parentItem);
			if (errors.length > 0) {
				params.listErrors = params.listErrors.concat(errors);
			}
		}
		
		
		
		var isRoot = (parentItem == null);
		var type = imp.get_type(layer, name, isRoot, level);

		var parentitemname = (parentItem) ? parentItem.name : "";
		
		// tracerec('type : '+type+', parentitemname : '+parentitemname, level);

		if (type != "") {

			var item = create_item(layer, name, type, parentItem, level, i_normal, params);
			lastitem = item;
			type = item[imp.OPT_TYPE];
			tracerec("item type : " + type + ", name: " + item.name + ", path : " + item.path + ", width : " + Math.round(item.widthPx) + ", height : " + Math.round(item.heightPx), level);
			
			
			var errors = imp.check_error_item(name, item, listTplModel);
			
			
			if (errors.length > 0) {
				tracerec("errors : " + errors, level);
				params.listErrors = params.listErrors.concat(errors);
			}
			
			if (!item["disable"]) {
				if (isRoot) params.listItem.push(item);
				else parentItem.childrens.push(item);
			}
			
			
			//allCenterX/Y for canceling some padding
			if(item[imp.OPT_POSITION] == 'static' && !item[imp.OPT_BGPARENT]){
				
				if(item[imp.OPT_LAYOUT_X] != 'center') allCenterX = false;
				if(item[imp.OPT_LAYOUT_Y] != 'center') allCenterY = false;
			}
			
			
			

			if (imp.isItemExport(item, type, item['templateMode'])) {
				
				item.has_graphic = true;
				
				var path = imp.EXPORT_FOLDER + "/" + imp.EXPORT_FOLDER_IMG + "/";
				if (item.path != "") path += item.path + "/";
				path += item[imp.OPT_FILENAME];
				
				var hasError = params.listErrors.length >= 1;
				
				if ((params.overwrite || !imp.fileExist(path, params.exportPath)) && imp.ENABLE_EXPORT && !hasError) {
					
					var bounds = null;
					if (parentItem && parentItem[imp.OPT_EQUALOFFSET] == 1) {
						bounds = parentItem.bounds;
					}
					
					var imgtype = item[imp.OPT_IMGTYPE];
					await imp.saveLayer(layer, path, params.exportPath, false, bounds, imgtype, params.config);
					
					
				}

			}

		}
		
		
		if (isContainer && imp.CONTAINERS_TYPE.indexOf(type) != -1) {
			
			parentLayer = null;	//never used

			var newParentItem = parentItem;
			if (imp.CONTAINERS_TYPE.indexOf(type) != -1) newParentItem = item;

			await recursive_loop(layer, newParentItem, parentLayer, level + 1, params, paramscopy);
			
		}
		
		
	}
	//end loop
	
	
	//for padding cancelations
	if(parentItem){
		parentItem['allCenterX'] = allCenterX;
		parentItem['allCenterY'] = allCenterY;
		
	}
	
	
	
	
	
	
	//error positionning
	
	var isParentTemplate = (imp.getParentsProperty(lastitem, imp.OPT_TPL));
	
	if(!isParentTemplate){
		var errors2 = imp.check_error_item2(parentItem);
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


	if (imp.CONTAINERS_TYPE.indexOf(type) != -1) output.childrens = [];
	output[imp.OPT_TYPE] = type;
	
	
	output['indent'] = level;
	output.parent = parentItem;
	
	
	//template
	if (imp.has_option(name, imp.OPT_TPL)) {
		var val = imp.get_value_option(name, imp.OPT_TPL);
		output[imp.OPT_TPL] = val;
	}
	if (imp.has_option(name, imp.OPT_TPLMODEL)) {
		var val = imp.get_value_option(name, imp.OPT_TPLMODEL);
		output[imp.OPT_TPLMODEL] = val;
		listTplModel.push(val);
	}
	
	
	
	//placeholders
	if (imp.has_option(name, imp.OPT_PLACEHOLDER)) {
		var val = imp.get_value_option(name, imp.OPT_PLACEHOLDER);
		output[imp.OPT_PLACEHOLDER] = val;
	}
	
	
	
	
	//templateMode
	
	var isTemplate = ((output[imp.OPT_TPL]) || (imp.getParentsProperty(output, imp.OPT_TPL)));
	var isTemplateModel = ((output[imp.OPT_TPLMODEL]) || (imp.getParentsProperty(output, imp.OPT_TPLMODEL)));
	
	var templateMode = '';
	if(isTemplate){
		templateMode = 'read';
		output['tplparent'] = isTemplate;
	}
	else if(isTemplateModel){
		templateMode = 'write';
		output['tplparent'] = isTemplateModel;
		if(output[imp.OPT_TPLMODEL]) output['tplmodelIndent'] = output.indent;
		else output['tplmodelIndent'] = imp.getParentsProperty(output, 'tplmodelIndent');
		// tracerec('tplmodelIndent : '+output.tplmodelIndent, level);
	}
	output['templateMode'] = templateMode;
	
	
	
	// tracerec('isTemplate : '+isTemplate+', isTemplateModel : '+isTemplateModel, level);
	// tracerec('templateMode : '+templateMode, level);
	
	
	
	if(isTemplateModel && output[imp.OPT_PLACEHOLDER]){
		
		imp.saveTemplateItem(isTemplateModel, output[imp.OPT_PLACEHOLDER], output);
	}
	else if(isTemplate && output[imp.OPT_PLACEHOLDER]){
		
		var itemmodel = imp.getTemplateItem(isTemplate, output[imp.OPT_PLACEHOLDER]);
		if(itemmodel){
			output[imp.OPT_TYPE] = itemmodel[imp.OPT_TYPE];
			output[imp.OPT_IMGTYPE] = itemmodel[imp.OPT_IMGTYPE];
			type = output[imp.OPT_TYPE];
		}
	}
	
	
	
	
	
	/* 
	if(output[imp.OPT_PLACEHOLDER] && output[imp.OPT_PLACEHOLDER].substr(0, 3) == 'img'){
		type = imp.TYPE_GFX;
		output[imp.OPT_TYPE] = type;
	}
	 */
	
	
	//lvl
	if (imp.has_option(name, imp.OPT_LVL)) {
		var val = imp.get_value_option(name, imp.OPT_LVL);
		output[imp.OPT_LVL] = val;
	}
	
	
	//classname
	if (imp.has_option(name, imp.OPT_CLASS)) {
		var val = imp.get_value_option(name, imp.OPT_CLASS);
		output[imp.OPT_CLASS] = val;
	}
	
	
	//output.layerName = name;
	output[imp.OPT_NAME] = imp.get_value_option_safe(name, imp.OPT_NAME);
	
	//if &-name and parent.useTag : parent.useTag = false
	if(parentItem && parentItem.useTag && output[imp.OPT_NAME].charAt(0) == "&"){
		parentItem.useTag = false;
	}
	
	output[imp.OPT_NAME] = imp.decodeNameParentRef(output[imp.OPT_NAME], parentItem);
	
	
	
	
	if (output[imp.OPT_NAME] == "") {
		output[imp.OPT_NAME] = imp.generateItemName(parentItem, type, index, 'name');
		output.useTag = true;
		
	}
	
	if (imp.has_option(name, imp.OPT_FILENAME)) {
		output[imp.OPT_FILENAME] = imp.get_value_option(name, imp.OPT_FILENAME);
	}
	else{
		if(output[imp.OPT_PLACEHOLDER]) output[imp.OPT_FILENAME] = imp.generateItemName(parentItem, type, index, 'filename');
		else output[imp.OPT_FILENAME] = output[imp.OPT_NAME];
	}
	

	var bounds = imp.getBounds(layer, type);
	output.bounds = bounds;
	
		
	var x1 = Math.round(bounds[0]);
	var y1 = Math.round(bounds[1]);
	var x2 = Math.round(bounds[2]);
	var y2 = Math.round(bounds[3]);
	
	
	output.position = [x1, y1];
	
	output.widthPx = Math.round(bounds[4]);
	output.heightPx = Math.round(bounds[5]);
	
	
	
	if (imp.has_option(name, imp.OPT_WIDTH)) output[imp.OPT_WIDTH] = imp.get_value_option(name, imp.OPT_WIDTH);
	if (imp.has_option(name, imp.OPT_HEIGHT)) output[imp.OPT_HEIGHT] = imp.get_value_option(name, imp.OPT_HEIGHT);
	
	
	
	
	
	
	if (imp.has_option(name, imp.OPT_IMGTYPE)) {
		var val = imp.get_value_option(name, imp.OPT_IMGTYPE);
		output[imp.OPT_IMGTYPE] = val;
	}
	else if(type == imp.TYPE_GFX && !output[imp.OPT_IMGTYPE]){
		output[imp.OPT_IMGTYPE] = imp.get_natural_imgtype(layer);
		if(!output[imp.OPT_IMGTYPE]) output[imp.OPT_IMGTYPE] = 'png';
	}
	
	
	
	var retina = params.config.config.retina;
	var shadow = imp.getShadowData(layer, retina);
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
	if (imp.has_option(name, imp.OPT_POSITION)) {
		output[imp.OPT_POSITION] = imp.get_value_option(name, imp.OPT_POSITION);
	}
	else output[imp.OPT_POSITION] = "static";
	
	
	//set parent relative
	if(output[imp.OPT_POSITION] == 'absolute'){
		if(parentItem && parentItem[imp.OPT_POSITION] == 'static'){
			parentItem.positionRelative = true;
		}
	}
	
	
	
	
	
	//direction
	if (imp.has_option(name, imp.OPT_DIRECTION)) {
		output[imp.OPT_DIRECTION] = imp.get_value_option(name, imp.OPT_DIRECTION);
	}
	//default value (only if container)
	else if(imp.CONTAINERS_TYPE.indexOf(type) != -1){
		output[imp.OPT_DIRECTION] = "col";
	}
	
	
	
	


	//layout
	output.margin_left = output.position[0];
	if (imp.has_option(name, imp.OPT_LAYOUT_X)) {
		var layout = imp.get_value_option(name, imp.OPT_LAYOUT_X);

		var parentsize = parentItem ? parentItem.widthPx : imp.DOC_WIDTH;
		if (layout == "right"){
			output.margin_right = parentsize - (output.position[0] + output.widthPx);
			// output[imp.OPT_POSITION] = "absolute";
		}
		output[imp.OPT_LAYOUT_X] = layout;
	}
	else output[imp.OPT_LAYOUT_X] = "left";
	
	
	output.margin_top = output.position[1];
	if (imp.has_option(name, imp.OPT_LAYOUT_Y)) {
		var layout = imp.get_value_option(name, imp.OPT_LAYOUT_Y);

		var parentsize = parentItem ? parentItem.heightPx : imp.DOC_HEIGHT;
		if (layout == "bottom"){
			output.margin_bottom = parentsize - (output.position[1] + output.heightPx);
			// output[imp.OPT_POSITION] = "absolute";
		}
		output[imp.OPT_LAYOUT_Y] = layout;
	}
	else output[imp.OPT_LAYOUT_Y] = "top";
	
	
	
	
	//children layout
	
	if (imp.has_option(name, imp.OPT_CHILDREN_X)) {
		output[imp.OPT_CHILDREN_X] = imp.get_value_option(name, imp.OPT_CHILDREN_X);
	}
	if (imp.has_option(name, imp.OPT_CHILDREN_Y)) {
		output[imp.OPT_CHILDREN_Y] = imp.get_value_option(name, imp.OPT_CHILDREN_Y);
	}
	


	if (type != imp.TYPE_TEXT) {
		var path = imp.get_value_option_safe(name, imp.OPT_PATH);
		var startSlash = path.substr(0, 1) == '/';
		path = imp.removePathSlash(path);
		

		output[imp.OPT_PATH] = "";
		if (!startSlash && parentItem != null && parentItem.path != "") {
			output[imp.OPT_PATH] += parentItem.path;
			if (path != "") output[imp.OPT_PATH] += "/";
		}
		output[imp.OPT_PATH] += path;
	}
	
	
	
	if(type == imp.TYPE_GFX){
		imp.setItemPath(output);
	}
	
	
	
	if (type == imp.TYPE_CONTAINER) {
		output[imp.OPT_EQUALOFFSET] = imp.get_value_option_safe(name, imp.OPT_EQUALOFFSET);
	}
	
	
	
	if([imp.TYPE_GFX, imp.TYPE_SHAPE, imp.TYPE_CONTAINER].indexOf(type) > -1){
		output[imp.OPT_BGPARENT] = imp.get_value_option_safe(name, imp.OPT_BGPARENT);
		output[imp.OPT_BGPARENT] = (output[imp.OPT_BGPARENT] == "1");
	}
	
	
	if (type == imp.TYPE_GFX) {

		output[imp.OPT_GFX_TYPE] = imp.get_value_option_safe(name, imp.OPT_GFX_TYPE);
		if (output[imp.OPT_GFX_TYPE] == "") output[imp.OPT_GFX_TYPE] = "layout";	//layout/data
		
		if (output[imp.OPT_BGPARENT]) {
			parentItem[imp.OPT_PATH] = output[imp.OPT_PATH];
			parentItem[imp.OPT_FILENAME] = output[imp.OPT_NAME];
			if(output.shadow) parentItem.shadow = output.shadow;
			if(output[imp.OPT_IMGTYPE]) parentItem[imp.OPT_IMGTYPE] = output[imp.OPT_IMGTYPE];
			else parentItem[imp.OPT_IMGTYPE] = 'png';
			parentItem.has_graphic = true;
			output["disable"] = true;
			
			imp.setItemPath(parentItem);
		}
		
		
		var filter = [
			'bgColor',
			'bgGradient',
		];
		
		//added for : border and radius
		output["shapedata"] = imp.getShapeData(layer, output.widthPx, output.heightPx, filter);
		
		for(var k in output["shapedata"]){
			if(filter.indexOf(k) > -1) delete output["shapedata"][k];
		}
		
		
	}


          

	//font information (regroupées en un objet) pour type TXT
	if (type == imp.TYPE_TEXT) {
		
		output["textdata"] = imp.getTextData(layer);
	}
	
	if (type == imp.TYPE_SHAPE) {
		
		output["shapedata"] = imp.getShapeData(layer, output.widthPx, output.heightPx);
		
		if (output[imp.OPT_BGPARENT]) {
			parentItem.shapedata = output.shapedata;
			if(output.shadow) parentItem.shadow = output.shadow;
			output["disable"] = true;
		}
		
	}
	
	
	//inline svg
	if(type == imp.TYPE_GFX && output[imp.OPT_IMGTYPE]=='svg-inline'){
		
		output["pathdata"] = imp.getPathData(layer);
		trace('pathdata : '+output["pathdata"]);
		//maybe refactor later in list of PathData object
	}
	
	
	//fait ici car ça concerne le parent, trop tard dans getLayoutData
	//set parent flex if col / centery
	if(output[imp.OPT_POSITION] == 'static'){
		if(parentItem && parentItem[imp.OPT_DIRECTION] == 'col'){
			if(output[imp.OPT_LAYOUT_Y] == 'center'){
				parentItem.display = 'flex';
			}
		}
	}
	
	
	
	//rotation
	/* 
	var rotation = imp.getRotation(layer);
	if(rotation != 0){
		
		throw new Error('rotation : '+rotation);
	}
	 */
	
	
	
	var tag;
	if(type == imp.TYPE_CONTAINER) tag = 'div';
	else if(type == imp.TYPE_GFX && output[imp.OPT_IMGTYPE]=='svg-inline') tag = 'svg';
	else if(type == imp.TYPE_GFX && output[imp.OPT_PLACEHOLDER]) tag = 'img';
	else if(type == imp.TYPE_GFX) tag = 'div';
	else if(type == imp.TYPE_SHAPE) tag = 'div';
	else if(type == imp.TYPE_TEXT) tag = 'p';
	else throw new Error('type unknown : '+type);
	output[imp.OPT_TAG] = tag;
	
	if (imp.has_option(name, imp.OPT_TAG)) {
		output[imp.OPT_TAG] = imp.get_value_option(name, imp.OPT_TAG);
	}
	
	
	
	
	
	//paddings
	if(parentItem){
		
		if(output[imp.OPT_POSITION] == 'static' && !output[imp.OPT_BGPARENT]){
			
			if(output[imp.OPT_LAYOUT_X] != 'right'){
				if(!parentItem.hasOwnProperty("p_left")) parentItem["p_left"] = output.position[0];
				else if(output.position[0] < parentItem["p_left"]) parentItem["p_left"] = output.position[0];
			}
			
			if(output[imp.OPT_LAYOUT_Y] != 'bottom'){
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


//___________________________________________________________________

module.exports = {
	recursive_loop,
	create_item,
}

