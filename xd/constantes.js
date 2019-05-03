var PREFIX = "ps--";

var PREFIX_LENGTH = PREFIX.length;

var TYPE_GFX = "img";
var TYPE_TEXT = "txt";
var TYPE_BTN = "btn";
var TYPE_BTNC = "btnc";
var TYPE_CONTAINER = "cont";
var TYPE_SHAPE = "shape";

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
var OPT_ALIGN_ITEMS = "alignitems";
var OPT_POS_X = "x";
var OPT_POS_Y = "y";
var OPT_WIDTH = "width";
var OPT_HEIGHT = "height";
var OPT_EQUALOFFSET = "equaloffset";
var OPT_DOEXPORT = "doexport";
var OPT_IMGTYPE = "imgtype";


var OPTIONS_RULES = {};
OPTIONS_RULES[OPT_TYPE] = [TYPE_GFX, TYPE_TEXT, TYPE_BTN, TYPE_BTNC, TYPE_CONTAINER, TYPE_SHAPE];
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
OPTIONS_RULES[OPT_ALIGN_ITEMS] = ["start", "center", "end"];

OPTIONS_RULES[OPT_DOEXPORT] = ["!export", "1", "0"];
OPTIONS_RULES[OPT_IMGTYPE] = ["png", "svg"];

//if only value found : add property=value
var OPTIONS_SHORCUTS = {};
OPTIONS_SHORCUTS[OPT_TYPE] = [TYPE_GFX, TYPE_TEXT, TYPE_BTN, TYPE_BTNC, TYPE_CONTAINER, TYPE_SHAPE];
OPTIONS_SHORCUTS[OPT_LAYOUT_X] = ["left", "right"];
OPTIONS_SHORCUTS[OPT_LAYOUT_Y] = ["top", "bottom"];
OPTIONS_SHORCUTS[OPT_POSITION] = ["static", "absolute"];
OPTIONS_SHORCUTS[OPT_DIRECTION] = ["row", "col"];
OPTIONS_SHORCUTS[OPT_DOEXPORT] = ["!export"];

//keywords with special meaning
var OPTIONS_SHORCUTS2 = {};

OPTIONS_SHORCUTS2["centerx"] = OPT_LAYOUT_X + "=center";
OPTIONS_SHORCUTS2["centery"] = OPT_LAYOUT_Y + "=center";
OPTIONS_SHORCUTS2["center"] = OPT_LAYOUT_X+"=center--"+OPT_LAYOUT_Y+"=center";
OPTIONS_SHORCUTS2["svg"] = OPT_TYPE + "=img--"+OPT_IMGTYPE+"=svg";


OPTIONS_SHORCUTS2["bg"] = OPT_BGPARENT + "=1";
OPTIONS_SHORCUTS2["abs"] = OPT_POSITION + "=absolute";

//if found, add =1 behind
var OPTIONS_SHORCUTS3 = [OPT_BGPARENT, OPT_EQUALOFFSET];

//prefix
var OPTIONS_SHORCUTS_PREFIX = {};
OPTIONS_SHORCUTS_PREFIX[OPT_NAME] = "*";


var EXPORT_FOLDER = "EXPORT-ps-integrate";

var EXPORT_FOLDER_IMG = "images";
var EXPORT_FOLDER_TPL = "templates";

var DEBUG_MODE = true;
var ENABLE_EXPORT = true;


var DOC_WIDTH;
var DOC_HEIGHT;



module.exports = {
	PREFIX,
	PREFIX_LENGTH,
	TYPE_GFX,
	TYPE_TEXT,
	TYPE_BTN,
	TYPE_BTNC,
	TYPE_CONTAINER,
	TYPE_SHAPE,
	CONTAINERS_TYPE,
	EXPORTS_TYPE,
	BTNS_TYPE,
	OPT_TYPE,
	OPT_PATH,
	OPT_FILENAME,
	OPT_NAME,
	OPT_BGPARENT,
	OPT_GFX_TYPE,
	OPT_POSITION,
	OPT_DIRECTION,
	OPT_LAYOUT_X,
	OPT_LAYOUT_Y,
	OPT_ALIGN_ITEMS,
	OPT_POS_X,
	OPT_POS_Y,
	OPT_WIDTH,
	OPT_HEIGHT,
	OPT_EQUALOFFSET,
	OPT_DOEXPORT,
	OPT_IMGTYPE,
	OPTIONS_RULES,
	OPTIONS_SHORCUTS,
	OPTIONS_SHORCUTS2,
	OPTIONS_SHORCUTS3,
	OPTIONS_SHORCUTS_PREFIX,
	EXPORT_FOLDER,
	EXPORT_FOLDER_IMG,
	EXPORT_FOLDER_TPL,
	DEBUG_MODE,
	ENABLE_EXPORT,
	DOC_WIDTH,
	DOC_HEIGHT,
};