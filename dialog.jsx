﻿var prefs = new Object();
var env = new Object();

// Settings

var USER_SETTINGS_ID = "PSIntegrateCustomDefaultSettings";
var DEFAULT_SETTINGS = {
	// common
	destination: app.stringIDToTypeID("destFolder"),
	indexTpl: app.stringIDToTypeID("indexTpl"),
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




function showDialog(handler)
{
	// read dialog resource
	var scriptFileDirectory = new File($.fileName).parent;
	trace("scriptFileDirectory : "+scriptFileDirectory);
	var rsrcFile = new File(scriptFileDirectory + "/dialog.json");
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

	// file naming options
	dlg.funcArea.content.grpTemplate.drdNaming.selection = 0;


	// buttons
	dlg.funcArea.buttons.btnRun.onClick = function() {
		// collect arguments for saving and proceed
		trace("btnRun.onclick");
		
		saveSettings(dlg, null);
		var settings = getSettings();
		
		handler(settings);
		
		dlg.close(1);
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
		
		desc.putString(DEFAULT_SETTINGS.destination, grpDest.txtDest.text);
		desc.putInteger(DEFAULT_SETTINGS.indexTpl, grpTemplate.drdNaming.selection.index);
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
	}
}





function loadFilePath(path)
{
	var scriptFileDirectory = new File($.fileName).parent;
	var file = new File(scriptFileDirectory + "/" + path);
	var content = loadResource(file);
	return content;
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