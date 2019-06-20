var imp = {};
imp = {...imp, ...require('./mainExport.js')};
imp = {...imp, ...require('./selection.js')};





async function exportFunction(selection, documentRoot)
{
	await imp.exportFunction(selection, documentRoot);
}

function selectionFunction(selection, documentRoot)
{
	var dir = this;
	var item = selection.items[0];
	
	//edit context problem
	if(!item) item = documentRoot.children.at(0);
	
	imp.selection(selection, item, dir);
	
	
}

function renameFunction(selection, documentRoot)
{
	var item = selection.items[0];
	imp.rename(item);
	
}





module.exports = {
  commands: {
		export: exportFunction,
		
    selectUp: selectionFunction.bind('up'),
    selectDown: selectionFunction.bind('down'),
    selectRight: selectionFunction.bind('right'),
		selectLeft: selectionFunction.bind('left'),
		rename: renameFunction,
	},
};	