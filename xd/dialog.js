var imp = {};
imp = {...imp, ...require('./constantes.js')};
imp = {...imp, ...require('./platform_layer_logic.js')};

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

function displayModalRename(layer, layername)
{
	var inputval;
	if(layername.substr(0, imp.PREFIX.length) == imp.PREFIX) inputval = layername;
	else inputval = imp.PREFIX;
	
	
	var x = document.createElement("DIALOG");
	x.innerHTML = `
	<form style="width:380px;">
		<h1>Rename layer</h1>
		<div style="margin-top:20px;"></div>
		
		<input type="text" style="width:100%" value="${inputval}"></input>
		
		<footer>
			<button uxp-variant="cta">VALIDER</button>
			<button uxp-variant="secondary">CANCEL</button>
		</footer>
	</form>
	`;
	document.body.appendChild(x);
	
	x.showModal()
	.then(result => {
		trace('result : '+result);
		if(result == 'reasonCanceled') return;
		layer.name = 'hi';
		imp.setLayerName(layer, 'yoyo');
	});
}




module.exports = {
	showDialogOK,
	showDialogError,
	displayModalRename,
};