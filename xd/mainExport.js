var imp = {};

const file_platform_export = require('./platform_export.js');
var get_tpl_ids = file_platform_export.get_tpl_ids;
var getDataFolder = file_platform_export.getDataFolder;
var deleteFolder = file_platform_export.deleteFolder;
imp = {...imp, ...file_platform_export};
imp = {...imp, ...require('./dialog.js')};
imp = {...imp, ...require('./platform_layer_logic.js')};


const file_debug = require('./debug.js');
var trace = file_debug.trace;

const file_constantes = require('./constantes.js');
var EXPORT_FOLDER = file_constantes.EXPORT_FOLDER;

const file_recursive_loop = require('./recursive_loop.js');
var recursive_loop = file_recursive_loop.recursive_loop;

imp = {...imp, ...require('./generate_template.js')};
imp = {...imp, ...require('./errors_utils.js')};
imp = {...imp, ...file_constantes};
imp = {...imp, ...file_recursive_loop};
imp = {...imp, ...require('./platform_layer_utils.js')};


const fs = require("uxp").storage.localFileSystem;






//_______________________________________

var overwrite;
var listErrors = [];
var listItem = [];
var globalSettings;
var exportPath;
var tpl_ids;


async function exportFunction(selection, documentRoot)
{
	tpl_ids = await get_tpl_ids();
	trace('tpl_ids : '+tpl_ids);
	trace('selection : '+selection.items[0]);
	
	let rootNode;
	if(selection.items && selection.items.length > 0){
		rootNode = imp.getArtboardByLayer(selection.items[0]);
	}
	else{
		throw new Error('please select an element');
		//error msg ?
		// rootNode = documentRoot.children.at(0);
	}
	
	
	trace('rootNode: '+rootNode);
	
	//ps-path=home-test
	trace('name root : '+rootNode.name);
	// throw new Error('name root : '+rootNode.name);
	
	let bounds = documentRoot.globalBounds;
	imp.DOC_WIDTH = bounds.width;
	imp.DOC_HEIGHT = bounds.height;
	
	
	
	
	var settings = {
		overwrite: true,
		destination: await getDataFolder(),
		indexTpl: 1,
	};
	
	trace('settings.destination : '+settings.destination);
	await main(settings, rootNode, documentRoot);
	
	
}



async function main(settings, rootNode, documentRoot)
{
	trace("main, settings.overwrite :" + settings.overwrite);
	
	globalSettings = settings;
	if (settings.overwrite == undefined) settings.overwrite = false;
	
	exportPath = settings.destination;
	overwrite = settings.overwrite;
	trace('overwrite : '+overwrite);

	if (overwrite) {
		await deleteFolder(settings.destination, EXPORT_FOLDER);
	}
	
	
	
	//get config file
	
	// var tpl_id = tpl_ids[settings.indexTpl];
	var tpl_id = 'html';
	console.log('tpl_id : '+tpl_id);
	
	let folderPlugin = await imp.getPluginFolder();
	var config_str = await imp.loadFilePath(folderPlugin, "templates/" + tpl_id + "/config.json");
	config_str = config_str.substr(1);
	var config = JSON.parse(config_str);
	
	
	//todo : parse name of documentRoot to extract a few global property
	//ex : path
	
	
	//layer browsing and exports
	
	let boundsRoot = imp.getBounds(rootNode);
	
	let params = {
		settings : globalSettings,
		listErrors : listErrors,
		listItem : listItem,
		overwrite : overwrite,
		exportPath : exportPath,
		config : config,
		boundsRoot : boundsRoot,
	};
	
	let paramscopy = {
		templateMode : '',
	};
	
	
	await recursive_loop(rootNode, null, null, 0, params, paramscopy);
	
	
	for(var i=0; i<10; i++) trace('________________________________');
	trace('TEMPLATES')
	
	
	
	
	//generation des templates

	
	if (params.listErrors.length > 0) {
		trace('errors');
		imp.showDialogError(params.listErrors);
		await imp.createErrorFile(params.listErrors);
		
	}
	else{
		
		
		var templates = await imp.generate_template(listItem, tpl_id, config);
		

		//ecritures des templates

		for (var i = 0; i < templates.length; i++) {

			var tpl = templates[i];
			var path = tpl.path || EXPORT_FOLDER + "/" + tpl_id + "/";
			var folder = tpl.folder || 'export';
			await imp.createFile(folder, path, tpl.filename, tpl.content);

		}
		
		imp.showDialogOK();
	}
	
	
}





module.exports = {
	exportFunction,
};
