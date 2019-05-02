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


module.exports = {
	trace,
	tracerec,
}
