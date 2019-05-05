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
var BTNS_TYPE = file_constantes.BTNS_TYPE;
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
var OPT_ALIGN_ITEMS = file_constantes.OPT_ALIGN_ITEMS;
var OPT_POS_X = file_constantes.OPT_POS_X;
var OPT_POS_Y = file_constantes.OPT_POS_Y;
var OPT_WIDTH = file_constantes.OPT_WIDTH;
var OPT_HEIGHT = file_constantes.OPT_HEIGHT;
var OPT_EQUALOFFSET = file_constantes.OPT_EQUALOFFSET;
var OPT_DOEXPORT = file_constantes.OPT_DOEXPORT;
var TYPE_GFX = file_constantes.TYPE_GFX;
var TYPE_TEXT = file_constantes.TYPE_TEXT;
var TYPE_BTN = file_constantes.TYPE_BTN;
var TYPE_BTNC = file_constantes.TYPE_BTNC;
var TYPE_CONTAINER = file_constantes.TYPE_CONTAINER;
var EXPORT_FOLDER = file_constantes.EXPORT_FOLDER;
var EXPORT_FOLDER_IMG = file_constantes.EXPORT_FOLDER_IMG;
var DEBUG_MODE = file_constantes.DEBUG_MODE;

const file_platform_layer_utils = require('./platform_layer_utils.js');
imp = {...imp, ...file_platform_layer_utils};
var getFontSize = file_platform_layer_utils.getFontSize;
var getBounds = file_platform_layer_utils.getBounds;

const file_platform_export = require('./platform_export.js');
imp = {...imp, ...file_platform_export};
var fileExist = file_platform_export.fileExist;
var saveLayer = file_platform_export.saveLayer;

trace('imp : '+imp.ENABLE_EXPORT); 






async function recursive_loop(container, parentItem, parentLayer, level, params) {
	tracerec("recursive_loop", level);
	

	var layers = getLayersArray(container);
	var len = layers.length;
	// trace('layers : '+layers);
	

	for (var _i = 0; _i < len; _i++) {

		var i;
		/* 
		if (params.settings.indexTpl == 0) i = _i;
		else i = len - 1 - _i;
		 */
		i = _i;
		
		tracerec('_____________________________________ _i : '+_i, level);
		
		var layer = layers[i];

		var enable = isLayerVisible(layer);
		if (!enable) continue;

		var isContainer = isLayerContainer(layer);
		var name = getLayerName(layer,);
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
		
		tracerec('type : '+type+', parentitemname : '+parentitemname, level);

		if (type != "") {

			var item = create_item(layer, name, type, parentItem, level, i);
			tracerec("item type : " + type + ", name: " + item.name + ", path : " + item.path + ", btnc : " + item.btnc + ", width : " + Math.round(item.width) + ", height : " + Math.round(item.height), level);

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

			if (EXPORTS_TYPE.indexOf(type) != -1 && item[OPT_DOEXPORT]) {
				
				item.has_graphic = true;
				var path = EXPORT_FOLDER + "/" + EXPORT_FOLDER_IMG + "/";
				if (item.path != "") path += item.path + "/";
				path += item[OPT_FILENAME];
				//tracerec("path : "+path, level);
				
				
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
		
		// tracerec('isContainer : '+isContainer, level);

		if (isContainer && CONTAINERS_TYPE.indexOf(type) != -1) {
			
			parentLayer = null;	//never used
			tracerec("reccc type : " + type, level);

			var newParentItem = parentItem;
			if (CONTAINERS_TYPE.indexOf(type) != -1) newParentItem = item;

			await recursive_loop(layer, newParentItem, parentLayer, level + 1, params);
			
		}
		
		
	}
	
	
	
}






function create_item(layer, name, type, parentItem, level, index) {
	
	// trace("create_item");
	var output = {};


	if (CONTAINERS_TYPE.indexOf(type) != -1) output.childrens = [];
	output[OPT_TYPE] = type;
	
	//output.layerName = name;
	output[OPT_NAME] = get_value_option_safe(name, OPT_NAME);
	output[OPT_NAME] = imp.decodeNameParentRef(output[OPT_NAME], parentItem);
	
	
	if (output[OPT_NAME] == "") {
		// output[OPT_NAME] = "" + type + "-" + getLayerId(app.activeDocument, layer);
		
		if(parentItem) output[OPT_NAME] += parentItem.name;
		else output[OPT_NAME] += type;
		output[OPT_NAME] += '-' + index;
		
	}
	
	
	output[OPT_FILENAME] = output[OPT_NAME];

	// var bounds = layer.bounds;
	var bounds = getBounds(layer, type);
	output.bounds = bounds;
	// tracerec('bounds : '+output.bounds, level);

	// if (parentItem != null) {
	if (true) {
		
		var x1 = bounds[0];
		var y1 = bounds[1];
		var x2 = bounds[2];
		var y2 = bounds[3];
		
		x1 = Math.round(x1);
		x2 = Math.round(x2);
		y1 = Math.round(y1);
		y2 = Math.round(y2);

		if (x1 < 0) x1 = 0;
		if (y1 < 0) y1 = 0;
		
		tracerec(output[OPT_NAME]+" :: x, y : "+x1+", "+y1, level);

		output.position = [x1, y1];
		output.width = x2 - x1;
		output.height = y2 - y1;
		/* 
		trace("output.width : " + output.width + ", output.height:  " + output.height);
		trace("bounds[2] : " + bounds[2] + ", bounds[0]:  " + bounds[0]);
		trace("bounds[3] : " + bounds[3] + ", bounds[1]:  " + bounds[1]);
		 */
	}
	
	if (has_option(name, OPT_POS_X)) output.position[0] = get_value_option(name, OPT_POS_X);
	if (has_option(name, OPT_POS_Y)) output.position[1] = get_value_option(name, OPT_POS_Y);
	
	

	if (has_option(name, OPT_WIDTH)) {
		var val = get_value_option(name, OPT_WIDTH);
		val = getPercentValue(val) / 100;
		output[OPT_WIDTH] = Math.round(val * imp.DOC_WIDTH);
	}
	if (has_option(name, OPT_HEIGHT)) {
		var val = get_value_option(name, OPT_HEIGHT);
		val = getPercentValue(val) / 100;
		output[OPT_HEIGHT] = Math.round(val * imp.DOC_HEIGHT);
	}
	
	if (has_option(name, OPT_DOEXPORT)) {
		var val = get_value_option(name, OPT_DOEXPORT);
		if(val == "!export") val = false;
		else val = true;
		output[OPT_DOEXPORT] = val;
	}
	else output[OPT_DOEXPORT] = true;
	
	
	if (has_option(name, imp.OPT_IMGTYPE)) {
		var val = get_value_option(name, imp.OPT_IMGTYPE);
		output[imp.OPT_IMGTYPE] = val;
	}
	else if(type == imp.TYPE_GFX){
		output[imp.OPT_IMGTYPE] = imp.get_natural_imgtype(layer);
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
		// trace('minus parent w - '+parentItem.position_abs[0]+' : '+output.position[0]);
		// trace('minus parent h - '+parentItem.position_abs[1]+' : '+output.position[1]);
		// trace('parent : '+parentItem[OPT_NAME]);
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

		var parentsize = parentItem ? parentItem.width : imp.DOC_WIDTH;
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

		var parentsize = parentItem ? parentItem.height : imp.DOC_HEIGHT;
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
	
	
	
	if([TYPE_GFX, imp.TYPE_SHAPE].indexOf(type) > -1){
		output[OPT_BGPARENT] = get_value_option_safe(name, OPT_BGPARENT);
		output[OPT_BGPARENT] = (output[OPT_BGPARENT] == "1");
	}
	
	
	if (type == TYPE_GFX) {

		output[OPT_GFX_TYPE] = get_value_option_safe(name, OPT_GFX_TYPE);
		if (output[OPT_GFX_TYPE] == "") output[OPT_GFX_TYPE] = "layout";	//layout/data
		
		if (output[OPT_BGPARENT]) {
			parentItem[OPT_PATH] = output[OPT_PATH];
			parentItem[OPT_FILENAME] = output[OPT_NAME];
			if(output[imp.OPT_IMGTYPE]) parentItem[imp.OPT_IMGTYPE] = output[imp.OPT_IMGTYPE];
			parentItem.has_graphic = true;
			output["disable"] = true;
		}
	}


          

	//font information (regroupées en un objet) pour type TXT
	if (type == TYPE_TEXT) {
		
		output["textdata"] = imp.getTextData(layer);
		//if layoutx set (ex centerx), override align
		if (has_option(name, OPT_LAYOUT_X)) {
			output["textdata"].halign = output[OPT_LAYOUT_X];
		}
	}
	
	if (type == imp.TYPE_SHAPE) {
		
		output["shapedata"] = imp.getShapeData(layer, output.width, output.height);
		
		if (output[OPT_BGPARENT]) {
			parentItem.shapedata = output.shapedata;
			output["disable"] = true;
		}
		
	}
	
	

	output.parent = parentItem;

	return output;
}




module.exports = {
	recursive_loop,
	create_item,
}

