const file_platform_export = require('./platform_export.js');
var get_tpl_ids = file_platform_export.get_tpl_ids;
var getPluginFolder = file_platform_export.getPluginFolder;
var deleteFolder = file_platform_export.deleteFolder;

const file_debug = require('./debug.js');
var trace = file_debug.trace;

const file_constantes = require('./constantes.js');
var EXPORT_FOLDER = file_constantes.EXPORT_FOLDER;

const file_recursive_loop = require('./recursive_loop.js');
var recursive_loop = file_recursive_loop.recursive_loop;





//_______________________________________
/* 
var DOC_WIDTH = getUnitValue(doc.width);
var DOC_HEIGHT = getUnitValue(doc.height);
*/

var overwrite;
var listErrors = [];
var listItem = [];
var globalSettings;
var exportPath;



async function exportFunction(selection, documentRoot)
{
	var tpl_ids = await get_tpl_ids();
	trace('tpl_ids : '+tpl_ids);
	trace('selection : '+selection.items[0]);
	
	let rootNode;
	if(selection.items && selection.items.length > 0 && false) rootNode = selection.items[0];
	else rootNode = documentRoot.children.at(0);
	trace('rootNode: '+rootNode);
	
	var settings = {
		overwrite: true,
		destination: await getPluginFolder(),
		indexTpl: 1,
	};
	
	trace('settings.destination : '+settings.destination);
	main(settings, rootNode);
	
	
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
		await deleteFolder(settings.destination, EXPORT_FOLDER);
	}
	
	
	await recursive_loop(rootNode, null, null, 0, {
		settings : globalSettings,
		listErrors : listErrors,
		listItem : listItem,
		overwrite : overwrite,
		exportPath : exportPath,
	});
}





module.exports = {
  commands: {
    export: exportFunction
	},
	globalSettings,
};
