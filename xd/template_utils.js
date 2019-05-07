var imp = {};
imp = {...imp, ...require('./platform_export.js')};

const fs = require("uxp").storage.localFileSystem;

const file_debug = require('./debug.js');
var trace = file_debug.trace;
imp = {...imp, ...require('./constantes.js')};

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


async function convertTemplate(path, params)
{
	// trace('convertTemplate : '+path);
	let folderPlugin = await fs.getPluginFolder();
	var output = await imp.loadFilePath_cache(folderPlugin, path);
	
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
	var tab = [];
	
	let fontname = textdata.font.toLowerCase();
	fontname = fontname.replace(new RegExp(' ', 'g'), '');
	tab.push(fontname);
	// output += textdata.color;
	
	var size = textdata.size;
	if(config.retina) size *= 0.5;	//retina
	size *= config.font_size_multiplier;
	size = Math.round(size);
	tab.push(size);
	
	// output += textdata.halign.substr(0, 1) + "";
	// output += textdata.letterspacing + "";
	// if(textdata.leading != undefined) output += textdata.leading + "";
	tab.push(textdata.letterspacing);
	
	let suffixStyle = '';
	if(textdata.bold) suffixStyle += 'b';
	if(textdata.italic) suffixStyle += 'i';
	if(suffixStyle) tab.push(suffixStyle);
	
	var output = tab.join('-');
	output = getVarname(output);
	return output;
}


function getTextColorID(textdata, colors)
{
	
	var output = '';
	
	for(var k in colors){
		if(k.toLowerCase() == textdata.color.toLowerCase()){
			output += colors[k];
			break;
		}
	}
	
	if(output == '') output = 'col_'+textdata.color;
	return output;
}


function getVarname(str)
{
	// str = str.replace(/-/g, "_");
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
		if(!imp.DEBUG_MODE) throw new Error("item of type '"+item.type+"' doesn't respect the tagConfig");
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


function transformMargins(data)
{
	trace('transformData');
	
	let listMargin = ['top', 'right', 'bottom', 'left'];
	
	let countMargin = 0;
	for(let i in listMargin){
		let prop = 'margin-' + listMargin[i];
		if(data[prop]) countMargin++;
	}
	trace('countMargin : '+countMargin);
	if(countMargin > 1){
		
		let values = [];
		for(let i in listMargin){
			let prop = 'margin-' + listMargin[i];
			var value = data[prop] ? data[prop].data : 0;
			values.push(value);
			
			if(data[prop]){
				trace('connnnfig : '+prop);
				for(let k in data[prop].config) trace('--- conf '+k+' : '+data[prop].config[k]);
			}
			
		}
		trace('values : '+values);
		
		if(values[0] == values[2] && values[1] == values[3]){
			values = values.splice(0, 2);
		}
		
		let marginValue = values.join(' ');
		data['margin'] = {
			data  :marginValue,
			config: {},
		};
		
		for(let i in listMargin){
			let prop = 'margin-' + listMargin[i];
			if(data[prop]) delete data[prop];
		}
		
		
		return data;
	}
	
	
	for(let k in data){
		
		let obj = data[k];
		trace(k+' : '+obj.data+', config : '+obj.config);
	}
}




function propsToString(props, options, closeTag=true)
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
		
		//exception, no line break
		if(i == 'height' && props['width']){
			tab[tab.length - 1] += '; '+str;
		}
		else if((i == 'top' || i=='bottom') && (props['left'] || props['right'])){
			tab[tab.length - 1] += '; '+str;
		}
		/* 
		//bug in some condition (removed margin-top)
		else if((i == 'margin-top' && props['margin-left'])){
			tab[tab.length - 1] += '; '+str;
		}
		 */
		else tab.push(str);
	}

	var str;
	if(!options.multiline) str = options.separator + " ";
	else str = options.separator + "\n\t";
	output += tab.join(str);
	
	if(options.multiline){
		if(tab.length > 0) output += options.separator;
	}
	if(closeTag) output += "\n}";
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



function getColorProperty(obj, variables)
{
	let value = '';
	if(obj.a == 255) value = obj.hex;
	else value = obj.rgba;
	
	value = checkSassVariable(value, variables, 'color');
	return value;
}


function checkSassVariable(value, variables, type)
{
	let caseSensitive;
	if(type == 'color') caseSensitive = false;
	else caseSensitive = true;
	
	let colorHandler = (type == 'color');
	if(colorHandler){
		if(value.length == 4)	value = value + value.substr(1);
	}
	
	let valueLC = value.toLowerCase();
	
	for(var k in variables){
		let v = variables[k];
		let hit = false;
		
		if(!caseSensitive && valueLC == v.toLowerCase()) hit = true;
		else if(caseSensitive && value == v) hit = true;
		
		if(hit){
			value = '$' + k;
			break;
		}
	}
	
	return value;
}




module.exports = {
	mapProps,
	propsToString,
	transformMargins,
	getCloseTag,
	tpl_reset,
	tpl_add_line,
	tpl_add_block,
	tpl_br,
	get_tpl_content,
	convertTemplate,
	getLayoutID,
	getTextFormatID,
	getTextColorID,
	getVarname,
	getColorProperty,
};
