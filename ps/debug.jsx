function trace(msg)
{
	$.writeln(msg);
}

function tracerec(msg, level)
{
	var prefix = "";
	for(var i = 0; i<level; i++) prefix += "     ";
	trace(prefix + msg);
}