#include "constantes.jsx";
#include "debug.jsx";
#include "utils.jsx";
#include "export.jsx";
#include "dialog.jsx";
#include "template-utils.jsx";
#include "template.jsx";


for(var i=0; i<5; i++) trace(".");
trace("===========================");


var doc = app.activeDocument;
trace("doc : "+doc);

var DOC_WIDTH = getUnitValue(doc.width);
var DOC_HEIGHT = getUnitValue(doc.height);

trace("doc width/height : "+DOC_WIDTH+" / "+DOC_HEIGHT);

/*
//var exportPath = activeDocument.path;
var exportPath = Folder.userData;
trace("exportPath : "+exportPath);
*/
var overwrite;


var listItem = [];

function recursive_loop(container, parentItem, parentLayer, level)
{
	//tracerec("recursive_loop", level);
	var len = container.layers.length;

	for(var i=0; i<len; i++){
		var layer = container.layers[i];
		
		var enable = (layer.visible);
		if(!enable) continue;
		
		var isContainer = (layer.typename == "LayerSet");
		var name = layer.name;
		
		var isRoot = (parentItem == null);
		var type = get_type(layer, name, isRoot, level);
		
		var parentlayername = (parentLayer) ? parentLayer.name : "";
		var parentitemname = (parentItem) ? parentItem.name : "";
		
		
		if(type != ""){
			
			var item = create_item(layer, name, type, parentItem, level);
			tracerec("item type : "+type+", name: "+item.name+", path : "+item.path+", btnc : "+item.btnc+", width : "+item.width+", height : "+item.height, level);
			
			if(!item["disable"]){
				if(isRoot) listItem.push(item);
				else parentItem.childrens.push(item);
			}
			
			if(EXPORTS_TYPE.indexOf(type) != -1){
				var path = EXPORT_FOLDER + "/" + EXPORT_FOLDER_IMG + "/";
				if(item.path != "") path += item.path + "/";
				path += item[OPT_FILENAME];
				path += ".png";
				//tracerec("path : "+path, level);
				
				if(overwrite || !fileExist(path, exportPath)){
					saveLayer(layer, path, exportPath, false);
				}
			}

		}
		
		if(isContainer && (type == "" || CONTAINERS_TYPE.indexOf(type) != -1)){
			
			parentLayer = layer;
			
			var newParentItem = parentItem;
			if(CONTAINERS_TYPE.indexOf(type) != -1) newParentItem = item;
			
			recursive_loop(layer, newParentItem, parentLayer, level + 1);
			
		}
	
	}
}





function create_item(layer, name, type, parentItem, level)
{
	var output = {};
	
	if(CONTAINERS_TYPE.indexOf(type) != -1) output.childrens = [];
	
	output[OPT_TYPE] = type;
	
	//output.layerName = name;
	output[OPT_NAME] = get_value_option_safe(name, OPT_NAME);
	if(output[OPT_NAME] == ""){
		output[OPT_NAME] = "" + type + "-" + getLayerId(app.activeDocument, layer);
	}
	output[OPT_FILENAME] = output[OPT_NAME];
	
	if(parentItem != null){
		var bounds = layer.bounds;
		output.position = [getUnitValue(bounds[0]), getUnitValue(bounds[1])];
		
		output.width = getUnitValue(bounds[2]) - getUnitValue(bounds[0]);
		output.height = getUnitValue(bounds[3]) - getUnitValue(bounds[1]);
	}
	else{
		output.position = [0, 0];
		output.width = DOC_WIDTH;
		output.height = DOC_HEIGHT;
	}
	
	if(has_option(name, OPT_POS_X)) output.position[0] = get_value_option(name, OPT_POS_X);
	if(has_option(name, OPT_POS_Y)) output.position[1] = get_value_option(name, OPT_POS_Y);
	
	if(has_option(name, OPT_WIDTH)){
		var val = get_value_option(name, OPT_WIDTH);
		val = getPercentValue(val) / 100;
		output[OPT_WIDTH] = Math.round(val * DOC_WIDTH);
	}
	if(has_option(name, OPT_HEIGHT)){
		var val = get_value_option(name, OPT_HEIGHT);
		val = getPercentValue(val) / 100;
		output[OPT_HEIGHT] = Math.round(val * DOC_HEIGHT);
	}
	
	
	//substract parent position
	if(parentItem){
		output.position[0] -= parentItem.position[0];
		output.position[1] -= parentItem.position[1];
	}
	
	
	//layout
	if(has_option(name, OPT_LAYOUT_X)){
		var layout = get_value_option(name, OPT_LAYOUT_X);
		
		var parentsize= parentItem ? parentItem.width : DOC_WIDTH;
		if(layout == "right") output.margin_right = parentsize - (output.position[0] + output.width);
		else if(layout == "center") output.center_h = Math.round(output.position[0] / (parentsize - output.width) * 100);
		
		output[OPT_LAYOUT_X] = layout;
	}
	else output[OPT_LAYOUT_X] = "left";
	
	if(has_option(name, OPT_LAYOUT_Y)){
		var layout = get_value_option(name, OPT_LAYOUT_Y);
		
		var parentsize= parentItem ? parentItem.height : DOC_HEIGHT;
		if(layout == "bottom") output.margin_bottom = parentsize - (output.position[1] + output.height);
		else if(layout == "center") output.center_v = Math.round(output.position[1] / (parentsize - output.height) * 100);
		
		output[OPT_LAYOUT_Y] = layout;
	}
	else output[OPT_LAYOUT_Y] = "top";
	
	
	
	
	
	if(type != TYPE_TEXT){
		
		var path = get_value_option_safe(name, OPT_PATH);
		path = removePathSlash(path);
		
		output[OPT_PATH] = "";
		if(parentItem != null && parentItem.path != ""){
			output[OPT_PATH] += parentItem.path;
			if(path != "") output[OPT_PATH] += "/";
		}
		output[OPT_PATH] += path;
	}
	
	
	if(type == TYPE_GFX){
		
		output[OPT_GFX_TYPE] = get_value_option_safe(name, OPT_GFX_TYPE);
		if(output[OPT_GFX_TYPE] == "") output[OPT_GFX_TYPE] = "layout";	//layout/data
		
		output[OPT_BGPARENT] = get_value_option_safe(name, OPT_BGPARENT);
		output[OPT_BGPARENT] = (output[OPT_BGPARENT] == "1");
	}
	
	
	
	//btnc 
	//if(parentItem) tracerec("parentItem, type : "+parentItem.type+", name : "+parentItem.name, level);
	
	if(parentItem != null && parentItem[OPT_TYPE] == TYPE_BTNC){
		
		var btnc = get_value_option_safe(name, OPT_BTNC);
		if(btnc == ""){
			if(type == TYPE_GFX) btnc = "bg";
			else if(type == TYPE_TEXT) btnc = "item";
			else throw new Error("only text et gfx autorisé dans btnc ("+type+")");
		}
		output[OPT_BTNC] = btnc;
		
		if(btnc == "bg"){
			parentItem.path = output[OPT_PATH];
			parentItem[OPT_FILENAME] = output[OPT_NAME];
			output["disable"] = true;
		}
		
	}
	
	
	
	//font information (regroupées en un objet) pour type TXT
	if(type == TYPE_TEXT){
		tracerec("textItem : "+layer.textItem, level);
		var ti = layer.textItem;
		
		var textdata = {};
		textdata.color = ti.color.rgb.hexValue;
		textdata.font = ti.font;
		textdata.size = Math.round(ti.size.value);
		textdata.text  =ti.contents.replace(/\r/g, "\\n");
		//textdata.uppercase = (ti.capitalization == "TextCase.ALLCAPS");
		output["textdata"] = textdata;
		
	}
	
	//coordonnées... ?
	
	
	
	return output;
}





function get_type(layer, name, isroot, level)
{
	var forced_type = get_forced_type(name);
	if(forced_type != "") return forced_type;
	
	if(!isroot){
		var natural_type = get_natural_type(layer);
		if(natural_type != TYPE_CONTAINER || has_prefix(name)) return natural_type;
		else return "";
	}
	return "";
}



function main(settings)
{
	exportPath = settings.destination;
	overwrite = settings.overwrite;
	
	var exportFolder = new Folder(exportPath + "/" + EXPORT_FOLDER);
	exportFolder.remove();
	
	recursive_loop(doc, null, null, 0);
	check(listItem);

	//generation des templates

	var templates;
	templates = generate_template(settings.indexTpl, listItem);


	//ecritures des templates

	for(var i in templates){
		
		var tpl = templates[i];
		var path2 = EXPORT_FOLDER + "/" + EXPORT_FOLDER_TPL + "/";
		createFile(exportPath, path2 + tpl.filename, tpl.content);
		
	}
	
}

function check(items)
{
	trace("test");
}



//showDialog(main);

trace("activeDocument.path : "+activeDocument.path);
main({destination : activeDocument.path, indexTpl : 1, overwrite:false});



