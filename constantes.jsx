 var PREFIX = "ps--";

var PREFIX_LENGTH = PREFIX.length;

var TYPE_GFX = "img";
var TYPE_TEXT = "txt";
var TYPE_BTN = "btn";
var TYPE_BTNC = "btnc";
var TYPE_CONTAINER = "cont";
var TYPE_DIV = "div";

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

var OPT_POSITION = "pos";
var OPT_DIRECTION = "dir";

var OPT_LAYOUT_X = "layoutx";
var OPT_LAYOUT_Y = "layouty";
var OPT_POS_X = "x";
var OPT_POS_Y = "y";
var OPT_WIDTH = "width";
var OPT_HEIGHT = "height";
var OPT_EQUALOFFSET = "equaloffset";
var OPT_DOEXPORT = "doexport";


var OPTIONS_RULES = {};
OPTIONS_RULES[OPT_TYPE] = [TYPE_GFX, TYPE_TEXT, TYPE_BTN, TYPE_BTNC, TYPE_CONTAINER];
OPTIONS_RULES[OPT_PATH] = "*";
OPTIONS_RULES[OPT_FILENAME] = new RegExp("^(?!.*\.png$).*");
OPTIONS_RULES[OPT_NAME] = new RegExp(".*(?<!(\.png)|(\.jpg))$", "i");	//not working yet
OPTIONS_RULES[OPT_BGPARENT] = [0, 1];
OPTIONS_RULES[OPT_EQUALOFFSET] = [0, 1];
OPTIONS_RULES[OPT_GFX_TYPE] = ["layout", "data"];

OPTIONS_RULES[OPT_POSITION] = ["static", "absolute"];
OPTIONS_RULES[OPT_DIRECTION] = ["col", "row"];
OPTIONS_RULES[OPT_LAYOUT_X] = ["left", "center", "right"];
OPTIONS_RULES[OPT_LAYOUT_Y] = ["top", "center", "bottom"];

OPTIONS_RULES[OPT_DOEXPORT] = ["!export", "1", "0"];

//if only value found : add property=value
var OPTIONS_SHORCUTS = {};
OPTIONS_SHORCUTS[OPT_TYPE] = [TYPE_GFX, TYPE_TEXT, TYPE_BTN, TYPE_BTNC, TYPE_CONTAINER];
OPTIONS_SHORCUTS[OPT_LAYOUT_X] = ["left", "right"];
OPTIONS_SHORCUTS[OPT_LAYOUT_Y] = ["top", "bottom"];
OPTIONS_SHORCUTS[OPT_POSITION] = ["static", "absolute"];
OPTIONS_SHORCUTS[OPT_DIRECTION] = ["row", "col"];
OPTIONS_SHORCUTS[OPT_DOEXPORT] = ["!export"];

//keywords with special meaning
var OPTIONS_SHORCUTS2 = {};
/* 
//deprecated
OPTIONS_SHORCUTS2["centerx"] = "layoutx=center";
OPTIONS_SHORCUTS2["centery"] = "layouty=center";
OPTIONS_SHORCUTS2["center"] = "layoutx=center--layouty=center";
*/

OPTIONS_SHORCUTS2["bg"] = OPT_BGPARENT + "=1";
OPTIONS_SHORCUTS2["abs"] = OPT_POSITION + "=absolute";

//if found, add =1 behind
var OPTIONS_SHORCUTS3 = [OPT_BGPARENT, OPT_EQUALOFFSET];

//prefix
var OPTIONS_SHORCUTS_PREFIX = {};
OPTIONS_SHORCUTS_PREFIX[OPT_NAME] = "#";


var EXPORT_FOLDER = "EXPORT-ps-integrate";

var EXPORT_FOLDER_IMG = "images";
var EXPORT_FOLDER_TPL = "templates";

var DEBUG_MODE = true;

