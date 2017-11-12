var prefs = new Object();
var env = new Object();

// Settings

var USER_SETTINGS_ID = "PSIntegrateCustomDefaultSettings";
var DEFAULT_SETTINGS = {
	// common
	destination: app.stringIDToTypeID("destFolder"),
	indexTpl: app.stringIDToTypeID("indexTpl"),
	overwrite: app.stringIDToTypeID("overwrite"),
};



try {
	prefs.filePath = app.activeDocument.path;
}
catch (e) {
	prefs.filePath = Folder.myDocuments;
}

try {
	env.version = parseInt(app.version, 10);
	env.cs3OrHigher = (env.version >= 10);
}
catch(e){
	env.cs3OrHigher = false;
}


trace("prefs.filePath : "+prefs.filePath);
trace("env.version : "+env.version);
trace("env.cs3OrHigher : "+env.cs3OrHigher);







function showDialogOK()
{
	var scriptFileDirectory = new File($.fileName).parent;
	var rsrcFile = new File(scriptFileDirectory + "/dialog/dialog-ok.json");
	var rsrcString = loadResource(rsrcFile);
	if (! rsrcString) {
		return false;
	}
	//trace("rsrcString : "+rsrcString);
	var dlg;
	try {
		dlg = new Window(rsrcString);
	}
	catch (e) {
		alert("Dialog resource is corrupt! Please, redownload the script with all files.", "Error", true);
		return false;
	}
	dlg.center();
	return dlg.show();
}




function showDialogError(listErrors)
{
	var scriptFileDirectory = new File($.fileName).parent;
	var rsrcFile = new File(scriptFileDirectory + "/dialog/dialog-error.json");
	var rsrcString = loadResource(rsrcFile);
	if (! rsrcString) {
		return false;
	}
	//trace("rsrcString : "+rsrcString);
	var dlg;
	try {
		dlg = new Window(rsrcString);
	}
	catch (e) {
		alert("Dialog resource is corrupt! Please, redownload the script with all files.", "Error", true);
		return false;
	}
	
	var container = dlg.content;
	var len = listErrors.length;
	for(var i = 0; i<len; i++){
		var obj = listErrors[i];
		trace("- add error "+obj.msg);
		
		var stackGroup = container.add("group");
		stackGroup.margins = [0, 0, 0, 0];
		stackGroup.alignment = "fill";
		stackGroup.alignChildren = "fill";
		stackGroup.orientation = "column";
		
		//var titlepanel = "Location : " + obj.path;
		var titlepanel = "";
		var g = stackGroup.add('panel', undefined, titlepanel); 
		
		g.orientation = "column";
		g.alignChildren = "left";
		//g.add('statictext', undefined, "");
		
		var fontsize = 12;
		var fontsizesmall = 11;
		var grey = 0.5;
		
		var gsub;
		var text;
		gsub = g.add("group", undefined, "");
		text = gsub.add('statictext', undefined, "Msg : ");
		text.graphics.font = ScriptUI.newFont("Arial","BOLD", fontsize);
		gsub.add('statictext', undefined, obj.msg).graphics.font = ScriptUI.newFont("Arial","REGULAR", fontsize);
		
		
		gsub = g.add("group", undefined, "");
		gsub.add('statictext', undefined, "Location : ").graphics.font = ScriptUI.newFont("Arial","BOLD", fontsizesmall);
		gsub.add('statictext', undefined, obj.path).graphics.font = ScriptUI.newFont("Arial","REGULAR", fontsizesmall);
		
		
		gsub = g.add("group", undefined, "");
		text = gsub.add('statictext', undefined, "Layer name : ");
		text.graphics.font = ScriptUI.newFont("Arial","BOLD", fontsizesmall);
		text.graphics.foregroundColor = text.graphics.newPen (text.graphics.PenType.SOLID_COLOR,[grey, grey, grey,1], 1);
		text = gsub.add('statictext', undefined, obj.name);
		text.graphics.font = ScriptUI.newFont("Arial","REGULAR", fontsizesmall);
		text.graphics.foregroundColor = text.graphics.newPen (text.graphics.PenType.SOLID_COLOR,[grey, grey, grey,1], 1);
		
	}
	
	container.layout.layout(true);    //Update the container  
	dlg.layout.layout(true);    //Then update the main UI layout  
	
	dlg.center();
	return dlg.show();
}









function showDialog(handler, tpl_labels)
{
	// read dialog resource
	var scriptFileDirectory = new File($.fileName).parent;
	trace("scriptFileDirectory : "+scriptFileDirectory);
	var rsrcFile = new File(scriptFileDirectory + "/dialog/dialog.json");
	var rsrcString = loadResource(rsrcFile);
	if (! rsrcString) {
		return false;
	}

	// build dialogue
	var dlg;
	try {
		dlg = new Window(rsrcString);
	}
	catch (e) {
		alert("Dialog resource is corrupt! Please, redownload the script with all files.", "Error", true);
		return false;
	}

	// destination path
	dlg.funcArea.content.grpDest.txtDest.text = prefs.filePath.fsName;
	dlg.funcArea.content.grpDest.btnDest.onClick = function() {
		var newFilePath = Folder.selectDialog("Select destination folder", prefs.filePath);
		if (newFilePath) {
			prefs.filePath = newFilePath;
			dlg.funcArea.content.grpDest.txtDest.text = newFilePath.fsName;
		}
	};

	// template selection
	for(var i =0; i<tpl_labels.length; i++){
		dlg.funcArea.content.grpTemplate.drdNaming.add("item", tpl_labels[i]);
	}
	
	dlg.funcArea.content.grpTemplate.drdNaming.selection = 0;
	
	
	dlg.funcArea.content.grp2.cbNaming.onClick = function() {
		prefs.overwrite = this.value;
		trace("prefs.overwrite : "+prefs.overwrite);
	};


	// buttons
	dlg.funcArea.buttons.btnRun.active= true;
	
	dlg.funcArea.buttons.btnRun.onClick = function() {
		// collect arguments for saving and proceed
		trace("btnRun.onclick");
		
		saveSettings(dlg, null);
		var settings = getSettings();
		
		dlg.close(1);
		handler(settings);
		
		
	};
	dlg.funcArea.buttons.btnCancel.onClick = function() {
		dlg.close(0);
	};


	try {
		applySettings(dlg);
	}
	catch (err) {
		alert("Failed to restore previous settings. Default settings applied.\n\n(Error: " + err.toString() + ")", "Settings not restored", true);
	}

	dlg.center();
	return dlg.show();
}







function saveSettings(dlg)
{
	if (!env.cs3OrHigher) {
		return;
	}
	// Collect settings from the dialog controls.
	var desc = new ActionDescriptor();

	with (dlg.funcArea.content) {
		trace("grp2.cbNaming.value : "+grp2.cbNaming.value);
		trace("grpTemplate.drdNaming.selection.index : "+grpTemplate.drdNaming.selection.index);
		
		desc.putString(DEFAULT_SETTINGS.destination, grpDest.txtDest.text);
		desc.putInteger(DEFAULT_SETTINGS.indexTpl, grpTemplate.drdNaming.selection.index);
		desc.putBoolean(DEFAULT_SETTINGS.overwrite, grp2.cbNaming.value);
	}
	// "true" means setting persists across Photoshop launches.
	app.putCustomOptions(USER_SETTINGS_ID, desc, true);
}



function getSettings()
{
	if (!env.cs3OrHigher) {
		return null;
	}

	var desc;
	var result = null;
	try {
		// might throw if settings not present (not saved previously)
		desc = app.getCustomOptions(USER_SETTINGS_ID);

		// might throw if format changed or got corrupt
		result = {
			destination: desc.getString(DEFAULT_SETTINGS.destination),
			indexTpl: desc.getInteger(DEFAULT_SETTINGS.indexTpl),
			overwrite: desc.getBoolean(DEFAULT_SETTINGS.overwrite),
		};
	
	}
	catch (e) {
		trace("catch getSettings");
		return null;
	}
	
	return result;
}




function applySettings(dlg)
{
	var settings = getSettings();
	if (settings == null) {
		return;
	}

	with (dlg.funcArea.content) {
		// Common settings

		var destFolder = new Folder(settings.destination);
		if (destFolder.exists) {
			grpDest.txtDest.text = destFolder.fsName;
			prefs.filePath = destFolder;
		}
		
		var drdNamingIdx = settings.indexTpl;
		grpTemplate.drdNaming.selection = (drdNamingIdx >= 0) ? drdNamingIdx : 0;
		
		if (grp2.cbNaming.value != settings.overwrite) {
			grp2.cbNaming.notify();
		}
	}
}





function loadFilePath(path)
{
	var scriptFileDirectory = new File($.fileName).parent;
	var file = new File(scriptFileDirectory + "/" + path);
	var content = loadResource(file);
	return content;
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