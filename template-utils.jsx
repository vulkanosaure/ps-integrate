var tpl_content;
var tpl_indent;

function tpl_reset()
{
	tpl_content = "";
	tpl_indent = 0;
}

function tpl_add_line(content, indent)
{
	if(indent == undefined) indent= 0;
	
	var str = "";
	for(var i=0; i<indent; i++) str += "\t";
	str += content;
	str += "\n";
	
	tpl_content += str;
}

function tpl_add_block(content, indent)
{
	var tab = content.split("\n");
	var len = tab.length;
	for(var i = 0; i<len; i++) tpl_add_line(tab[i], indent);
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


function convertTemplate(path, params)
{
	var output = loadFilePath_cache(path);
	
	for(var k in params){
		var regexp = new RegExp("{{"+k+"}}", "g");
		output = output.replace(regexp, params[k]);
	}
	return output;
}







