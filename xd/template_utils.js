var imp = {};
imp = {...imp, ...require('./platform_export.js')};
imp = {...imp, ...require('./utils.js')};

const fs = require("uxp").storage.localFileSystem;

const file_debug = require('./debug.js');
var trace = file_debug.trace;
imp = {...imp, ...require('./constantes.js')};

var tpl_content;
var templateData = {};
var tpl_indent;

function tpl_reset()
{
	tpl_content = "";
	tpl_indent = 0;
}




function tpl_add_content(item, content, indent, linebreak, isBlock, contentTpl)
{
	var func = (isBlock) ? tpl_add_block : tpl_add_line;
	func(null, content, indent, linebreak);
	
	if(item['templateMode'] == 'write'){
		
		if(contentTpl == undefined) contentTpl = content;
		
		let idtpl = item['tplparent'];
		indent -= item['tplmodelIndent'];
		func(idtpl, contentTpl, indent, linebreak);
	}
	
}




function tpl_add_line(idtpl, content, indent, linebreak)
{
	if(linebreak == undefined) linebreak= true;
	if(indent == undefined) indent= 0;
	
	var str = "";
	for(var i=0; i<indent; i++) str += "\t";
	str += content;
	if(linebreak) str += "\n";
	
	if(!idtpl) tpl_content += str;
	else{
		if(templateData[idtpl] == undefined) templateData[idtpl] = "";
		templateData[idtpl] += str;
	}
	
}

function tpl_add_block(idtpl, content, indent, linebreak)
{
	if(linebreak == undefined) linebreak= true;
	if(indent == undefined) indent= 0;
	
	var tab = content.split("\n");
	var len = tab.length;
	for(var i = 0; i<len; i++) tpl_add_line(idtpl, tab[i], indent, linebreak);
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


async function convertTemplate(path, params, keepNotFound)
{
	if(keepNotFound == undefined) keepNotFound = false;
	
	// trace('convertTemplate : '+path);
	let folderPlugin = await imp.getPluginFolder();
	var output = await imp.loadFilePath_cache(folderPlugin, path);
	return convertTemplateFromStr(output, params, keepNotFound);
	
}


function convertTemplateFromStr(str, params, keepNotFound)
{
	var output = str;
	for(var k in params){
		var regexp = new RegExp("{{"+k+"}}", "g");
		output = output.replace(regexp, params[k]);
	}
	
	if(!keepNotFound){
		var regexp = new RegExp("{{.+?}}", "g");
		output = output.replace(regexp, "");
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


function transformMargins(data, _property, nameItem="")
{
	// trace('transformData');
	
	let listMargin = ['top', 'right', 'bottom', 'left'];
	
	let countMargin = 0;
	for(let i in listMargin){
		let prop = _property + '-' + listMargin[i];
		// trace('- data[prop] : '+data[prop]+', .data : '+data[prop].data);
		if(data[prop] && data[prop].data != 0) countMargin++;
	}
	// trace('_property : '+_property+', countMargin : '+countMargin);
	
	if(countMargin > 1){
		
		let values = [];
		for(let i in listMargin){
			let prop = _property + '-' + listMargin[i];
			var value = data[prop] ? data[prop].data : 0;
			values.push(value);
			
		}
		// trace('values : '+values);
		
		if(values[0] == values[2] && values[1] == values[3]){
			values = values.splice(0, 2);
			if(values[0] == values[1]) values = values.splice(0, 1);
		}
		else if(values[1] == values[3]){
			values = values.splice(0, 3);
		}
		
		
		let marginValue = values.join(' ');
		data[_property] = {
			data  :marginValue,
			config: {},
		};
		
		for(let i in listMargin){
			let prop = _property + '-' + listMargin[i];
			if(data[prop]) delete data[prop];
		}
	}
	
	return data;
}



/*
filters can be : "position", "render"
*/

var filterProps = {
	'position' : [
		//'display',
		'position',
		'margin',
		'margin-left',
		'margin-right',
		'margin-top',
		'margin-bottom',
		'left',
		'top',
		'right',
		'bottom',
		'translate',
		'flex',
	],
	
};


function propsToString(props, options, closeTag, filter)
{
	if(closeTag == undefined) closeTag = true;
	
	if(options.multiline == undefined) options.multiline = false;
	if(options.quoteProperty == undefined) options.quoteProperty = "double";	//none-simple-double
	if(options.separator == undefined) options.separator = ",";
	if(options.equal == undefined) options.equal = " : ";
	
	let propsOK = [];
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
		
		
		if(filterProp(i, obj.config, filter)){
			
			//exception, no line break
			if(i == 'height' && propsOK.indexOf('width') > -1){
				tab[tab.length - 1] += '; '+str;
			}
			else if(i == 'width' && propsOK.indexOf('height') > -1){
				tab[tab.length - 1] += '; '+str;
			}
			else if((i == 'top' || i=='bottom') && (props['left'] || props['right'])){
				tab[tab.length - 1] += '; '+str;
			}
			else{
				tab.push(str);
			}
			propsOK.push(i);
		}
		
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



function filterProp(prop, config, filter)
{
	if(!filter) return true;
	
	var isPosition = filterProps['position'].indexOf(prop) > -1;
	var typeProp = isPosition ? 'position' : 'render';
	if(config && config.filter) typeProp = config.filter;
	
	if(filter == 'position'){
		// trace('config.filter : '+(config && config.filter)+', isPosition : '+isPosition);
		// trace('typeProp  ')
	}
	
	return typeProp == filter;
	
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




function getSelector(item, parent, sass_indent)
{
	var selector;	
	if(item.selectorType == 'classname'){
		var layout_id = getLayoutID(item);
		selector = layout_id;
		if(sass_indent){
			selector = imp.encodeNameParentRef(selector, parent);
		}
		if(selector.charAt(0) != '&') selector = '.' + selector;
	}
	else if(item.selectorType == 'tag'){
		selector = '& > ' + item.tag;
		if(item.countTag > 1){
			// var positionTag = item.positionTag + 1;
			var positionTag = item.indexTag + 1;
			selector += ':nth-child(' + positionTag + ')';
		}
	}
	return selector;
}





async function getTemplateData(id)
{
	//todo read from memory
	output = templateData[id];
	if(output) return {
		output,
		type: 'memory',
	}
	
	
	//read from filesystem
	var path = 'tpl/' + id + '.txt';
	var exportFolder = await imp.getDataFolder();
	var output = await imp.loadFilePath_cache(exportFolder, path);
	if(output) return{
		output,
		type: 'file',
	}
	
	
	//throw error
	throw new Error('template "'+id+'" wasn\'t found');
	
	return null;
}




function getPlaceHolderValues(item, config)
{
	var output = {};
	getPlaceHolderValues_rec(item, config, output);
	return output;
}
function getPlaceHolderValues_rec(parent, config, values)
{
	var item = parent;
	if(item[imp.OPT_PLACEHOLDER]){
			
		var key = item[imp.OPT_PLACEHOLDER];
		var value;
		if(item.type == imp.TYPE_TEXT){
			value = item.textdata.text;
			value = nl2br(value);
		}
		else if(item.type == imp.TYPE_GFX){
			
			if(item[imp.OPT_IMGTYPE]=='svg-inline'){
				value = '<path d="'+ item.pathdata.data +'"/>';
				values[key + '_width'] = item.widthPx;
				values[key + '_height'] = item.heightPx;
			}
			else{
				value = config.prefix_images + item.fullpath;
			}
			
		}
		
		values[key] = value;
	}
	
	
	var len = parent.childrens ? parent.childrens.length : 0;
	for(var i=0; i<len; i++){
		
		var item = parent.childrens[i];
		getPlaceHolderValues_rec(item, config, values);
		
	}
}





function nl2br(text)
{
	//text = text.replace(/\\n/g, "<br />");	//phothoshop ? (introduire constante/conditions)
	text = text.replace(/\n/g, "<br />");
	return text;
}



//left, top, right, bottom...
//to flex-end, start, center
function getFlexAlignValue(value)
{
	if(value == 'center') return value;
	if(['left', 'top'].indexOf(value) > -1) return 'flex-start';
	else if(['right', 'bottom'].indexOf(value) > -1) return 'flex-end';
	return null;
}


function setMarginValue(model, key, prop, value)
{
	if(value){
		var sufix = '';
		if(value != 'auto') sufix = 'px';
		model[key] = { name: prop, value: value, sufix: sufix };
	}
}


function getDimensionValue(parent, item, prop, propPx)
{
	var dim = item[prop];
	var value;
	var suffix;
	if(dim == 'px'){
		value = item[propPx];
		suffix = 'px';
	}
	else if(dim == '%'){
		let parentDim = parent ? parent[propPx] : 0;
		let percent;
		if(parent) percent = Math.round(item[propPx] / parent[propPx] * 100);
		else percent = 100;
		value = percent;
		suffix = '%';
	}
	else throw new Error('todo');
	
	return { value: value, sufix : suffix };
}







module.exports = {
	mapProps,
	propsToString,
	transformMargins,
	getCloseTag,
	tpl_reset,
	tpl_add_content,
	tpl_add_line,
	tpl_add_block,
	tpl_br,
	get_tpl_content,
	convertTemplate,
	convertTemplateFromStr,
	getLayoutID,
	getTextFormatID,
	getTextColorID,
	getVarname,
	getColorProperty,
	getSelector,
	getTemplateData,
	getPlaceHolderValues,
	templateData,
	nl2br,
	getFlexAlignValue,
	setMarginValue,
	getDimensionValue,
};
