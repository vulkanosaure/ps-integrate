FUNCTIONS_GENERATE_TEMPLATE[TPL_CONFIG.HAXE] = function(indextpl, items)
{
	trace("FUNCTIONS_GENERATE_TEMPLATE ("+indextpl+")");
	
	var output = [];
	
	tpl_reset();
	
	tpl_add_line("function test(){");
	tpl_add_line("", 1);
	tpl_add_line("trace('salut')");
	tpl_add_line("//comment");
	tpl_add_line("}", -1);
	
	tpl_br(4);
	tpl_add_line("test");
	
	output.push({filename : "template.hx",  content : get_tpl_content()});
	
	return output;
	
}



