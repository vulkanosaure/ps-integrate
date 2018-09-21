#include "constantes.jsx";
#include "debug.jsx";
#include "utils.jsx";
#include "layers.jsx";
#include "export.jsx";
#include "dialog.jsx";
#include "layer-utils.jsx";
#include "errors-utils.jsx";
#include "template-utils.jsx";
#include "template.jsx";
#include "template-functions.jsx";
#include "lib/jamJSON.jsx";



for (var i = 0; i < 5; i++) trace(".");
trace("===========================");


var doc = app.activeDocument;
trace("doc : " + doc);

var DOC_WIDTH = getUnitValue(doc.width);
var DOC_HEIGHT = getUnitValue(doc.height);

trace("doc width/height : " + DOC_WIDTH + " / " + DOC_HEIGHT);

/*
//var exportPath = activeDocument.path;
var exportPath = Folder.userData;
trace("exportPath : "+exportPath);
*/
var overwrite;
var listErrors = [];
var listItem = [];
var globalSettings;


function testrec(container) {
    
	var layers = container.layers;	//+0

	var len = layers.length;		//+4

	for (var i = 0; i < len; i++) {
		var layer = layers[i];		//+26

		var isContainer = (layer.typename == "LayerSet");		//+0
		if (layer.visible && isContainer) {
			testrec(layer);
		}

	}
}






function recursive_loop(container, parentItem, parentLayer, level) {
	//tracerec("recursive_loop", level);

	var layers = container.layers;
	var len = layers.length;

	for (var _i = 0; _i < len; _i++) {

		var i;
		if (globalSettings.indexTpl == 0) i = _i;
		else i = len - 1 - _i;


		var layer = layers[i];

		var enable = (layer.visible);
		if (!enable) continue;

		var isContainer = (layer.typename == "LayerSet");
		var name = layer.name;


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

		//var parentlayername = (parentLayer) ? parentLayer.name : "";
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

			if (EXPORTS_TYPE.indexOf(type) != -1) {

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

		if (isContainer && (type == "" || CONTAINERS_TYPE.indexOf(type) != -1)) {

			//parentLayer = layer;
			parentLayer = null;
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

	if (parentItem != null) {


		var x1 = getUnitValue(bounds[0]);
		var y1 = getUnitValue(bounds[1]);
		var x2 = getUnitValue(bounds[2]);
		var y2 = getUnitValue(bounds[3]);

		if (x1 < 0) x1 = 0;
		if (y1 < 0) y1 = 0;

		output.position = [x1, y1];
		output.width = x2 - x1;
		output.height = y2 - y1;

		trace("output.width : " + output.width + ", output.height:  " + output.height);
		trace("getUnitValue(bounds[2]) : " + getUnitValue(bounds[2]) + ", getUnitValue(bounds[0]:  " + getUnitValue(bounds[0]));
	}
	else {
		output.position = [0, 0];
		output.width = DOC_WIDTH;
		output.height = DOC_HEIGHT;
	}

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


	tracerec("item " + name + ", parentItem : " + ((parentItem) ? parentItem.name : "") + ", position : " + output.position, level);

	//save pos absolute
	output.position_abs = [output.position[0], output.position[1]];

	//substract parent position
	if (parentItem) {
		output.position[0] -= parentItem.position_abs[0];
		output.position[1] -= parentItem.position_abs[1];
	}




	//layout
	output.margin_left = output.position[0];
	if (has_option(name, OPT_LAYOUT_X)) {
		var layout = get_value_option(name, OPT_LAYOUT_X);

		var parentsize = parentItem ? parentItem.width : DOC_WIDTH;
		if (layout == "right") output.margin_right = parentsize - (output.position[0] + output.width);
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
		if (layout == "bottom") output.margin_bottom = parentsize - (output.position[1] + output.height);
		else if (layout == "center") {
			output.center_v = Math.round(output.position[1] / (parentsize - output.height) * 100);
			if (isNaN(output.center_v)) output.center_v = 0.5;
		}

		output[OPT_LAYOUT_Y] = layout;
	}
	else output[OPT_LAYOUT_Y] = "top";





	if (type != TYPE_TEXT) {

		var path = get_value_option_safe(name, OPT_PATH);
		path = removePathSlash(path);

		output[OPT_PATH] = "";
		if (parentItem != null && parentItem.path != "") {
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
		var ti = layer.textItem;

		var textdata = {};
		trace("name : " + name + ", kind : " + layer.kind);
		try {
			textdata.color = ti.color.rgb.hexValue;
		}
		catch (e) {
			textdata.color = 0x888888;
		}

		textdata.font = ti.font;
		textdata.size = Math.round(ti.size.value);
		textdata.text = ti.contents.replace(/\r/g, "\\n");
		//textdata.uppercase = (ti.capitalization == "TextCase.ALLCAPS");



		tracerec("textItem : " + layer.textItem + ", " + textdata.text, level);

		try { textdata.leading = Math.round(getUnitValue(ti.leading)); } catch (e) { };
		trace("textdata.leading : " + textdata.leading);

		try { textdata.letterspacing = ti.tracking; } catch (e) { textdata.letterspacing = 0; };

		try {
			var justification = ti.justification;
			if (justification == "Justification.CENTER") textdata.halign = "center";
			else if (justification == "Justification.CENTERJUSTIFIED") textdata.halign = "center";
			else if (justification == "Justification.LEFT") textdata.halign = "left";
			else if (justification == "Justification.LEFTJUSTIFIED") textdata.halign = "left";
			else if (justification == "Justification.RIGHT") textdata.halign = "right";
			else if (justification == "Justification.RIGHTJUSTIFIED") textdata.halign = "right";
			else textdata.halign = "left";
		}
		catch (e) { textdata.halign = "left"; };

		trace("textdata.halign : " + textdata.halign);

		output["textdata"] = textdata;

	}
	
	

	output.parent = parentItem;

	return output;
}





function get_type(layer, name, isroot, level) {
	var forced_type = get_forced_type(name);
	if (forced_type != "") return forced_type;

	if (!isroot || has_prefix(name)) {
		var natural_type = get_natural_type(layer);
		if (natural_type != TYPE_CONTAINER || has_prefix(name)) return natural_type;
		else return "";
	}
	return "";
}



function main(settings) {
	trace("main, settings.overwrite :" + settings.overwrite);


	globalSettings = settings;
	if (settings.overwrite == undefined) settings.overwrite = false;

	exportPath = settings.destination;
	overwrite = settings.overwrite;

	if (overwrite) {
		var exportFolder = new Folder(exportPath + "/" + EXPORT_FOLDER);
		exportFolder.remove();

	}

	/* 
	//trace("layers : "+layers);
	//testrec(doc);
	traverseLayersAMFlat(doc, function(doc, layer){
		trace("layer.name : "+layer.name);
	});
	trace("layers.len : "+layers.length);
	showDialogOK();
	return;
	*/

	recursive_loop(doc, null, null, 0);
	var l = listErrors;
	//trace("listErrors : "+listErrors);



	//generation des templates

	var tpl_id = tpl_ids[settings.indexTpl];


	var config_str = loadFilePath("templates/" + tpl_id + "/config.json");
	var config = jamJSON.parse(config_str, true);
	var templates;
	templates = generate_template(listItem, tpl_id, config);

	//ecritures des templates

	for (var i = 0; i < templates.length; i++) {

		var tpl = templates[i];
		var path2 = EXPORT_FOLDER + "/" + tpl_id + "/";
		createFile(exportPath, path2 + tpl.filename, tpl.content);

	}

	if (listErrors.length > 0) {
		showDialogError(listErrors);
		createErrorFile(listErrors);
	}
	else showDialogOK();

}





var tpl_ids = get_tpl_ids();
//var tpl_labels = ["HTML / CSS", "OpenFL - Starling"];
var tpl_labels = tpl_ids;

if (DEBUG_MODE && false) {
	var settings = {
		overwrite: false,
		destination: activeDocument.path,
		indexTpl: 1,
	};
	main(settings);
}
else showDialog(main, tpl_labels);

/* 
var proptest = "ps--gfx--center--bgparent"; 
var proptest2 = "ps--centery";
var proptest3 = "ps--center--bgparent--btnc";

trace("shorcut 1 : "+handleShorcuts(proptest));
trace("shorcut 2 : "+handleShorcuts(proptest2));
trace("shorcut 3 : "+handleShorcuts(proptest3));

trace("activeDocument.path : "+activeDocument.path);
//main({destination : activeDocument.path, indexTpl : 1, overwrite:false});
 */


