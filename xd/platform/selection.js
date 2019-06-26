var imp = {};
imp = {...imp, ...require('./platform_layer.js')};
imp = {...imp, ...require('./debug.js')};
imp = {...imp, ...require('./dialog.js')};

var trace = imp.trace;
var commands = require("commands");

//___________________________________________________________________






async function selection(sel, item, dir, command)
{
	//command = select/move/add
	
	var parent = imp.getLayerParent(item);
	
	var sibblings = imp.getLayersArray(parent);
	var len = sibblings.length;
	var loopOver = false;
	
	var itemselect;
	
	if(['up', 'down'].indexOf(dir) > -1){
		
		var index = sibblings.indexOf(item);
		var delta = dir == 'up' ? -1 : 1;
		var index2 = index - delta;
		
		if(index2 >= 0 && index2 <= len - 1){
			
			itemselect = sibblings[index2];
		}
		else{
			
			loopOver = true;
			if(index2 >= len) index2 = 0;
			else index2 = len - 1;
			itemselect = sibblings[index2];
			
		}
	}
	
	if(['left', 'right'].indexOf(dir) > -1){
		
		if(dir == 'left'){
			
			itemselect = parent;
			
		}
		else if(dir == 'right'){
			
			var children;
			var itemtest;
			var indtest = sibblings.indexOf(item);
			
			while((!children || children.length == 0) && indtest >= 0){
				itemtest = sibblings[indtest];
				children = imp.getLayersArray(itemtest);
				indtest--;
			}
			
			var success = (children && children.length > 0);
			if(success){
				itemselect = children[children.length - 1];
			}
			
		}
		
	}
	
	
	if(itemselect){
		if(command == 'add') imp.addLayerToSelection(sel, itemselect);
		else if(command == 'select') imp.setSelectedLayer(sel, itemselect);
	}
	
	if(command == 'move'){
		
		if(dir == 'up'){
			if(!loopOver) commands.bringForward();
			else commands.sendToBack();
		}
		else if(dir == 'down'){
			if(!loopOver) commands.sendBackward();
			else commands.bringToFront();
		}
		else if(dir == 'right'){
			
			item.removeFromParent();
			itemselect.parent.addChild(item);
		}
		else if(dir == 'left'){
			
			var parentParent = parent.parent;
			item.removeFromParent();
			parentParent.addChild(item);
			// throw new Error('yo');
		}
	}
	
	
	return itemselect;
}


async function setTimeoutAsync(func, delay)
{
	if(delay == undefined) delay = 0;
	setTimeout(func, delay);
	/* 
	return new Promise(function(resolve){
		setTimeout(func, delay)
	});
	 */
}


/*
select : determine next selection, based on direction

move :
add item to children index
require parent and index

*/


async function rename(sel, layer)
{
	var name = imp.getLayerName(layer);
	var output = await imp.displayModalRename(layer, name);
	
	if(output){
		
		trace('output : '+output.value);
		if(output.value) imp.setLayerName(layer, output.value);
		
		if(output.hitCtrl){
			// setTimeout(nextEdit, 500);
			await nextEdit(sel, layer);
		}
	}
}

async function nextEdit(sel, layer)
{
	var newlayer = selection(sel, layer, 'down', false);
	// await rename(sel, newlayer);
}




//___________________________________________________________________

module.exports = {
	selection,
	rename,
};