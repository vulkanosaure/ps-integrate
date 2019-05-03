const file_debug = require('./debug.js');
var trace = file_debug.trace;


function showDialogOK()
{
	trace('showDialogOK');
}



function showDialogError(listErrors)
{
	trace('showDialogError');
	let content = '________________\n';
	for(var i in listErrors){
		var obj = listErrors[i];
		var str = "";
		str += "Msg : "+obj.msg+"\n";
		str += "Path : "+obj.path+"\n";
		str += "Layer name : "+obj.name+"\n";
		content += str + "\n";
	}
	console.log(content);
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


module.exports = {
	showDialogOK,
	showDialogError,
	
};