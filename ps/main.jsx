#include "constantes.jsx";
#include "debug.jsx";
#include "utils.jsx";
#include "platform-export.jsx";
#include "dialog.jsx";
#include "platform-layer-utils.jsx";
#include "platform-layer-logic.jsx";
#include "errors-utils.jsx";
#include "recursive-loop.jsx";
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











function main(settings) {
	trace("main, settings.overwrite :" + settings.overwrite);


	globalSettings = settings;
	if (settings.overwrite == undefined) settings.overwrite = false;
	
	exportPath = settings.destination;
	overwrite = settings.overwrite;

	if (overwrite) {
		var exportFolder = new Folder(exportPath + "/" + EXPORT_FOLDER);
		deleteFolder(exportFolder);
	}

	recursive_loop(doc, null, null, 0);
	var l = listErrors;
	//trace("listErrors : "+listErrors);



	//generation des templates

	var tpl_id = tpl_ids[settings.indexTpl];
	console.log('tpl_id : '+tpl_id);


	var config_str = loadFilePath("../templates/" + tpl_id + "/config.json");
	var config = jamJSON.parse(config_str, true);
	var templates = generate_template(listItem, tpl_id, config);

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


