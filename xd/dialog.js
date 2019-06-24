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
	
	//test deselect input value
	/* 
	input.addEventListener('focus', function(e){
		var el = e.currentTarget;
		trace('focus '+el.value);
		// el.setSelectionRange(3, el.value.length)
		el.selectionStart = 3;
		el.selectionEnd = 5;
		el.value = "";
		
		setTimeout(() => {
			el.dispatchEvent(new KeyboardEvent('keypress',{'key':'a'}));
			el.value = "yayaya";
			setTimeout(function() { el.selectionStart = el.selectionEnd; }, 1);
		}, 500);
	});
	 */
	
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
	.then(result => {
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






module.exports = {
	showDialogOK,
	showDialogError,
	displayModalRename,
};