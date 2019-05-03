const fs = require("uxp").storage.localFileSystem;
const application = require("application");

const file_debug = require('./debug.js');
var trace = file_debug.trace;



async function saveLayer(layer, path, basepath, shouldMerge, bounds, imgtype, config) {
	
	let folder = await createFolderStructure(basepath, path);
	
	trace('saveLayer imgtype : '+imgtype);
	if(!imgtype) imgtype = 'png';
	
	//path = EXPORT-ps-integrate/images/webfolder/inscription_2.png
	let tab = path.split('/');
	let filename = tab[tab.length-1];
	let filename2 = filename + '@x2';
	
	var ext = imgtype;
	filename += '.' + ext;
	filename2 += '.' + ext;
	
	const file = await folder.createFile(filename);
	const file2 = await folder.createFile(filename2);
	
	let type;
	if(imgtype == 'png') type = application.RenditionType.PNG;
	else if(imgtype == 'svg') type = application.RenditionType.SVG;
	else throw new Error('wrong imgtype '+imgtype);
	
	let settings = [{
			node: layer,
			outputFile: file,
			type: type,
			scale: 1,
			minify: true,
			embedImages: true,
	}];
	
	if(config.retina && imgtype!='svg'){
		settings.push({
			node: layer,
			outputFile: file2,
			type: type,
			scale: 2,
			minify: true,
			embedImages: true,
		});
	}
	
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
	// trace('folder : '+folder);
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
	
	// trace('createFolderStructure('+basepath+', '+path+')');
	
	//path = EXPORT-ps-integrate/images/webfolder/inscription_2.png
	
	var tab = path.split("/");
	var len = tab.length - 1;
	var cumul = "";
	
	var f = basepath;

	for (let i = 0; i < len; i++) {
		var folder = tab[i];
		cumul += folder + "/";
		try{
			f = await f.createFolder(folder);
		}
		catch(err){
			f = await f.getEntry(folder);
		}
	}
	return f;
}





function dupLayers(layer) {
	
};

function SavePNG(saveFile) {
	
}


async function createFile(folderBaseObj, path, filename, content) {
	
	let folder = await createFolderStructure(folderBaseObj, path);
	// trace('folder : '+folder);
	// trace('filename : '+filename);
	let file = await folder.createFile(filename);
	file.write(content);
	
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





async function loadFilePath(folderObj, path)
{
	// trace("loadFilePath("+path+")");
	let file = await folderObj.getEntry(path);
	let content = await file.read();
	return content;
}


var cache_filepath = {};
async function loadFilePath_cache(folderObj, path)
{
	var pathkey = path.replace(/\//g, "");
	var pathkey = path.replace(/\./g, "");
	
	var output;
	if(cache_filepath[pathkey] != undefined){
		output = cache_filepath[pathkey];
	}
	else{
		output = await loadFilePath(folderObj, path);
		cache_filepath[pathkey] = output;
	}
	return output;
}



function loadResource(file)
{
	
}






module.exports = {
	get_tpl_ids,
	getPluginFolder,
	deleteFolder,
	saveLayer,
	fileExist,
	loadFilePath,
	loadFilePath_cache,
	createFile,
	
}