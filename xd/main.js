var imp = {};
imp = {...imp, ...require('./mainExport.js')};
imp = {...imp, ...require('./selection.js')};
imp = {...imp, ...require('./debug.js')};
imp = {...imp, ...require('./organize_layers.js')};



function getItemFromSelection(selection, documentRoot)
{
	var len = selection.items.length;
	var item = selection.items[len-1];
	//edit context problem
	if(!item) item = documentRoot.children.at(0);
	return item;
}


async function exportFunction(selection, documentRoot)
{
	await imp.exportFunction(selection, documentRoot);
}

async function selectionFunction(selection, documentRoot)
{
	var dir = this;
	var item = getItemFromSelection(selection, documentRoot);
	
	await imp.selection(selection, item, dir, 'select');
}

async function selectionAddFunction(selection, documentRoot)
{
	var dir = this;
	var item = getItemFromSelection(selection, documentRoot);
	await imp.selection(selection, item, dir, 'add');
}

async function moveFunction(selection, documentRoot)
{
	var dir = this;
	var item = getItemFromSelection(selection, documentRoot);
	
	
	await imp.selection(selection, item, dir, 'move');
}


async function renameFunction(selection, documentRoot)
{
	var item = selection.items[0];
	await imp.rename(selection, item);
	
}

function organizeLayersFunction(selection, documentRoot)
{
	var item = getItemFromSelection(selection, documentRoot);
	imp.organizeLayers(selection, item);
	
}
function testFunction(selection, documentRoot)
{
	var arg = this;
	console.log('testFunction '+arg);
}




module.exports = {
  commands: {
		export: exportFunction,
		
    selectUp: selectionFunction.bind('up'),
    selectDown: selectionFunction.bind('down'),
    selectRight: selectionFunction.bind('right'),
		selectLeft: selectionFunction.bind('left'),
		
		moveUp: moveFunction.bind('up'),
		moveDown: moveFunction.bind('down'),
		moveRight: moveFunction.bind('right'),
		moveLeft: moveFunction.bind('left'),
		
    selectAddUp: selectionAddFunction.bind('up'),
		selectAddDown: selectionAddFunction.bind('down'),
		
		
		organizeLayers: organizeLayersFunction,
		
		rename: renameFunction,
		
		TestC8: testFunction.bind('TestC8'),
		testA6: testFunction.bind('testA6'),
		testA9: testFunction.bind('testA9'),
		testS4: testFunction.bind('testS4'),
		testS5: testFunction.bind('testS5'),
		testS6: testFunction.bind('testS6'),
		testS7: testFunction.bind('testS7'),
		testS8: testFunction.bind('testS8'),
		testS9: testFunction.bind('testS9'),
		
		
	},
};	