function selection(sel, item, dir, command)
{
	//command = select/move/add
	
	var parent = getLayerParent(item);
	
	var sibblings = getLayersArray(parent);
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
				children = getLayersArray(itemtest);
				indtest--;
			}
			
			var success = (children && children.length > 0);
			if(success){
				itemselect = children[children.length - 1];
			}
			
		}
		
	}
	
	
	if(itemselect){
		if(command == 'add') addLayerToSelection(sel, itemselect);
		else if(command == 'select') setSelectedLayer(sel, itemselect);
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


function setTimeoutAsync(func, delay)
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


function rename(sel, layer)
{
	var name = getLayerName(layer);
	var output = displayModalRename(layer, name);
	
	if(output){
		
		trace('output : '+output.value);
		if(output.value) setLayerName(layer, output.value);
		
		if(output.hitCtrl){
			// setTimeout(nextEdit, 500);
			nextEdit(sel, layer);
		}
	}
}

function nextEdit(sel, layer)
{
	var newlayer = selection(sel, layer, 'down', false);
	// rename(sel, newlayer);
}
