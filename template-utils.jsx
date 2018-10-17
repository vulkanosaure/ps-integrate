var tpl_content;
var tpl_indent;

function tpl_reset()
{
	tpl_content = "";
	tpl_indent = 0;
}

function tpl_add_line(content, indent, linebreak)
{
	if(linebreak == undefined) linebreak= true;
	if(indent == undefined) indent= 0;
	
	var str = "";
	for(var i=0; i<indent; i++) str += "\t";
	str += content;
	if(linebreak) str += "\n";
	
	tpl_content += str;
}

function tpl_add_block(content, indent, linebreak)
{
	if(linebreak == undefined) linebreak= true;
	if(indent == undefined) indent= 0;
	
	var tab = content.split("\n");
	var len = tab.length;
	for(var i = 0; i<len; i++) tpl_add_line(tab[i], indent, linebreak);
}


function tpl_br(nb, indent, contentdebug)
{
	var debug = false;
	var str = "";
	var strindent = "";
	for(var i =0; i<indent; i++) strindent += "\t";
	for(var i =0; i<nb; i++){
		if(!debug) str += strindent + "\n";
		else str += strindent + contentdebug + "\n";
	}
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




function getLayoutID(item)
{
	var output = getVarname(item.name);
	return output;
}


function getTextFormatID(textdata, config)
{
	var output = "";
	output += textdata.font;
	output += "_";
	// output += textdata.color;
	// output += "_";
	
	var size = textdata.size;
	size *= 0.5;	//retina
	size *= config.font_size_multiplier;
	size = Math.round(size);
	
	output += size;
	
	// output += textdata.halign.substr(0, 1) + "";
	// output += textdata.letterspacing + "";
	// if(textdata.leading != undefined) output += textdata.leading + "";
	
	output = getVarname(output);
	return output;
}


function getTextColorID(textdata, colors)
{
	var output = '';
	if(colors[textdata.color]) output += colors[textdata.color];
	else output += 'col_'+textdata.color;
	return output;
}


function getVarname(str)
{
	str = str.replace(/-/g, "_");
	//remove all chars not good for variable names
	return str;
}



function getCloseTag(config, itemcode)
{
	var startchar = config.start;
	var endchar = config.end;
	var closechar = config.close;
	
	var regex = new RegExp(startchar + "(\\w+)");
	var firstline = itemcode.split("\n")[0];
	var matches = firstline.match(regex);
	
	if(matches == null || matches.length < 1){
		if(!DEBUG_MODE) throw new Error("item of type '"+item.type+"' doesn't respect the tagConfig");
		else return "";
	}
	var tagname = matches[1];
	var str = startchar + closechar + tagname + endchar;
	return str;
}



Array.prototype.indexOf = function(value)
{
	var len = this.length;
	for(var i = 0; i< len; i++){
		//trace("this["+i+"] : "+this[i]);
		if(this[i] == value) return i;
	}
	return -1;
}

Array.prototype.reverse = function(tab)
{
	return tab;
}





//____________________________________________________________
//for template-functions

function propsToString(props, options)
{
	if(options.multiline == undefined) options.multiline = false;
	if(options.quoteProperty == undefined) options.quoteProperty = "double";	//none-simple-double
	if(options.separator == undefined) options.separator = ",";
	if(options.equal == undefined) options.equal = " : ";
	
	
	var output = "{";
	if(options.multiline) output += "\n\t";
	var tab = [];
	for(var i in props){
		var quotestr = "";
		if(options.quoteProperty == "simple") quotestr = "'";
		else if(options.quoteProperty == "double") quotestr = '"';
		
		var obj = props[i];
		var config = obj.config;
		var str = '';
		if(config.comment) str += '//';
		
		if(!config.raw){
			str += quotestr + i + quotestr;
			str += options.equal;
		}
		
		str += obj.data;
		
		//exception, width height, one line
		if(i == 'height' && props['width']){
			tab[tab.length - 1] += '; '+str;
		}
		else if(i == 'top' && props['left']){
			tab[tab.length - 1] += '; '+str;
		}
		else tab.push(str);
	}

	var str;
	if(!options.multiline) str = options.separator + " ";
	else str = options.separator + "\n\t";
	output += tab.join(str);
	
	if(options.multiline){
		if(tab.length > 0) output += options.separator;
		output += "\n";
	}
	output += "}";
	return output;
}



function mapProps(model, props)
{
	var output = {};
	for(var i in model){
		
		var tab = model[i];
		
		if(props[i] != undefined || (tab != null && tab.value != undefined)){
			
			var value;
			if(tab != null && tab.value != undefined) value = tab.value;
			else value = props[i];
			var propname = (tab != null && tab.name != undefined) ? tab.name : i;
			
			var prefix = (tab != null && tab.prefix != undefined) ? tab.prefix : "";
			var sufix = (tab != null && tab.sufix != undefined) ? tab.sufix : "";
			
			
			if(tab != null){
				if(tab.quote != undefined){
					var strquote;
					if(tab.quote == "simple") strquote = "'";
					else if(tab.quote == "double") strquote = '"';
					else strquote = "";
					prefix = strquote;
					sufix = strquote;
				}
			}
			
			if(tab != null && tab.multiplier != undefined){
				value *= tab.multiplier;
				if(tab.round) value = Math.round(value);
			}
			
			var keyobj = propname;
			output[keyobj] = {
				data: prefix + value + sufix,
				config:tab,
			};
		}
		
	}
	return output;
}




