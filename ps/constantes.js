var PLATFORM = 'ps';

var PREFIX = "ps--";

var PREFIX_LENGTH = PREFIX.length;

var TYPE_GFX = "img";
var TYPE_TEXT = "txt";
var TYPE_CONTAINER = "cont";
var TYPE_SHAPE = "shape";

var CONTAINERS_TYPE = [TYPE_CONTAINER];
var EXPORTS_TYPE = [TYPE_GFX];



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
var OPT_CHILDREN_X = "childrenx";
var OPT_CHILDREN_Y = "childreny";
var OPT_EQUALOFFSET = "equaloffset";
var OPT_IMGTYPE = "imgtype";
var OPT_LVL = "lvl";
var OPT_TAG = "tag";
var OPT_TPL = "tpl";
var OPT_TPLMODEL = "tplmodel";
var OPT_PLACEHOLDER = "ph";
var OPT_WIDTH = "width";
var OPT_HEIGHT = "height";
var OPT_CLASS = "class";


var list_tags = ["a", "button", "p", "img", "h1", "h2", "h3", "h4", "h5", "span", "div"];
var LIST_TAGS_NOCLOSE = ["img"];


var OPTIONS_RULES = {};
OPTIONS_RULES[OPT_TYPE] = [TYPE_GFX, TYPE_TEXT, TYPE_CONTAINER, TYPE_SHAPE];
OPTIONS_RULES[OPT_PATH] = "*";
OPTIONS_RULES[OPT_FILENAME] = new RegExp("^(?!.*\.png$).*");
OPTIONS_RULES[OPT_NAME] = new RegExp(".*(?<!(\.png)|(\.jpg))$", "i");	//not working yet
OPTIONS_RULES[OPT_BGPARENT] = [0, 1];
OPTIONS_RULES[OPT_EQUALOFFSET] = [0, 1];
OPTIONS_RULES[OPT_GFX_TYPE] = ["layout", "data"];
OPTIONS_RULES[OPT_LVL] = ["*"];
OPTIONS_RULES[OPT_CLASS] = ["*"];
OPTIONS_RULES[OPT_TAG] = list_tags;
OPTIONS_RULES[OPT_TPL] = ["*"];
OPTIONS_RULES[OPT_TPLMODEL] = ["*"];
OPTIONS_RULES[OPT_PLACEHOLDER] = ["*"];
OPTIONS_RULES[OPT_WIDTH] = ["px", "%"];
OPTIONS_RULES[OPT_HEIGHT] = ["px", "%"];

OPTIONS_RULES[OPT_POSITION] = ["static", "absolute"];
OPTIONS_RULES[OPT_DIRECTION] = ["col", "row"];
OPTIONS_RULES[OPT_LAYOUT_X] = ["left", "center", "right"];
OPTIONS_RULES[OPT_LAYOUT_Y] = ["top", "center", "bottom"];
OPTIONS_RULES[OPT_CHILDREN_X] = ["left", "center", "right"];
OPTIONS_RULES[OPT_CHILDREN_Y] = ["top", "center", "bottom"];

OPTIONS_RULES[OPT_IMGTYPE] = ["png", "svg", "svg-inline"];

//if only value found : add property=value
var OPTIONS_SHORCUTS = {};
OPTIONS_SHORCUTS[OPT_TYPE] = [TYPE_GFX, TYPE_TEXT, TYPE_CONTAINER, TYPE_SHAPE];
OPTIONS_SHORCUTS[OPT_LAYOUT_X] = ["left", "right"];
OPTIONS_SHORCUTS[OPT_LAYOUT_Y] = ["top", "bottom"];
OPTIONS_SHORCUTS[OPT_POSITION] = ["static", "absolute"];
OPTIONS_SHORCUTS[OPT_DIRECTION] = ["row", "col"];
//disable because of conflict with type=img, use shorcut < instead
// OPTIONS_SHORCUTS[OPT_TAG] = list_tags;	

//keywords with special meaning
var OPTIONS_SHORCUTS2 = {};

OPTIONS_SHORCUTS2["centerx"] = OPT_LAYOUT_X + "=center";
OPTIONS_SHORCUTS2["centery"] = OPT_LAYOUT_Y + "=center";
OPTIONS_SHORCUTS2["center"] = OPT_LAYOUT_X+"=center--"+OPT_LAYOUT_Y+"=center";

OPTIONS_SHORCUTS2["png"] = OPT_TYPE + "=img--"+OPT_IMGTYPE+"=png";
OPTIONS_SHORCUTS2["svg"] = OPT_TYPE + "=img--"+OPT_IMGTYPE+"=svg";
OPTIONS_SHORCUTS2["svg-inline"] = OPT_TYPE + "=img--"+OPT_IMGTYPE+"=svg-inline";

OPTIONS_SHORCUTS2["ccenterx"] = OPT_CHILDREN_X + "=center";
OPTIONS_SHORCUTS2["ccentery"] = OPT_CHILDREN_Y + "=center";
OPTIONS_SHORCUTS2["ccenter"] = OPT_CHILDREN_X+"=center--"+OPT_CHILDREN_Y+"=center";
OPTIONS_SHORCUTS2["cleft"] = OPT_CHILDREN_X + "=left";
OPTIONS_SHORCUTS2["cright"] = OPT_CHILDREN_X + "=right";
OPTIONS_SHORCUTS2["ctop"] = OPT_CHILDREN_Y + "=top";
OPTIONS_SHORCUTS2["cbottom"] = OPT_CHILDREN_Y + "=bottom";


OPTIONS_SHORCUTS2["bg"] = OPT_BGPARENT + "=1";
OPTIONS_SHORCUTS2["abs"] = OPT_POSITION + "=absolute";

OPTIONS_SHORCUTS2["w"] = OPT_WIDTH + "=px";
OPTIONS_SHORCUTS2["h"] = OPT_HEIGHT + "=px";

//if found, add =1 behind
var OPTIONS_SHORCUTS3 = [OPT_BGPARENT, OPT_EQUALOFFSET];

//prefix
var OPTIONS_SHORCUTS_PREFIX = {};
OPTIONS_SHORCUTS_PREFIX[OPT_NAME] = "*";
OPTIONS_SHORCUTS_PREFIX[OPT_TAG] = "<";
OPTIONS_SHORCUTS_PREFIX[OPT_CLASS] = ".";


var EXPORT_FOLDER = "EXPORT-ps-integrate";

var EXPORT_FOLDER_IMG = "images";
var EXPORT_FOLDER_TPL = "templates";

var DEBUG_MODE = true;
var ENABLE_EXPORT = true;


var DOC_WIDTH;
var DOC_HEIGHT;


