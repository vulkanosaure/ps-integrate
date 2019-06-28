var overwrite;
var listErrors = [];
var listItem = [];
var globalSettings;
var exportPath;


function exportFunction(rootNode)
{
	trace('exportFunction, rootNode: '+rootNode);
	
	var bounds = getBounds(rootNode, null, false);
	DOC_WIDTH = bounds[4];
	DOC_HEIGHT = bounds[5]; 
	trace('DOC DIMS : '+(DOC_WIDTH+1)+', '+(DOC_HEIGHT+1));
	
	var settings = {
		overwrite: true,
		destination: getDataFolder(),
		indexTpl: 1,
	};
	
	trace('settings.destination : '+settings.destination);
	main(settings, rootNode);
	
}



function main(settings, rootNode)
{
	trace("main, settings.overwrite :" + settings.overwrite);
	
	globalSettings = settings;
	if (settings.overwrite == undefined) settings.overwrite = false;
	
	exportPath = settings.destination;
	overwrite = settings.overwrite;
	trace('overwrite : '+overwrite);

	if (overwrite) {
		deleteFolder(settings.destination, EXPORT_FOLDER);
	}
	
	
	
	//get config file
	
	var tpl_id = 'html';
	trace('tpl_id : '+tpl_id);
	
	var folderPlugin = getPluginFolder();
	var config_str = loadFilePath(folderPlugin, "templates/" + tpl_id + "/config.json");
	if(PLATFORM == 'xd') config_str = config_str.substr(1);
	var config = parse_json(config_str);
	trace('config : '+config.main.filename);
	
	
	//layer browsing and exports
	
	var boundsRoot = getBounds(rootNode);
	
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
	
	
	recursive_loop(rootNode, null, null, 0, params, paramscopy);
	
	
	for(var i=0; i<10; i++) trace('________________________________');
	trace('TEMPLATES')
	
	
	
	
	//generation des templates

	
	if (params.listErrors.length > 0) {
		trace('errors');
		createErrorFile(params.listErrors);
		showDialogError(params.listErrors);
		
		
	}
	else{
		
		var templates = generate_template(listItem, tpl_id, config);
		
		
		//ecritures des templates
		trace('templates.length : '+templates.length);
		
		for (var i = 0; i < templates.length; i++) {
			
			var tpl = templates[i];
			
			trace('_____________________');
			trace('filename : '+tpl.filename);
			trace('content : '+tpl.content);
			
			
			var path = tpl.path || EXPORT_FOLDER + "/" + tpl_id + "/";
			var folder = tpl.folder || 'export';
			trace('path : '+path);
			trace('folder : '+folder);
			
			createFile(folder, path, tpl.filename, tpl.content);

		}
		
		showDialogOK();
	}
	
	
}

