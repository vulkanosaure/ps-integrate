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
	
}



function saveSettings(dlg)
{
	
}

function getSettings()
{
	
}

function applySettings(dlg)
{
	
}



function displayModalRename(layer, layername)
{
	
}
