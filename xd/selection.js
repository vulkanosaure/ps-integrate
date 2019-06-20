var imp = {};
imp = {...imp, ...require('./platform_layer_logic.js')};
imp = {...imp, ...require('./debug.js')};
imp = {...imp, ...require('./dialog.js')};
var trace = imp.trace;


function selection(selection, item, dir)
{
	var parent = imp.getLayerParent(item);
	
	var sibblings = imp.getLayersArray(parent);
	var len = sibblings.length;
	
	var itemselect;
	
	if(['up', 'down'].indexOf(dir) > -1){
		
		var index = sibblings.indexOf(item);
		var delta = dir == 'up' ? -1 : 1;
		var index2 = index - delta;
		
		if(index2 >= 0 && index2 <= len - 1){
			
			itemselect = sibblings[index2];
		}
		else{
			dir = 'left';
			if(index2 >= len){
				//todo : ask next left
			}
		}
	}
	
	if(['left', 'right'].indexOf(dir) > -1){
		
		trace('todo : '+dir);
		
		if(dir == 'left') itemselect = parent;
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
	
	if(itemselect) imp.setSelectedLayer(selection, itemselect);
}



function rename(layer)
{
	var name = imp.getLayerName(layer);
	imp.displayModalRename(layer, name);
}



module.exports = {
	selection,
	rename,
};