var imp = {};
imp = {...imp, ...require('./platform/platform_io.js')};
imp = {...imp, ...require('./platform/dialog.js')};
imp = {...imp, ...require('./platform/platform_layer.js')};
imp = {...imp, ...require('./platform/debug.js')};
imp = {...imp, ...require('./generate_template.js')};
imp = {...imp, ...require('./errors_utils.js')};
imp = {...imp, ...require('./platform/platform_layer2.js')};
imp = {...imp, ...require('./platform/global_functions.js')};
imp = {...imp, ...require('./constantes.js')};
imp = {...imp, ...require('./recursive_loop.js')};

var trace = imp.trace;


//___________________________________________________________________





var overwrite;
var listErrors = [];
var listItem = [];
var globalSettings;
var exportPath;


async function exportFunction(rootNode)
{
	trace('exportFunction, rootNode: '+rootNode.name);
	
	var bounds = imp.getBounds(rootNode, null, false);
	imp.DOC_WIDTH = bounds[4];
	imp.DOC_HEIGHT = bounds[5];
	trace('DOC DIMS : '+imp.DOC_WIDTH+', '+imp.DOC_HEIGHT);
	
	var settings = {
		overwrite: true,
		destination: await imp.getDataFolder(),
		indexTpl: 1,
	};
	
	trace('settings.destination : '+settings.destination);
	await main(settings, rootNode);
	
	
}



async function main(settings, rootNode)
{
	trace("main, settings.overwrite :" + settings.overwrite);
	
	globalSettings = settings;
	if (settings.overwrite == undefined) settings.overwrite = false;
	
	exportPath = settings.destination;
	overwrite = settings.overwrite;
	trace('overwrite : '+overwrite);

	if (overwrite) {
		await imp.deleteFolder(settings.destination, imp.EXPORT_FOLDER);
	}
	
	
	
	//get config file
	
	var tpl_id = 'html';
	console.log('tpl_id : '+tpl_id);
	
	var folderPlugin = await imp.getPluginFolder();
	var config_str = await imp.loadFilePath(folderPlugin, "templates/" + tpl_id + "/config.json");
	if(imp.PLATFORM == 'xd') config_str = config_str.substr(1);
	var config = imp.parse_json(config_str);
	
	
	
	//layer browsing and exports
	
	var boundsRoot = imp.getBounds(rootNode);
	
	var params = {
		settings : globalSettings,
		listErrors : listErrors,
		listItem : listItem,
		overwrite : overwrite,
		exportPath : exportPath,
		config : config,
		boundsRoot : boundsRoot,
	};
	
	var paramscopy = {
		templateMode : '',
	};
	
	
	await imp.recursive_loop(rootNode, null, null, 0, params, paramscopy);
	
	
	for(var i=0; i<10; i++) trace('________________________________');
	trace('TEMPLATES')
	
	
	
	
	//generation des templates

	
	if (params.listErrors.length > 0) {
		trace('errors');
		await imp.createErrorFile(params.listErrors);
		imp.showDialogError(params.listErrors);
	}
	else{
		
		var templates = await imp.generate_template(listItem, tpl_id, config);
		

		//ecritures des templates

		for (var i = 0; i < templates.length; i++) {

			var tpl = templates[i];
			var path = tpl.path || imp.EXPORT_FOLDER + "/" + tpl_id + "/";
			var folder = tpl.folder || 'export';
			await imp.createFile(folder, path, tpl.filename, tpl.content);

		}
		
		imp.showDialogOK();
	}
	
	
}



//___________________________________________________________________

module.exports = {
	exportFunction,
};
