// function saveLayer(layer, path, basepath, shouldMerge, bounds, imgtype, config) {
function saveLayer(layer, path, basepath, shouldMerge, bounds, imgtype, config) {
	activeDocument.activeLayer = layer;

	dupLayers(layer);
	if (shouldMerge === undefined || shouldMerge === true) {
		activeDocument.mergeVisibleLayers();
	}
	if (!bounds) activeDocument.trim(TrimType.TRANSPARENT, true, true, true, true);
	else{
		for(var i=0; i<4; i++) bounds[i] = new UnitValue(bounds[i], 'px');
		activeDocument.crop(bounds);
	}
	
	//create folder if needed
	createFolderStructure(basepath, path);
	
	if(!imgtype) imgtype = 'png';
	var ext = imgtype;
	
	var fullpath = basepath + "/" + path + '.' + ext;
	trace('fullpath : '+fullpath);
	var saveFile = File(fullpath);
	var doc = app.activeDocument;
	
	
	//tocheck, access to config
	if(config.config.retina){
		
		var pathX2 = path + '@x2' + '.' + ext;
		// trace('pathX2 : '+pathX2);
		var saveFileX2 = File(basepath + "/" + pathX2);
		
		var widthX1 = Math.round(doc.width / 2);
		SavePNG(saveFileX2);
		doc.close(SaveOptions.DONOTSAVECHANGES);
		
		app.open(saveFileX2);
		var doc = app.activeDocument;
		doc.resizeImage(UnitValue(widthX1, "px"), undefined, 300, ResampleMethod.BICUBICSHARPER);  
	}
	
	SavePNG(saveFile);
	
	doc.close(SaveOptions.DONOTSAVECHANGES);
}




function fileExist(path, basepath) {
	
}


function getDataFolder()
{
	var folder = Folder.userData;
	foder += '/integate';
	return folder;
}
function getPluginFolder()
{
	var folder = new File($.fileName).parent.parent;
	return folder;
}




function createFolderStructure(basepath, path) {
	var tab = path.split("/");
	var len = tab.length - 1;
	var cumul = "";

	for (i = 0; i < len; i++) {
		var folder = tab[i];
		cumul += folder + "/";

		var f = new Folder(basepath + "/" + cumul);
		if (!f.exists) f.create();

	}
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
	
	var file = new File(base + "/" + path + filename);
	file.encoding = "UTF8";
	file.open("w", "TEXT", "????");
	file.writeln(content);
	file.close();
	
}



function deleteFolder(folderBaseObj, folderRelativePath) {
	
	var folderItem = new Folder(folderBaseObj + "/" + folderRelativePath);
	var theFiles = folderItem.getFiles();
	for(var c = 0; c < theFiles.length; c++){
			if (theFiles[c] instanceof Folder) {
				deleteFolder(theFiles[c]);
			}
			else{
				theFiles[c].remove();
			}
	}
	
	folderItem.remove();
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



function SavePNG(saveFile) {
	var pngOpts = new ExportOptionsSaveForWeb;
	pngOpts.format = SaveDocumentType.PNG
	pngOpts.PNG8 = false;
	pngOpts.transparency = true;
	pngOpts.interlaced = false;
	pngOpts.quality = 100;
	activeDocument.exportDocument(new File(saveFile), ExportType.SAVEFORWEB, pngOpts);
}


