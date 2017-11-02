var PREFIX = "ps--";

var PREFIX_LENGTH = PREFIX.length;

var TYPE_GFX = "gfx";
var TYPE_TEXT = "txt";
var TYPE_BTN = "btn";
var TYPE_BTNC = "btnc";
var TYPE_CONTAINER = "cont";

var CONTAINERS_TYPE = [TYPE_CONTAINER, TYPE_BTNC];
var EXPORTS_TYPE = [TYPE_GFX, TYPE_BTN];
var BTNS_TYPE = [TYPE_BTN, TYPE_BTNC];


//only options that we can set in layers names
var OPT_TYPE = "type";
var OPT_PATH = "path";
var OPT_FILENAME = "filename";
var OPT_NAME = "name";
var OPT_BGPARENT = "bgparent";
var OPT_GFX_TYPE = "gfxtype";				//layout-data
var OPT_BTNC = "btnc";						//bg-child
var OPT_LAYOUT_X = "layoutx";			//left left% center right right%
var OPT_LAYOUT_Y = "layouty";			//top top% center bottom bottom%
var OPT_POS_X = "x";
var OPT_POS_Y = "y";
var OPT_WIDTH = "width";
var OPT_HEIGHT = "height";

var EXPORT_FOLDER = "ps-integrate-export";

var EXPORT_FOLDER_IMG = "images";
var EXPORT_FOLDER_TPL = "templates";


var TPL_CONFIG = {
	HTML_CSS : 0,
	HAXE : 1,
}

var FUNCTIONS_GENERATE_TEMPLATE = {};


