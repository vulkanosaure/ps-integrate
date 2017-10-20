function saveLayer(layer, path, basepath, shouldMerge) 
{
    activeDocument.activeLayer = layer;
    dupLayers();
    if (shouldMerge === undefined || shouldMerge === true) {
		trace("activeDocument : "+activeDocument);
        activeDocument.mergeVisibleLayers();
    }
    activeDocument.trim(TrimType.TRANSPARENT,true,true,true,true);
	
	//create folder if needed
	createFolderStructure(basepath, path);
	
	
    var saveFile= File(basepath + "/" + path);
    SavePNG(saveFile);
    app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
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



function dupLayers() { 
    var desc143 = new ActionDescriptor();
        var ref73 = new ActionReference();
        ref73.putClass( charIDToTypeID('Dcmn') );
    desc143.putReference( charIDToTypeID('null'), ref73 );
    desc143.putString( charIDToTypeID('Nm  '), activeDocument.activeLayer.name );
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
    file.open("e", "TEXT", "????");
    file.writeln(content);
    file.close();
	
}