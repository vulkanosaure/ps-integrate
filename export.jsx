﻿function saveLayer(layer, path, basepath, shouldMerge) 
{
    activeDocument.activeLayer = layer;
	
    dupLayers(layer);
    if (shouldMerge === undefined || shouldMerge === true) {
        activeDocument.mergeVisibleLayers();
    }
    activeDocument.trim(TrimType.TRANSPARENT,true,true,true,true);
	
	//create folder if needed
	createFolderStructure(basepath, path);
	
	
    var saveFile= File(basepath + "/" + path);
    SavePNG(saveFile);
    app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
}


function fileExist(path, basepath)
{
	var file= File(basepath + "/" + path);
	trace("file exists : "+path+" : "+file.exists);
	return file.exists;
}

function get_tpl_ids(path, basepath)
{
	var output = [];
	var scriptFileDirectory = new File($.fileName).parent;
	var folder = new Folder(scriptFileDirectory + "/templates");
	trace("len : "+folder.length);
	var files = folder.getFiles();
	var len = files.length;
	for(var i =0; i<len; i++){
		var file = files[i];
		output.push(file.name);
	}
	return output;
}



function createFolderStructure(basepath, path)
{
	var tab = path.split("/");
	var len = tab.length - 1;
	var cumul = "";
	
	for(i = 0; i<len; i++){
		var folder = tab[i];
		cumul += folder + "/";
		
		var f = new Folder(basepath + "/" + cumul);
		if (!f.exists)  f.create();
		
	}
}





function dupLayers(layer) { 
    var desc143 = new ActionDescriptor();
        var ref73 = new ActionReference();
        ref73.putClass( charIDToTypeID('Dcmn') );
    desc143.putReference( charIDToTypeID('null'), ref73 );
    desc143.putString( charIDToTypeID('Nm  '), layer.name );
        var ref74 = new ActionReference();
        ref74.putEnumerated( charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') );
    desc143.putReference( charIDToTypeID('Usng'), ref74 );
    executeAction( charIDToTypeID('Mk  '), desc143, DialogModes.NO );
};

function SavePNG(saveFile){
    var pngOpts = new ExportOptionsSaveForWeb; 
    pngOpts.format = SaveDocumentType.PNG
    pngOpts.PNG8 = false; 
    pngOpts.transparency = true; 
    pngOpts.interlaced = false; 
    pngOpts.quality = 100;
    activeDocument.exportDocument(new File(saveFile),ExportType.SAVEFORWEB,pngOpts); 
}


function createFile(basepath, path, content)
{
	trace("createFile("+basepath+", "+path+", "+content+")");
	
	createFolderStructure(basepath, path);
	
	var file=new File(basepath + "/" + path);
	file.encoding = "UTF8";
    file.open("w", "TEXT", "????");
    file.writeln(content);
    file.close();
	
}