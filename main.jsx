#include "constantes.jsx";
#include "debug.jsx";
#include "utils.jsx";
#include "export.jsx";
#include "dialog.jsx";
#include "template-utils.jsx";
#include "generate-script/generate-haxe.jsx";
#include "generate-script/generate-html-css.jsx";


for(var i=0; i<5; i++) trace(".");
trace("===========================");


var doc = app.activeDocument;
trace("doc : "+doc);

/*
//var exportPath = activeDocument.path;
var exportPath = Folder.userData;
trace("exportPath : "+exportPath);
*/





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
		
		
		//tracerec("_________________________", level);
		tracerec("c : "+isContainer+", kind : "+layer.kind+", name : "+name+", plname : "+parentlayername+", piname : "+parentitemname, level);
		tracerec("type : "+type, level);
		
		
		
		if(type != ""){
			
			var item = create_item(layer, name, type, parentItem, level);
			
			if(isRoot) listItem.push(item);
			else parentItem.childrens.push(item);
			
			if(type == TYPE_GFX){
				var path = EXPORT_FOLDER + "/" + EXPORT_FOLDER_IMG + "/";
				if(item.path != "") path += item.path + "/";
				path += item.name;
				path += ".png";
				tracerec("path : "+path, level);
				saveLayer(layer, path, exportPath, false);
				
			}

		}
		
		if(isContainer && (type == "" || type == TYPE_CONTAINER)){
			
			parentLayer = layer;
			
			var newParentItem = parentItem;
			if(type == TYPE_CONTAINER) newParentItem = item;
			
			recursive_loop(layer, newParentItem, parentLayer, level + 1);
			
		}
	
	}
}





function create_item(layer, name, type, parentItem, level)
{
	var output = {};
	output.type = get_type(layer, name);
	
	if(type == TYPE_CONTAINER) output.childrens = [];
	
	output.type = type;
	
	//output.layerName = name;
	output.name = get_value_option_safe(name, OPT_NAME);
	if(output.name == ""){
		output.name = "" + type + "-" + getLayerId(app.activeDocument, layer);
	}
	
	var bounds = layer.bounds;
	output.position = [getUnitValue(bounds[0]), getUnitValue(bounds[1])];
	
	//substract parent position
	if(parentItem){
		output.position[0] -= parentItem.position[0];
		output.position[1] -= parentItem.position[1];
	}
	
	
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
	
	
	//font information (regroupées en un objet) pour type TXT
	if(type == TYPE_TEXT){
		tracerec("textItem : "+layer.textItem, level);
		var ti = layer.textItem;
		
		var textdata = {};
		textdata.color = ti.color.rgb.hexValue;
		textdata.font = ti.font;
		textdata.size = Math.round(ti.size.value);
		textdata.text  =ti.contents;
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
		if(natural_type != TYPE_CONTAINER) return natural_type;
		else return "";
	}
	return "";
}



function main(settings)
{
	exportPath = settings.destination;
	
	var exportFolder = new Folder(exportPath + "/" + EXPORT_FOLDER);
	exportFolder.remove();
	
	recursive_loop(doc, null, null, 0);

	//generation des templates

	var templates;
	templates = FUNCTIONS_GENERATE_TEMPLATE[settings.indexTpl](settings.indexTpl, listItem);


	//ecritures des templates

	for(var i in templates){
		
		var tpl = templates[i];
		var path2 = EXPORT_FOLDER + "/" + EXPORT_FOLDER_TPL + "/";
		createFile(exportPath, path2 + tpl.filename, tpl.content);
		
	}
}



//showDialog(main);

trace("activeDocument.path : "+activeDocument.path);
main({destination : activeDocument.path, indexTpl : 1});



