function saveLayer(layer, path, basepath, shouldMerge, bounds) {
	activeDocument.activeLayer = layer;

	dupLayers(layer);
	if (shouldMerge === undefined || shouldMerge === true) {
		activeDocument.mergeVisibleLayers();
	}
	if (!bounds) activeDocument.trim(TrimType.TRANSPARENT, true, true, true, true);
	else activeDocument.crop(bounds);

	//create folder if needed
	createFolderStructure(basepath, path);

	
	var tab = path.split('.');
	var ext = tab[tab.length - 1];
	tab.pop();
	var pathX2 = tab.join('.') + '@x2' + '.' + ext;
	

	var saveFile = File(basepath + "/" + path);
	var saveFileX2 = File(basepath + "/" + pathX2);
	
	var doc = app.activeDocument;
	var widthX1 = Math.round(doc.width / 2);
	
	SavePNG(saveFileX2);
	doc.close(SaveOptions.DONOTSAVECHANGES);
	/* 
	// doc.resizeImage(UnitValue(widthX1, "px"), undefined, 300, ResampleMethod.BICUBICSHARPER);  
	resizeLayer(widthX1);
	 */
	
	app.open(saveFileX2);
	var doc = app.activeDocument;
	doc.resizeImage(UnitValue(widthX1, "px"), undefined, 300, ResampleMethod.BICUBICSHARPER);  
	
	SavePNG(saveFile);
	
	doc.close(SaveOptions.DONOTSAVECHANGES);
}



function resizeLayer(newWidth) {
	var idImgS = charIDToTypeID( "ImgS" );
	var desc2 = new ActionDescriptor();
	var idWdth = charIDToTypeID( "Wdth" );
	var idPxl = charIDToTypeID( "#Pxl" );
	desc2.putUnitDouble( idWdth, idPxl, newWidth);
	var idscaleStyles = stringIDToTypeID( "scaleStyles" );
	desc2.putBoolean( idscaleStyles, true );
	var idCnsP = charIDToTypeID( "CnsP" );
	desc2.putBoolean( idCnsP, true );
	var idIntr = charIDToTypeID( "Intr" );
	var idIntp = charIDToTypeID( "Intp" );
	var idBcbc = charIDToTypeID( "Bcbc" );
	desc2.putEnumerated( idIntr, idIntp, idBcbc );
	executeAction( idImgS, desc2, DialogModes.NO );
}


function fileExist(path, basepath) {
	var file = File(basepath + "/" + path);
	trace("file exists : " + path + " : " + file.exists);
	return file.exists;
}

function get_tpl_ids(path, basepath) {
	var output = [];
	var scriptFileDirectory = new File($.fileName).parent;
	var folder = new Folder(scriptFileDirectory + "/templates");
	trace("len : " + folder.length);
	var files = folder.getFiles();
	var len = files.length;
	for (var i = 0; i < len; i++) {
		var file = files[i];
		output.push(file.name);
	}
	return output;
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





function dupLayers(layer) {
	var desc143 = new ActionDescriptor();
	var ref73 = new ActionReference();
	ref73.putClass(charIDToTypeID('Dcmn'));
	desc143.putReference(charIDToTypeID('null'), ref73);
	desc143.putString(charIDToTypeID('Nm  '), layer.name);
	var ref74 = new ActionReference();
	ref74.putEnumerated(charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
	desc143.putReference(charIDToTypeID('Usng'), ref74);
	executeAction(charIDToTypeID('Mk  '), desc143, DialogModes.NO);
};

function SavePNG(saveFile) {
	var pngOpts = new ExportOptionsSaveForWeb;
	pngOpts.format = SaveDocumentType.PNG
	pngOpts.PNG8 = false;
	pngOpts.transparency = true;
	pngOpts.interlaced = false;
	pngOpts.quality = 100;
	activeDocument.exportDocument(new File(saveFile), ExportType.SAVEFORWEB, pngOpts);
}


function createFile(basepath, path, content) {
	//trace("createFile("+basepath+", "+path+", "+content+")");

	createFolderStructure(basepath, path);

	var file = new File(basepath + "/" + path);
	file.encoding = "UTF8";
	file.open("w", "TEXT", "????");
	file.writeln(content);
	file.close();

}