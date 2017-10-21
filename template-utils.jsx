var tpl_content;
var tpl_indent;

function tpl_reset()
{
	tpl_content = "";
	tpl_indent = 0;
}

function tpl_add_line(content, delta_indent)
{
	if(delta_indent == undefined) delta_indent = 0;
	tpl_indent += delta_indent;
	
	var str = "";
	for(var i=0; i<tpl_indent; i++) str += "\t";
	str += content;
	str += "\n";
	
	tpl_content += str;
}

function tpl_br(nb)
{
	var str = "";
	for(var i =0; i<nb; i++) str += "\n";
	tpl_content += str;
}

function get_tpl_content()
{
	return tpl_content;
}