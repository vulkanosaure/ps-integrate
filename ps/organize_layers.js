var globalSel;
var globalSamecoords = [];
var groupToOrder = [];
var backgrounds = [];


function organizeLayers(sel, item)
{
	trace('organizeLayers');
	
	globalSel = sel;
	var rootNode = sel.insertionParent;
	
	//get flat array of leaves
	var leaves = [];
	rec_flatten(item, 0, leaves);
	// trace(leaves);
	
	
	//move leaves item to root
	
	leaves.forEach(function(item){
		var g = groupLayers(item, sel);
		ungroupLayers(g, sel);
	});
	
	
	//group item of same coords (to root)
	groupSameCoords(leaves);
	
	
	//get groupments
	leaves = getLayersArray(rootNode);
	groupBounded(leaves);
	
	
	leaves = getLayersArray(rootNode);
	deleteEmptyGroup(leaves);
	
	
	
	//bring all from root in a group
	
	var children = getLayersArray(rootNode);
	var newGroup = groupLayers(children, sel);
	
	groupToOrder.push(newGroup);
	
	//orderGroups
	groupToOrder.forEach(function(group){
		orderDepthGroup(group);
	});
	
	//send bg background here
	backgrounds.forEach(function(item){
		setLayerOrder(item, 'back', globalSel);
	});
	
	setLayerName(newGroup, PREFIX + '*container');
}






function orderDepthGroup(group)
{
	var children = getLayersArray(group);
	var len = children.length;
	
	// trace('children len : '+len+', groupname : '+group.name);
	for(var i=0;i<len;i++){
		var item = children[i];
		
		var b = item.bounds2;
		if(b) item.zscore = b[1] + b[0] / 10000;
		// else trace('nobounds '+item.name);
	}
	children.sort(compareOrder);
	
	children.forEach(function(item){
		setLayerOrder(item, 'back', globalSel);
	});
}





function compareOrder( a, b ) {
	
	if(!a.bounds2 || !b.bounds2) return 1;
	
	//y overlapping
	var ay1 = a.bounds2[1];
	var ay2 = a.bounds2[3];
	
	var by1 = b.bounds2[1];
	var by2 = b.bounds2[3];
	
	if(
		(ay1 >= by1 && ay1 <= by2) ||
		(ay2 >= by1 && ay2 <= by2)
	){
		if (a.bounds2[0] < b.bounds2[0]) return -1;
		if (a.bounds2[0] > b.bounds2[0]) return 1;
	}
	else{
		if (a.bounds2[1] < b.bounds2[1]) return -1;
		if (a.bounds2[1] > b.bounds2[1]) return 1;
		else return 0;
	}
	
  return 0;
}






function reverseOrder(group)
{
	var children = getLayersArray(group);
	var len = children.length;
	
	for(var i=0;i<len;i++){
		var item = children[i];
		setLayerOrder(item, 'back', globalSel);
	}
}








function groupBounded(list)
{
	var output = [];
	var len = list.length;
	var flatgrouped = [];
	
	for(var i=0;i<len;i++){
		var item = list[i];
		
		//si un item a été grouped, on ne le test plus
		if(flatgrouped.indexOf(item) == -1){
			var group = groupBounded2(item, list);
			if(group.length > 0){
				output.push({
					container: item,
					group,
				});
				flatgrouped = flatgrouped.concat(group);
				
				var newGroup = groupLayers(group.concat([item]), globalSel);
				
				groupToOrder.push(newGroup);
				backgrounds.push(item);
				
				newGroup.bounds2 = getBounds(newGroup, null);
				setLayerName(item, PREFIX + OPT_BGPARENT);
			}
		}
		
	}
	return output;
}


function groupBounded2(testitem, list)
{
	var output = [];
	var len = list.length;
	// trace("testitem : "+testitem.name);
	
	for(var i=0;i<len;i++){
		var item = list[i];
		if(item != testitem){		//skip self
			
			if(isBoundsContained(testitem, item)){
				output.push(item);
			}
		}
	}
	return output;
}



function isBoundsContained(container, child)
{
	var bcont = container.bounds2;
	var bchild = child.bounds2;
	
	//x1, y1, x2, y2
	return (
		bchild && bcont &&
		bchild[0] >= bcont[0] &&
		bchild[1] >= bcont[1] &&
		bchild[2] <= bcont[2] &&
		bchild[3] <= bcont[3]
	);
}




function deleteEmptyGroup(list)
{
	var len = list.length;
	for(var i=0;i<len;i++){
		var item = list[i];
		if(item.isContainer){
			var children = getLayersArray(item);
			if(children.length == 0) removeLayer(item);
		}
		if(!item.bounds2 && item.parent) removeLayer(item);
	}
}







function groupSameCoords(list)
{
	var output = [];
	var len = list.length;
	
	for(var i=0;i<len;i++){
		var item = list[i];
		if(globalSamecoords.indexOf(item) == -1){
			groupSameCoords2(item, list);
		}
	}
	return output;
}

function groupSameCoords2(testitem, list)
{
	var len = list.length;
	// trace("testitem : "+testitem);
	var sameBounds = [];
	
	for(var i=0;i<len;i++){
		var item = list[i];
		if(item != testitem){		//skip self
			
			// trace('-- ' + item.name+', bounds2 : '+item.bounds2);
			if(equalBounds(testitem, item)){
				sameBounds.push(item);
				globalSamecoords.push(item);
			}
		}
	}
	
	
	if(sameBounds.length > 0 && globalSamecoords.indexOf(testitem) == -1){
		globalSamecoords.push(testitem);
		var group = [testitem].concat(sameBounds);
		
		var newGroup = groupLayers(group, globalSel);
		
		newGroup.bounds2 = getBounds(newGroup, null);
		// newGroup.name = "same coords";	//debug
		
		reverseOrder(newGroup);
	}
	
}



function equalBounds(item1, item2)
{
	var b1 = item1.bounds2;
	var b2 = item2.bounds2;
	
	for(var i=0;i<6;i++){
		if(b1[i] != b2[i]) return false;
	}
	return true;
}



function rec_flatten(item, level, list)
{
	if(!level) level = 0;
	// tracerec(''+item.name, level);
	var children = getLayersArray(item);
	var len = children.length;
	
	var hasMask = hasMask(item);
	var isContainer = (len > 0);
	
	if(!isContainer || hasMask){
		list.push(item);
		item.bounds2 = getBounds(item, null);
		len = 0;
	}
	
	for(var i=0; i < len; i++){
		rec_flatten(children[i], level + 1, list);
	}
}

