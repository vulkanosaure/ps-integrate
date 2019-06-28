#include "polyfill.js";
#include "platform/global_functions.js";
#include "lib/math.js";
#include "platform/debug.js";
#include "platform/jamJSON.js";

#include "constantes.js";
#include "utils.js";
#include "platform/platform_io.js";
#include "platform/dialog.js";
#include "platform/platform_layer2.js";
#include "platform/platform_layer.js";
#include "errors_utils.js";
#include "recursive_loop.js";
#include "template_utils.js";
#include "generate_template.js";
#include "template_functions.js";

#include "export.js";


var doc = app.activeDocument;
exportFunction(doc);