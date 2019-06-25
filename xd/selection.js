var imp = {};
imp = {...imp, ...require('./platform_layer_logic.js')};
imp = {...imp, ...require('./debug.js')};
imp = {...imp, ...require('./dialog.js')};
var trace = imp.trace;

var commands = require("commands");



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
			/* 
			trace('editContext : '+sel.editContext);
			
			let objtest = sibblings[0];
			let container = sibblings[1];
			 */
			
			/* 
			objtest.removeFromParent();
			container.addChild(objtest);
			*/
			
			
			/*
			i can select stuff from different group
			and group them
			it probably creates a new group from the common ancestor
			*/
			
			/* 
			//this works well
			
			sel.items = sibblings.slice(0, 3);
			commands.group();
			 */
			
			
			 /* 
			//delete all children pops up a level from editContext BUT it takes effect async 
			//and after : no change in the background possible
			
			 trace('removeFromParent');
			// item.removeFromParent();
			var parentParent = parent.parent;
			parent.removeAllChildren();
			
			await setTimeoutAsync(() => {
				trace('editContext : '+sel.editContext);
				parentParent.addChild(parent, 0);
				
			}, 0);
			 */
			
			
			
			//indeed it pops up a level, but only available asynchronously
			
			
			/*
			If your plugin has deleted nodes such that the current container
			is now empty, the edit context will pop up a level and the 
			now-empty container is automatically cleaned up.
			*/
			
			//try delete item, then see if accept 
			//what is current container ?
			//what means delete node ? remove from parent.children ? or node.remove() ?
			
			
			var rootnodes = sel.insertionParent.parent;
			itemselect = rootnodes;
			
			// itemselect = parent;
			
			
			
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




module.exports = {
	selection,
	rename,
};