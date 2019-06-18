var imp = {};
const file_debug = require('./debug.js');
imp = {...imp, ...file_debug};
var trace = file_debug.trace;
var tracerec = file_debug.tracerec;

const file_platform_layer_logic = require('./platform_layer_logic.js');
imp = {...imp, ...file_platform_layer_logic};
var getLayersArray = file_platform_layer_logic.getLayersArray;
var isLayerVisible = file_platform_layer_logic.isLayerVisible;
var isLayerContainer = file_platform_layer_logic.isLayerContainer;
var getLayerName = file_platform_layer_logic.getLayerName;

const file_utils = require('./utils.js');
imp = {...imp, ...file_utils};
var has_prefix = file_utils.has_prefix;
var has_option = file_utils.has_option;
var get_value_option = file_utils.get_value_option;
var get_value_option_safe = file_utils.get_value_option_safe;
var get_forced_type = file_utils.get_forced_type;
var get_type = file_utils.get_type;
var removePathSlash = file_utils.removePathSlash;
var getPercentValue = file_utils.getPercentValue;
var handleShorcuts = file_utils.handleShorcuts;

const file_errors_utils = require('./errors_utils.js');
imp = {...imp, ...file_errors_utils};
var check_error_layername = file_errors_utils.check_error_layername;
var check_error_item = file_errors_utils.check_error_item;

const file_constantes = require('./constantes.js');
imp = {...imp, ...file_constantes};
var CONTAINERS_TYPE = file_constantes.CONTAINERS_TYPE;
var EXPORTS_TYPE = file_constantes.EXPORTS_TYPE;
var OPT_TYPE = file_constantes.OPT_TYPE;
var OPT_PATH = file_constantes.OPT_PATH;
var OPT_FILENAME = file_constantes.OPT_FILENAME;
var OPT_NAME = file_constantes.OPT_NAME;
var OPT_BGPARENT = file_constantes.OPT_BGPARENT;
var OPT_GFX_TYPE = file_constantes.OPT_GFX_TYPE;
var OPT_POSITION = file_constantes.OPT_POSITION;
var OPT_DIRECTION = file_constantes.OPT_DIRECTION;
var OPT_LAYOUT_X = file_constantes.OPT_LAYOUT_X;
var OPT_LAYOUT_Y = file_constantes.OPT_LAYOUT_Y;
var OPT_POS_X = file_constantes.OPT_POS_X;
var OPT_POS_Y = file_constantes.OPT_POS_Y;
var OPT_EQUALOFFSET = file_constantes.OPT_EQUALOFFSET;
var TYPE_GFX = file_constantes.TYPE_GFX;
var TYPE_TEXT = file_constantes.TYPE_TEXT;
var TYPE_CONTAINER = file_constantes.TYPE_CONTAINER;
var EXPORT_FOLDER = file_constantes.EXPORT_FOLDER;
var EXPORT_FOLDER_IMG = file_constantes.EXPORT_FOLDER_IMG;

const file_platform_layer_utils = require('./platform_layer_utils.js');
imp = {...imp, ...file_platform_layer_utils};
var getFontSize = file_platform_layer_utils.getFontSize;
var getBounds = file_platform_layer_utils.getBounds;

const file_platform_export = require('./platform_export.js');
imp = {...imp, ...file_platform_export};
var fileExist = file_platform_export.fileExist;
var saveLayer = file_platform_export.saveLayer;







async function recursive_loop(container, parentItem, parentLayer, level, params, paramscopy) {
	
	tracerec("recursive_loop", level);
	

	var layers = getLayersArray(container);
	var len = layers.length;
	// trace('layers : '+layers);
	
	var allCenterX = true;
	var allCenterY = true;
	

	for (var _i = 0; _i < len; _i++) {

		// var i = _i;
		var i =  len - 1 - _i;
		var i2 = _i;
		
		tracerec('_____________________________________ _i : '+_i, level);
		
		var layer = layers[i];

		var enable = isLayerVisible(layer);
		if (!enable) continue;

		var isContainer = isLayerContainer(layer);
		var name = getLayerName(layer);
		tracerec('name : '+name, level);
		
		


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

		var parentitemname = (parentItem) ? parentItem.name : "";
		
		// tracerec('type : '+type+', parentitemname : '+parentitemname, level);

		if (type != "") {

			var item = create_item(layer, name, type, parentItem, level, i2, params);
			type = item[imp.OPT_TYPE];
			tracerec("item type : " + type + ", name: " + item.name + ", path : " + item.path + ", width : " + Math.round(item.widthPx) + ", height : " + Math.round(item.height), level);
			
			
			var errors = check_error_item(name, item);
			tracerec('errors.length : '+errors.length, level);
			
			
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
				
				var path = EXPORT_FOLDER + "/" + EXPORT_FOLDER_IMG + "/";
				if (item.path != "") path += item.path + "/";
				path += item[OPT_FILENAME];
				tracerec("path : "+path, level);
				
				
				if ((params.overwrite || !fileExist(path, params.exportPath)) && imp.ENABLE_EXPORT) {
					
					var bounds = null;
					if (parentItem && parentItem[OPT_EQUALOFFSET] == 1) {
						bounds = parentItem.bounds;
					}

					let imgtype = item[imp.OPT_IMGTYPE];
					await saveLayer(layer, path, params.exportPath, false, bounds, imgtype, params.config);
					
					
				}

			}

		}
		
		
		if (isContainer && CONTAINERS_TYPE.indexOf(type) != -1) {
			
			parentLayer = null;	//never used
			tracerec("rec type : " + type, level);

			var newParentItem = parentItem;
			if (CONTAINERS_TYPE.indexOf(type) != -1) newParentItem = item;

			await recursive_loop(layer, newParentItem, parentLayer, level + 1, params, paramscopy);
			
		}
		
		
	}
	
	
	//for padding cancelations
	if(parentItem){
		parentItem['allCenterX'] = allCenterX;
		parentItem['allCenterY'] = allCenterY;
		
	}
	
	
	
	
	
	
	//error positionning
	
	let isParentTemplate = (imp.getParentsProperty(item, imp.OPT_TPL));
	tracerec("isParentTemplate : " + isParentTemplate, level);
	
	if(!isParentTemplate){
		let errors2 = imp.check_error_item2(parentItem);
		if (errors2.length > 0) {
			tracerec("errors2 : " + errors2, level);
			params.listErrors = params.listErrors.concat(errors2);
		}
	}
	
	
	
	
	//count tags number in sibblings
	let listitems;
	if (parentItem) listitems = parentItem.childrens;
	else listitems = params.listItem;
	let _len = listitems.length;
	let listtags = listitems.map(item => item.tag);
	
	for (var _i = 0; _i < _len; _i++) {
		let item = listitems[_i];
		let count = 0;
		let countBefore = 0;
		listtags.forEach((tag, index) => {
			if(tag == item.tag){
				count++;
				if(index < _i) countBefore++;
			}
		});
		item.countTag = count;
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
	if (has_option(name, imp.OPT_TPL)) {
		var val = get_value_option(name, imp.OPT_TPL);
		output[imp.OPT_TPL] = val;
	}
	if (has_option(name, imp.OPT_TPLMODEL)) {
		var val = get_value_option(name, imp.OPT_TPLMODEL);
		output[imp.OPT_TPLMODEL] = val;
	}
	
	
	
	//placeholders
	if (has_option(name, imp.OPT_PLACEHOLDER)) {
		var val = get_value_option(name, imp.OPT_PLACEHOLDER);
		output[imp.OPT_PLACEHOLDER] = val;
	}
	
	
	
	
	//templateMode
	
	let isTemplate = ((output[imp.OPT_TPL]) || (imp.getParentsProperty(output, imp.OPT_TPL)));
	let isTemplateModel = ((output[imp.OPT_TPLMODEL]) || (imp.getParentsProperty(output, imp.OPT_TPLMODEL)));
	
	let templateMode = '';
	if(isTemplate){
		templateMode = 'read';
		output['tplparent'] = isTemplate;
	}
	else if(isTemplateModel){
		templateMode = 'write';
		output['tplparent'] = isTemplateModel;
		if(output[imp.OPT_TPLMODEL]) output['tplmodelIndent'] = output.indent;
		else output['tplmodelIndent'] = imp.getParentsProperty(output, 'tplmodelIndent');
		tracerec('tplmodelIndent : '+output.tplmodelIndent, level);
	}
	output['templateMode'] = templateMode;
	
	
	
	tracerec('isTemplate : '+isTemplate+', isTemplateModel : '+isTemplateModel, level);
	tracerec('templateMode : '+templateMode, level);
	
	
	
	if(isTemplateModel && output[imp.OPT_PLACEHOLDER]){
		
		imp.saveTemplateItem(isTemplateModel, output[imp.OPT_PLACEHOLDER], output);
	}
	else if(isTemplate && output[imp.OPT_PLACEHOLDER]){
		
		var itemmodel = imp.getTemplateItem(isTemplate, output[imp.OPT_PLACEHOLDER]);
		if(itemmodel){
			output[imp.OPT_TYPE] = itemmodel[imp.OPT_TYPE];
			output[imp.OPT_IMGTYPE] = itemmodel[imp.OPT_IMGTYPE];
			trace('model type : '+itemmodel[imp.OPT_TYPE]+', imgtype : '+itemmodel[imp.OPT_IMGTYPE]);
			type = output[imp.OPT_TYPE];
		}
	}
	
	
	
	
	
	/* 
	if(output[imp.OPT_PLACEHOLDER] && output[imp.OPT_PLACEHOLDER].substr(0, 3) == 'img'){
		type = imp.TYPE_GFX;
		output[OPT_TYPE] = type;
	}
	 */
	
	
	//lvl
	if (has_option(name, imp.OPT_LVL)) {
		var val = get_value_option(name, imp.OPT_LVL);
		output[imp.OPT_LVL] = val;
	}
	
	
	//output.layerName = name;
	output[OPT_NAME] = get_value_option_safe(name, OPT_NAME);
	
	//if &-name and parent.useTag => parent.useTag = false
	tracerec('useTag : '+(parentItem && parentItem.useTag)+',  : charAt : "'+output[OPT_NAME].charAt(0)+'"');
	if(parentItem && parentItem.useTag && output[OPT_NAME].charAt(0) == "&"){
		parentItem.useTag = false;
	}
	
	output[OPT_NAME] = imp.decodeNameParentRef(output[OPT_NAME], parentItem);
	
	
	
	
	if (output[OPT_NAME] == "") {
		output[OPT_NAME] = imp.generateItemName(parentItem, type, index, 'name');
		output.useTag = true;
		
	}
	
	if (has_option(name, imp.OPT_FILENAME)) {
		output[imp.OPT_FILENAME] = get_value_option(name, imp.OPT_FILENAME);
	}
	else{
		if(output[imp.OPT_PLACEHOLDER]) output[OPT_FILENAME] = imp.generateItemName(parentItem, type, index, 'filename');
		else output[OPT_FILENAME] = output[OPT_NAME];
	}
	

	var bounds = getBounds(layer, type);
	// var bounds_l = imp.getBoundsLocal(layer, type);
	output.bounds = bounds;
	
	// tracerec('bounds l : '+bounds_l.map(item => Math.round(item)).join(', '), level);
	// tracerec('bounds g : '+bounds.map(item => Math.round(item)).join(', '), level);
	
		
	var x1 = Math.round(bounds[0]);
	var y1 = Math.round(bounds[1]);
	var x2 = Math.round(bounds[2]);
	var y2 = Math.round(bounds[3]);
	
	
	output.position = [x1, y1];
	
	output.widthPx = Math.round(bounds[4]);
	output.heightPx = Math.round(bounds[5]);
	
	
	if (has_option(name, OPT_POS_X)) output.position[0] = get_value_option(name, OPT_POS_X);
	if (has_option(name, OPT_POS_Y)) output.position[1] = get_value_option(name, OPT_POS_Y);
	
	
	
	
	
	
	if (has_option(name, imp.OPT_IMGTYPE)) {
		var val = get_value_option(name, imp.OPT_IMGTYPE);
		output[imp.OPT_IMGTYPE] = val;
	}
	else if(type == imp.TYPE_GFX && !output[imp.OPT_IMGTYPE]){
		output[imp.OPT_IMGTYPE] = imp.get_natural_imgtype(layer);
		if(!output[imp.OPT_IMGTYPE]) output[imp.OPT_IMGTYPE] = 'png';
	}
	
	
	
	
	let shadow = imp.getShadowData(layer);
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

		var parentsize = parentItem ? parentItem.widthPx : imp.DOC_WIDTH;
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

		var parentsize = parentItem ? parentItem.heightPx : imp.DOC_HEIGHT;
		if (layout == "bottom"){
			output.margin_bottom = parentsize - (output.position[1] + output.heightPx);
			// output[OPT_POSITION] = "absolute";
		}
		output[OPT_LAYOUT_Y] = layout;
	}
	else output[OPT_LAYOUT_Y] = "top";
	
	
	
	
	//children layout
	
	if (has_option(name, imp.OPT_CHILDREN_X)) {
		output[imp.OPT_CHILDREN_X] = get_value_option(name, imp.OPT_CHILDREN_X);
	}
	if (has_option(name, imp.OPT_CHILDREN_Y)) {
		output[imp.OPT_CHILDREN_Y] = get_value_option(name, imp.OPT_CHILDREN_Y);
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
	
	
	
	if(type == imp.TYPE_GFX){
		var path = output.path;
		if(path != "") path += "/";
		path += output.filename;
		output.fullpath_noext = path;
		path += "." + output[imp.OPT_IMGTYPE];
		
		output.fullpath = path;
	}
	
	
	
	
	
	if (type == TYPE_CONTAINER) {
		output[OPT_EQUALOFFSET] = get_value_option_safe(name, OPT_EQUALOFFSET);
	}
	
	
	
	if([TYPE_GFX, imp.TYPE_SHAPE, TYPE_CONTAINER].indexOf(type) > -1){
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
			if(output[imp.OPT_IMGTYPE]) parentItem[imp.OPT_IMGTYPE] = output[imp.OPT_IMGTYPE];
			parentItem.has_graphic = true;
			output["disable"] = true;
		}
		
		//added for : border and radius
		output["shapedata"] = imp.getShapeData(layer, output.widthPx, output.heightPx, filter);
		
		var filter = [
			'bgColor',
			'bgGradient',
		];
		
		for(var k in output["shapedata"]){
			if(filter.indexOf(k) > -1) delete output["shapedata"][k];
		}
		
		
	}


          

	//font information (regroupées en un objet) pour type TXT
	if (type == TYPE_TEXT) {
		
		output["textdata"] = imp.getTextData(layer);
	}
	
	if (type == imp.TYPE_SHAPE) {
		
		output["shapedata"] = imp.getShapeData(layer, output.widthPx, output.heightPx);
		
		if (output[OPT_BGPARENT]) {
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
	if(output[OPT_POSITION] == 'static'){
		if(parentItem && parentItem[OPT_DIRECTION] == 'col'){
			if(output[OPT_LAYOUT_Y] == 'center'){
				parentItem.display = 'flex';
			}
		}
	}
	
	
	
	//rotation
	/* 
	let rotation = imp.getRotation(layer);
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
	
	if (has_option(name, imp.OPT_TAG)) {
		output[imp.OPT_TAG] = get_value_option(name, imp.OPT_TAG);
	}
	
	
	
	
	
	//paddings
	if(parentItem){
		
		if(output[OPT_POSITION] == 'static' && !output[OPT_BGPARENT]){
			
			if(output[imp.OPT_LAYOUT_X] != 'right'){
				if(!parentItem.hasOwnProperty("p_left")) parentItem["p_left"] = output.position[0];
				else if(output.position[0] < parentItem["p_left"]) parentItem["p_left"] = output.position[0];
			}
			
			if(output[imp.OPT_LAYOUT_Y] != 'bottom'){
				if(!parentItem.hasOwnProperty("p_top")) parentItem["p_top"] = output.position[1];
				else if(output.position[1] < parentItem["p_top"]) parentItem["p_top"] = output.position[1];
			}
			
			let p_right = parentItem.widthPx - (output.position[0] + output.widthPx);
			let p_bottom = parentItem.heightPx - (output.position[1] + output.heightPx);
			
			if(!parentItem.hasOwnProperty("p_right")) parentItem["p_right"] = p_right;
			else if(p_right < parentItem["p_right"]) parentItem["p_right"] = p_right;
			
			if(!parentItem.hasOwnProperty("p_bottom")) parentItem["p_bottom"] = p_bottom;
			else if(p_bottom < parentItem["p_bottom"]) parentItem["p_bottom"] = p_bottom;
			
			
		}
		
		
	}
	
	
	
	return output;
}




module.exports = {
	recursive_loop,
	create_item,
}

