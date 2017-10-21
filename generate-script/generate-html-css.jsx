FUNCTIONS_GENERATE_TEMPLATE[TPL_CONFIG.HTML_CSS] = function(indextpl, items)
{
	trace("FUNCTIONS_GENERATE_TEMPLATE ("+indextpl+")");
	
	var output = [];
	
	tpl_reset();
	
	tpl_add_line("<html>");
	
	output.push({filename : "template.html",  content : get_tpl_content()});
	
	return output;
}