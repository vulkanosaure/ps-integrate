//______________________________________________
//green-test



var green_test:VImage = new VImage("extern/green-test");
container.addChild(green_test);
green_test.idLayout = "green_test";
LayoutManager.addItem(green_test, {"margin-left" : 91, "margin-top" : 223});







//______________________________________________
//cont-10



var cont_10:LayoutSprite = new LayoutSprite();
container.addChild(cont_10);
cont_10.idLayout = "cont_10";
LayoutManager.addItem(cont_10, {"margin-left" : 392, "margin-top" : 124});


var gfx_12:VImage = new VImage("group/img-12");
cont_10.addChild(gfx_12);
gfx_12.idLayout = "gfx_12";
LayoutManager.addItem(gfx_12, {"margin-left" : 426});


var blue_test:VImage = new VImage("group/blue-test");
cont_10.addChild(blue_test);
blue_test.idLayout = "blue_test";
LayoutManager.addItem(blue_test, {"margin-top" : 291});


var txt_7:VText = new VText(StylesText.Aller_Bold_188485_24);
cont_10.addChild(txt_7);
txt_7.idLayout = "txt_7";
LayoutManager.addItem(txt_7, {"margin-left" : 136, "margin-top" : 158});








