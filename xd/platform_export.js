const fs = require("uxp").storage.localFileSystem;
const application = require("application");

const file_debug = require('./debug.js');
var trace = file_debug.trace;



async function saveLayer(layer, path, basepath, shouldMerge, bounds) {
	
	let folder = await createFolderStructure(basepath, path);
	
	trace('path : '+path);
	//path = EXPORT-ps-integrate/images/webfolder/inscription_2.png
	let tab = path.split('/');
	let filename = tab[tab.length-1];
	
	tab = filename.split('.');
	var ext = tab[tab.length - 1];
	tab.pop();
	var filename2 = tab.join('.') + '@x2' + '.' + ext;
	
	/* 
	trace("filename : "+filename);
	trace("filename2 : "+filename2);
	 */
	const file = await folder.createFile(filename);
	const file2 = await folder.createFile(filename2);
	
	let settings = [{
			node: layer,
			outputFile: file,
			type: application.RenditionType.PNG,
			scale: 1
	},
	{
			node: layer,
			outputFile: file2,
			type: application.RenditionType.PNG,
			scale: 2
	}];
	
	await application.createRenditions(settings);
}



function resizeLayer(newWidth) {
	
}


function fileExist(path, basepath) {
	
}


async function getPluginFolder()
{
	let folder = await fs.getDataFolder();
	return folder;
}




async function get_tpl_ids(path, basepath) {
	
	var output = [];
	const scriptFileDirectory = await fs.getPluginFolder();
	
	// var folder = new Folder(scriptFileDirectory + "/templates");
	var folder = await scriptFileDirectory.getEntry('templates');
	trace('folder : '+folder);
	var files = await folder.getEntries();
	
	// trace("len : " + files.length);
	var len = files.length;
	for (var i = 0; i < len; i++) {
		var file = files[i];
		output.push(file.name);
	}
	return output;
	
}



async function createFolderStructure(basepath, path) {
	
	trace('createFolderStructure('+basepath+', '+path+')');
	
	//path = EXPORT-ps-integrate/images/webfolder/inscription_2.png
	
	var tab = path.split("/");
	var len = tab.length - 1;
	var cumul = "";
	// trace('len : '+len);
	
	var f = basepath;

	for (let i = 0; i < len; i++) {
		var folder = tab[i];
		cumul += folder + "/";
		// trace('cumul : '+cumul);
		try{
			f = await f.createFolder(folder);
		}
		catch(err){
			// trace('err : '+err);
			f = await f.getEntry(folder);
		}
		// trace('f : '+f);
		
	}
	return f;
}





function dupLayers(layer) {
	/* 
	var desc143 = new ActionDescriptor();
	var ref73 = new ActionReference();
	ref73.putClass(charIDToTypeID('Dcmn'));
	desc143.putReference(charIDToTypeID('null'), ref73);
	desc143.putString(charIDToTypeID('Nm  '), layer.name);
	var ref74 = new ActionReference();
	ref74.putEnumerated(charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
	desc143.putReference(charIDToTypeID('Usng'), ref74);
	executeAction(charIDToTypeID('Mk  '), desc143, DialogModes.NO);
	 */
};

function SavePNG(saveFile) {
	/* 
	var pngOpts = new ExportOptionsSaveForWeb;
	pngOpts.format = SaveDocumentType.PNG
	pngOpts.PNG8 = false;
	pngOpts.transparency = true;
	pngOpts.interlaced = false;
	pngOpts.quality = 100;
	activeDocument.exportDocument(new File(saveFile), ExportType.SAVEFORWEB, pngOpts);
	 */
}


function createFile(basepath, path, content) {
	//trace("createFile("+basepath+", "+path+", "+content+")");
	/* 
	createFolderStructure(basepath, path);

	var file = new File(basepath + "/" + path);
	file.encoding = "UTF8";
	file.open("w", "TEXT", "????");
	file.writeln(content);
	file.close();
 */
}


async function deleteFolder(folderBaseObj, folderRelativePath) {
	
	// trace('deleteFolder('+folderBaseObj+')');
	var folder;
	try{
		folder = await folderBaseObj.getEntry(folderRelativePath);
	}
	catch(err){
		return;
	}
	await deleteFolderRec(folder);
}
async function deleteFolderRec(folder)
{
	let entries = await folder.getEntries();
	for(let i=0; i<entries.length; i++){
		let entry = entries[i];
		// trace('entry '+i+' : '+entry+', is folder : '+entry.isFolder);
		if(entry.isFolder) await deleteFolderRec(entry);
		else await entry.delete();
	}
	await folder.delete();
}





function loadFilePath(path)
{
	/* 
	var scriptFileDirectory = new File($.fileName).parent;
	var file = new File(scriptFileDirectory + "/" + path);
	var content = loadResource(file);
	return content;
	 */
}


var cache_filepath = {};
function loadFilePath_cache(path)
{
	var pathkey = path.replace(/\//g, "");
	var pathkey = path.replace(/\./g, "");
	
	var output;
	if(cache_filepath[pathkey] != undefined){
		output = cache_filepath[pathkey];
	}
	else{
		output = loadFilePath(path);
		cache_filepath[pathkey] = output;
	}
	return output;
}



function loadResource(file)
{
	/* 
	var rsrcString;
	if (! file.exists) {
		alert("Resource file '" + file.name + "' for the export dialog is missing! Please, download the rest of the files that come with this script.", "Error", true);
		return false;
	}
	try {
		file.open("r");
		if (file.error) throw file.error;
		rsrcString = file.read();
		if (file.error) throw file.error;
		if (! file.close()) {
			throw file.error;
		}
	}
	catch (error) {
		alert("Failed to read the resource file '" + file.name + "'!\n\nReason: " + error + "\n\nPlease, check it's available for reading and redownload it in case it became corrupted.", "Error", true);
		return false;
	}

	return rsrcString;
	 */
}






module.exports = {
	get_tpl_ids,
	getPluginFolder,
	deleteFolder,
	saveLayer,
	fileExist,
	
}