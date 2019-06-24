function trace(msg)
{
	console.log(msg);
}

function tracerec(msg, level)
{
	var prefix = "";
	for(var i = 0; i<level; i++) prefix += "     ";
	trace(prefix + msg);
}

function traceNode(layer, level)
{
	if(!level) level = 0;
	tracerec(''+layer.name, level);
	
	let list = layer.children;
	let children = [];
	list.forEach(item => children.push(item));
	for(var i=0; i<children.length;i++){
		traceNode(children[i], level + 1);
	}
}




module.exports = {
	trace,
	tracerec,
	traceNode,
}
