function saveLayer(layer, path, basepath, shouldMerge, bounds, imgtype, config) {
	
	// trace('createFolderStructure basepath : '+basepath+', path : '+path);
	var folder = createFolderStructure(basepath, path);
	
	if(!imgtype) imgtype = 'png';
	
	//path = EXPORT-ps-integrate/images/webfolder/inscription_2.png
	var tab = path.split('/');
	var filename = tab[tab.length-1];
	var filename2 = filename + '@x2';
	
	var ext = imgtype;
	filename += '.' + ext;
	filename2 += '.' + ext;
	
	const file = folder.createFile(filename);
	const file2 = folder.createFile(filename2);
	
	var type;
	if(imgtype == 'png') type = application.RenditionType.PNG;
	else if(imgtype == 'svg') type = application.RenditionType.SVG;
	else throw new Error('wrong imgtype '+imgtype);
	
	
	var saveShadow;
	if(layer.shadow && layer.shadow.visible){
		saveShadow = layer.shadow;
		layer.shadow = null;
	}
	
	var disableStroke = false;
	if(layer.strokeEnabled){
		layer.strokeEnabled = false;
		disableStroke = true;
	}
	
	var saveCornerRadius;
	if(layer.hasRoundedCorners){
		saveCornerRadius = layer.cornerRadii;
		layer.setAllCornerRadii(0);
	}
	
	
	var settings = [{
			node: layer,
			outputFile: file,
			type: type,
			scale: 1,
			minify: true,
			embedImages: true,
			overwrite: true,
	}];
	
	if(config.retina && imgtype!='svg'){
		settings.push({
			node: layer,
			outputFile: file2,
			type: type,
			scale: 2,
			minify: true,
			embedImages: true,
			overwrite: true,
		});
	}
	
	
	application.createRenditions(settings);
	
	if(saveShadow) layer.shadow = saveShadow;
	if(disableStroke) layer.strokeEnabled = true;
	if(saveCornerRadius) layer.cornerRadii = saveCornerRadius;
	
}




function fileExist(path, basepath) {
	
}


function getDataFolder()
{
	var folder = Folder.userData;
	return folder;
}
function getPluginFolder()
{
	var folder = new File($.fileName).parent.parent;
	return folder;
}




function createFolderStructure(basepath, path) {
	
	// trace('createFolderStructure('+basepath+', '+path+')');
	
	//path = EXPORT-ps-integrate/images/webfolder/inscription_2.png
	
	var tab = path.split("/");
	var len = tab.length - 1;
	var cumul = "";
	
	var f = basepath;

	for (var i = 0; i < len; i++) {
		var folder = tab[i];
		cumul += folder + "/";
		try{
			f = f.createFolder(folder);
		}
		catch(err){
			f = f.getEntry(folder);
		}
	}
	return f;
}




var exportFolder;
var pluginFolder;

function createFile(folderType, path, filename, content) 
{
	// trace('createFile : '+folderType+', '+path+', '+filename);
	
	var base;
	if(folderType == 'export'){
		if(!exportFolder) exportFolder = getDataFolder();
		base = exportFolder;
	}
	else if(folderType == 'plugin'){
		if(!pluginFolder) pluginFolder = getPluginFolder();
		base = pluginFolder;
	}
	else throw new Error('wrong folder type '+folderType);
	
	
	var folder = createFolderStructure(base, path);
	// trace('folder : '+folder);
	// trace('filename : '+filename);
	var file = folder.createFile(filename, {
		overwrite: true,
	});
	file.write(content);
	
}



function deleteFolder(folderBaseObj, folderRelativePath) {
	
	// trace('deleteFolder('+folderBaseObj+')');
	var folder;
	try{
		folder = folderBaseObj.getEntry(folderRelativePath);
	}
	catch(err){
		return;
	}
	deleteFolderRec(folder);
}
function deleteFolderRec(folder)
{
	var entries = folder.getEntries();
	for(var i=0; i<entries.length; i++){
		var entry = entries[i];
		// trace('entry '+i+' : '+entry+', is folder : '+entry.isFolder);
		if(entry.isFolder) deleteFolderRec(entry);
		else entry.delete();
	}
	folder.delete();
}





function loadFilePath(folderStr, path)
{
	trace("loadFilePath("+path+")");
	trace('folderStr : '+folderStr);
	
	var file = new File(folderStr + "/" + path);
	var content = loadResource(file);
	return content;
}


var cache_filepath = {};
function loadFilePath_cache(folderObj, path)
{
	var pathkey = path.replace(/\//g, "");
	var pathkey = path.replace(/\./g, "");
	
	var output;
	if(cache_filepath[pathkey] != undefined){
		output = cache_filepath[pathkey];
	}
	else{
		output = loadFilePath(folderObj, path);
		cache_filepath[pathkey] = output;
	}
	return output;
}




function loadResource(file)
{
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
}




