var imp = {};
imp = {...imp, ...require('../constantes.js')};
imp = {...imp, ...require('./platform_layer.js')};
imp = {...imp, ...require('./debug.js')};

var trace = imp.trace;
const { alert, error } = require("../lib/dialogs.js");

//___________________________________________________________________


function showDialogOK()
{
	trace('EXPORT COMPLETE');
	alert("EXPORT COMPLETE", "The files have been exported succesfully !");
}



function showDialogError(listErrors)
{
	var content = '';
	var contentTrace = '';
	var count = 0;
	for(var i in listErrors){
		
		var obj = listErrors[i];
		if(count < 10){
			
			var str = "<div style='margin-bottom:10px;'>";
			str += "<span style='color:#B00;font-weight:bold;'>"+obj.msg+"</span>";
			str += obj.name;
			str += "<span style='font-style:italic;color:#888;'><b>Layer : </b>"+obj.path+"</span>";
			content += str + "</div>";
		}
		
		contentTrace += obj.msg+'\n';
		contentTrace += 'Location : '+obj.path+'\n';
		contentTrace += obj.name+'\n';
		contentTrace += '\n';
		
		count++;
	}
	
	console.log('Erreur');
	console.log(contentTrace);
	
	error("Erreur", content);
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


var hitSequence;

async function displayModalRename(layer, layername)
{
	var inputval;
	if(layername.substr(0, imp.PREFIX.length) == imp.PREFIX){
		inputval = layername.substr(imp.PREFIX.length);
	}
	else inputval = '';
	
	
	var modal = document.createElement("DIALOG");
	modal.innerHTML = `
	<form style="width:380px;">
		<h1>Rename layer</h1>
		
		<div style="display:flex;align-items:center;margin-top:10px;">
			<span>${imp.PREFIX}</span>
			<input class="name" type="text" 
				style="flex:1 0 auto;" 
				value="${inputval}"
			></input>
		</div>
		
		<footer>
			<button class="valid" uxp-variant="cta">VALIDER</button>
			<button class="cancel" uxp-variant="secondary">CANCEL</button>
		</footer>
	</form>
	`;
	document.body.appendChild(modal);
	
	var input = modal.querySelector('input.name');
	var form = modal.querySelector('form');
	var btnvalid = modal.querySelector('button.valid');
	var btncancel = modal.querySelector('button.cancel');
	
	
	
	btnvalid.addEventListener('click', function(e){
		modal.close();
		e.preventDefault();
	});
	btncancel.addEventListener('click', function(e){
		modal.close('reasonCanceled');
		e.preventDefault();
	});
	
	input.addEventListener('keydown', function(e){
		trace('keydown '+e.keyCode);
		hitSequence.push(e.keyCode);
		
		if(e.keyCode == 16){
			trace('yo 16');
			input.setSelectionRange(1, 3);
		}
		
	});
	
	hitSequence = [];
	return modal.showModal()
	.then(function(result){
		if(result == 'reasonCanceled') return;
		var value;
		if(input.value != '') value = imp.PREFIX + input.value;
		else{
			if(layername.substr(0, imp.PREFIX.length) == imp.PREFIX){
				value = Math.round(Math.random() * 9999999) + '';
			}
			else value = '';
		}
		
		var len = hitSequence.length;
		var hit2last = hitSequence.slice(len - 2, len);
		var hitCtrl = (hit2last[0] == 17 && hit2last[1] == 13);
		
		return {
			hitCtrl,
			value,
		}
	});
	
	
}




//___________________________________________________________________

module.exports = {
	showDialogOK,
	showDialogError,
	displayModalRename,
};