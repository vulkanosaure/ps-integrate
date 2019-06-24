var imp = {};
imp = {...imp, ...require('./debug.js')};
imp = {...imp, ...require('./platform_layer_logic.js')};
imp = {...imp, ...require('./platform_layer_utils.js')};
imp = {...imp, ...require('./constantes.js')};
var commands = require("commands");
var trace = imp.trace;
var tracerec = imp.tracerec;


/*
ALGO
recursively go through every LEAF children
find out which is surrounding which (in a non recursive way)

what does it mean to surround something
	that there's a group of children for which 
	the bounds are contained within the bound of another item
for any children
	there could be any combination
	forget it, im not listing all possible combination, the whole universe couldn't calculate that
	
for each item
	list all other item
	
complexity : n2
100 children : 10k iteration
1000 children : 1 million iteration
sounds doable

output of this algoritm :
	list of {
		'container' : node
		'items' : node[]
	}
	
	
NOTES :
- if masque, need to force as a leaf 
- if bounds identical => force as a leaf

*/

var globalSel;
var globalSamecoords = [];
var groupToOrder = [];
var backgrounds = [];


function organizeLayers(sel, item)
{
	trace('organizeLayers---');
	
	globalSel = sel;
	
	
	//get flat array of leaves
	var leaves = [];
	rec_flatten(item, 0, leaves);
	// trace(leaves);
	
	
	//move leaves item to root
	moveToRoot(sel, leaves);
	trace('leaves.length : '+leaves.length);
	
	//group item of same coords (to root)
	groupSameCoords(leaves);
	
	
	leaves = imp.getLayersArray(sel.insertionParent);
	trace('len : '+leaves.length);
	
	
	//get groupments
	leaves = imp.getLayersArray(sel.insertionParent);
	var groupments = getGroupements(leaves);
	
	
	
	leaves = imp.getLayersArray(sel.insertionParent);
	deleteEmptyGroup(leaves);
	
	
	
	
	//bring all from root in a group
	
	let children = imp.getLayersArray(sel.insertionParent);
	sel.items = children;
	commands.group();
	
	var newGroup = globalSel.items[0];
	groupToOrder.push(newGroup);
	
	
	//orderGroups
	groupToOrder.forEach((group) => {
		orderDepthGroup(group);
	});
	
	
	//send bg background here
	backgrounds.forEach((item) => {
		globalSel.items = item;
		commands.sendToBack();
	});
	
	newGroup.name = imp.PREFIX + '*container';
}


function orderDepthGroup(group)
{
	let children = imp.getLayersArray(group);
	var len = children.length;
	
	// trace('children len : '+len+', groupname : '+group.name);
	for(let i=0;i<len;i++){
		let item = children[i];
		
		var b = item.bounds2;
		if(b) item.zscore = b[1] + b[0] / 10000;
		// else trace('nobounds '+item.name);
	}
	children.sort(compareOrder);
	
	/* 
	trace('sort ::::');
	children.forEach(item => trace('-- item : '+item.name));
	*/
	
	children.forEach(item => {
		globalSel.items = item;
		commands.sendToBack();
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
	let children = imp.getLayersArray(group);
	var len = children.length;
	
	trace('children len : '+len);
	for(let i=0;i<len;i++){
		let item = children[i];
		globalSel.items = item;
		commands.sendToBack();
		
	}
}








function getGroupements(list)
{
	var output = [];
	var len = list.length;
	var flatgrouped = [];
	
	for(let i=0;i<len;i++){
		let item = list[i];
		
		//si un item a été grouped, on ne le test plus
		if(flatgrouped.indexOf(item) == -1){
			let group = getGroupements2(item, list);
			if(group.length > 0){
				output.push({
					container: item,
					group,
				});
				flatgrouped = flatgrouped.concat(group);
				
				globalSel.items = group.concat([item]);
				commands.group();
				
				var newGroup = globalSel.items[0];
				groupToOrder.push(newGroup);
				backgrounds.push(item);
				
				newGroup.bounds2 = imp.getBounds(newGroup, null);
				
				item.name = imp.PREFIX + imp.OPT_BGPARENT;
			}
		}
		
	}
	return output;
}


function getGroupements2(testitem, list)
{
	var output = [];
	var len = list.length;
	// trace("testitem : "+testitem.name);
	
	for(let i=0;i<len;i++){
		let item = list[i];
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
	for(let i=0;i<len;i++){
		let item = list[i];
		if(item.isContainer){
			let children = imp.getLayersArray(item);
			if(children.length == 0){
				item.removeFromParent();
			}
		}
		if(!item.bounds2 && item.parent) item.removeFromParent();
	}
}






function moveToRoot(sel, list)
{
	var len = list.length;
	for(let i=0;i<len;i++){
		let item = list[i];
		sel.items = item;
		commands.group();
		commands.ungroup();
		
	}
}




function groupSameCoords(list)
{
	var output = [];
	var len = list.length;
	
	for(let i=0;i<len;i++){
		let item = list[i];
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
	
	for(let i=0;i<len;i++){
		let item = list[i];
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
		globalSel.items = group;
		commands.group();
		
		var newGroup = globalSel.items[0];
		newGroup.bounds2 = imp.getBounds(newGroup, null);
		// newGroup.name = "same coords";	//debug
		
		reverseOrder(newGroup);
	}
	
}



function equalBounds(item1, item2)
{
	var b1 = item1.bounds2;
	var b2 = item2.bounds2;
	
	for(let i=0;i<6;i++){
		if(b1[i] != b2[i]) return false;
	}
	return true;
}



function rec_flatten(item, level, list)
{
	if(!level) level = 0;
	// tracerec(''+item.name, level);
	let children = imp.getLayersArray(item);
	var len = children.length;
	
	var hasMask = (item.mask);
	var isContainer = (len > 0);
	
	if(!isContainer || hasMask){
		list.push(item);
		item.bounds2 = imp.getBounds(item, null);
		len = 0;
	}
	
	for(var i=0; i < len; i++){
		rec_flatten(children[i], level + 1, list);
	}
}




module.exports = {
	organizeLayers,
}