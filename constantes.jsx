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
var OPT_GFX_TYPE = "gfxtype";
var OPT_BTNC = "btnc";
var OPT_LAYOUT_X = "layoutx";
var OPT_LAYOUT_Y = "layouty";
var OPT_POS_X = "x";
var OPT_POS_Y = "y";
var OPT_WIDTH = "width";
var OPT_HEIGHT = "height";


var OPTIONS_RULES = {};
OPTIONS_RULES[OPT_TYPE] = [TYPE_GFX, TYPE_TEXT, TYPE_BTN, TYPE_BTNC, TYPE_CONTAINER];
OPTIONS_RULES[OPT_PATH] = "*";
OPTIONS_RULES[OPT_FILENAME] = new RegExp("^(?!.*\.png$).*");
OPTIONS_RULES[OPT_NAME] = new RegExp(".*(?<!(\.png)|(\.jpg))$", "i");	//not working yet
OPTIONS_RULES[OPT_BGPARENT] = [0, 1];
OPTIONS_RULES[OPT_GFX_TYPE] = ["layout", "data"];
OPTIONS_RULES[OPT_BTNC] = ["bg", "child"];
OPTIONS_RULES[OPT_LAYOUT_X] = ["left", "center", "right"];
OPTIONS_RULES[OPT_LAYOUT_Y] = ["top", "center", "bottom"];


var EXPORT_FOLDER = "ps-integrate-export";

var EXPORT_FOLDER_IMG = "images";
var EXPORT_FOLDER_TPL = "templates";

var DEBUG_MODE = true;
