//For code readability  
function cTID(s){return charIDToTypeID(s)}  
function sTID(s){return stringIDToTypeID(s)}  
// =============================  
  
  
function openAllLayerSets( parent ){  
    for(var setIndex=0;setIndex<parent.layerSets.length;setIndex++){  
        app.activeDocument.activeLayer = parent.layerSets[setIndex].layers[0];  
        openAllLayerSets( parent.layerSets[setIndex]);  
    }  
};  
  
  
  
  
function closeAllLayerSets(ref) {  
          var layers = ref.layers;  
          var len = layers.length;  
          for ( var i = 0; i < len; i ++) {  
                    var layer = layers[i];  
                    if (layer.typename == 'LayerSet') {closeGroup(layer); var layer = layers[i]; closeAllLayerSets(layer);};  
          }  
}  


function collapseLayerSet(layer){
	
	// app.activeDocument.activeLayer = layer;
	var groupname = app.activeDocument.activeLayer.name // remember name of group  
	// var groupname = layer.name // remember name of group  
	var idungroupLayersEvent = stringIDToTypeID( "ungroupLayersEvent" ); // this part from  Script Listene -- ungroup group  
	var desc14 = new ActionDescriptor();  
	var idnull = charIDToTypeID( "null" );  
	var ref13 = new ActionReference();  
	var idLyr = charIDToTypeID( "Lyr " );  
	var idOrdn = charIDToTypeID( "Ordn" );  
	var idTrgt = charIDToTypeID( "Trgt" );  
	ref13.putEnumerated( idLyr, idOrdn, idTrgt );  
	desc14.putReference( idnull, ref13 );  
	executeAction( idungroupLayersEvent, desc14, DialogModes.NO );  
	var idMk = charIDToTypeID( "Mk  " ); // this part from  Script Listene --  group selected layers  
	var desc15 = new ActionDescriptor();  
	var idnull = charIDToTypeID( "null" );  
	var ref14 = new ActionReference();  
	var idlayerSection = stringIDToTypeID( "layerSection" );  
	ref14.putClass( idlayerSection );  
	desc15.putReference( idnull, ref14 );  
	var idFrom = charIDToTypeID( "From" );  
	var ref15 = new ActionReference();  
	var idLyr = charIDToTypeID( "Lyr " );  
	var idOrdn = charIDToTypeID( "Ordn" );  
	var idTrgt = charIDToTypeID( "Trgt" );  
	ref15.putEnumerated( idLyr, idOrdn, idTrgt );  
	desc15.putReference( idFrom, ref15 );  
	executeAction( idMk, desc15, DialogModes.NO );  
	// app.activeDocument.activeLayer.name = groupname // recall group name  
	// layer.name = groupname // recall group name  
}
  
  
function openGroup(layerSet) {  
   var m_activeLayer = activeDocument.activeLayer;  
  
   var m_Layer_Dummy01 = layerSet.artLayers.add();  
   var m_Layer_Dummy02 = layerSet.artLayers.add();  
   layerSet.layers[1].name = layerSet.layers[1].name;  
   m_Layer_Dummy01.remove();  
   m_Layer_Dummy02.remove();  
  
   activeDocument.activeLayer = m_activeLayer;  
}  
  
  
function closeGroup(layerSet) {  
   var m_Name = layerSet.name;  
   var m_Opacity = layerSet.opacity;  
   var m_BlendMode = layerSet.blendMode;  
   var m_LinkedLayers = layerSet.linkedLayers;  
  
   var m_bHasMask = hasLayerMask();  
   if(m_bHasMask) loadSelectionOfMask();  
  
  
   if(layerSet.layers.length <= 1) {  
      addLayer();  
      var m_Tmp = activeDocument.activeLayer;  
      m_Tmp.name = "dummy - feel free to remove me";  
      activeDocument.activeLayer = layerSet;  
      ungroup();  
      addToSelection("dummy - feel free to remove me");  
      groupSelected(m_Name);  
  
   } else {  
      activeDocument.activeLayer = layerSet;  
      ungroup();  
      groupSelected(m_Name);  
   }  
  
  
   var m_Closed = activeDocument.activeLayer;  
   m_Closed.opacity = m_Opacity;  
   m_Closed.blendMode = m_BlendMode;  
  
   for(x in m_LinkedLayers) {  
      if(m_LinkedLayers[x].typename == "LayerSet")  
         activeDocument.activeLayer.link(m_LinkedLayers[x]);  
   }  
  
   if(m_bHasMask) maskFromSelection();  
  
   return m_Closed;  
}  
  
  
function ungroup() {  
   var m_Dsc01 = new ActionDescriptor();  
   var m_Ref01 = new ActionReference();  
   m_Ref01.putEnumerated( cTID( "Lyr " ), cTID( "Ordn" ), cTID( "Trgt" ) );  
   m_Dsc01.putReference( cTID( "null" ), m_Ref01 );  
  
   try {  
      executeAction( sTID( "ungroupLayersEvent" ), m_Dsc01, DialogModes.NO );  
   } catch(e) {}  
}  
  
  
function addLayer() {  
   var m_ActiveLayer          =    activeDocument.activeLayer;  
   var m_NewLayer             =    activeDocument.artLayers.add();  
   m_NewLayer.move(m_ActiveLayer, ElementPlacement.PLACEBEFORE);  
  
   return m_NewLayer;  
}  
  
  
function hasLayerMask() {  
   var m_Ref01 = new ActionReference();  
   m_Ref01.putEnumerated( sTID( "layer" ), cTID( "Ordn" ), cTID( "Trgt" ));  
   var m_Dsc01= executeActionGet( m_Ref01 );  
   return m_Dsc01.hasKey(cTID('Usrs'));  
}  
  
  
function activateLayerMask() {  
   var m_Dsc01 = new ActionDescriptor();  
   var m_Ref01 = new ActionReference();  
   m_Ref01.putEnumerated( cTID( "Chnl" ), cTID( "Chnl" ), cTID( "Msk " ) );  
   m_Dsc01.putReference( cTID( "null" ), m_Ref01 );  
  
   try {  
      executeAction( cTID( "slct" ), m_Dsc01, DialogModes.NO );  
   } catch(e) {  
      var m_TmpAlpha = new TemporaryAlpha();  
  
      maskFromSelection();  
      activateLayerMask();  
  
      m_TmpAlpha.consume();  
   }  
}  
  
  
function deleteMask(makeSelection) {  
   if(makeSelection) {  
      loadSelectionOfMask();  
   }  
  
   var m_Dsc01 = new ActionDescriptor();  
   var m_Ref01 = new ActionReference();  
   m_Ref01.putEnumerated( cTID( "Chnl" ), cTID( "Ordn" ), cTID( "Trgt" ) );  
   m_Dsc01.putReference( cTID( "null" ), m_Ref01 );  
  
   try {  
      executeAction( cTID( "Dlt " ), m_Dsc01, DialogModes.NO );  
   } catch(e) {}  
}  
  
  
function selectLayerMask() {  
   var m_Dsc01 = new ActionDescriptor();  
   var m_Ref01 = new ActionReference();  
  
  
   m_Ref01.putEnumerated(cTID("Chnl"), cTID("Chnl"), cTID("Msk "));  
   m_Dsc01.putReference(cTID("null"), m_Ref01);  
   m_Dsc01.putBoolean(cTID("MkVs"), false );  
  
  
   try {  
      executeAction(cTID("slct"), m_Dsc01, DialogModes.NO );  
   } catch(e) {}  
}  
  
  
function loadSelectionOfMask() {  
   selectLayerMask();  
  
   var m_Dsc01 = new ActionDescriptor();  
   var m_Ref01 = new ActionReference();  
   m_Ref01.putProperty( cTID( "Chnl" ), cTID( "fsel" ) );  
   m_Dsc01.putReference( cTID( "null" ), m_Ref01 );  
   var m_Ref02 = new ActionReference();  
   m_Ref02.putEnumerated( cTID( "Chnl" ), cTID( "Ordn" ), cTID( "Trgt" ) );  
   m_Dsc01.putReference( cTID( "T   " ), m_Ref02 );  
  
   try {  
      executeAction( cTID( "setd" ), m_Dsc01, DialogModes.NO );  
   } catch(e) {}  
}  
  
  
function maskFromSelection() {  
   if(!hasLayerMask()) {  
      var m_Dsc01 = new ActionDescriptor();  
      m_Dsc01.putClass( cTID( "Nw  " ), cTID( "Chnl" ) );  
      var m_Ref01 = new ActionReference();  
      m_Ref01.putEnumerated( cTID( "Chnl" ), cTID( "Chnl" ), cTID( "Msk " ) );  
      m_Dsc01.putReference( cTID( "At  " ), m_Ref01 );  
      m_Dsc01.putEnumerated( cTID( "Usng" ), cTID( "UsrM" ), cTID( "RvlS" ) );  
  
      try {  
         executeAction( cTID( "Mk  " ), m_Dsc01, DialogModes.NO );  
      } catch(e) {  
         activeDocument.selection.selectAll();  
         maskFromSelection();  
      }  
   } else {  
      if(confirm("Delete existing mask?", true, "Warning")) {  
         activateLayerMask();  
         deleteMask();  
      }  
   }  
}  
  
  
function groupSelected(name) {  
   var m_Dsc01 = new ActionDescriptor();  
   var m_Ref01 = new ActionReference();  
   m_Ref01.putClass( sTID( "layerSection" ) );  
   m_Dsc01.putReference(  cTID( "null" ), m_Ref01 );  
   var m_Ref02 = new ActionReference();  
   m_Ref02.putEnumerated( cTID( "Lyr " ), cTID( "Ordn" ), cTID( "Trgt" ) );  
   m_Dsc01.putReference( cTID( "From" ), m_Ref02 );  
   var m_Dsc02 = new ActionDescriptor();  
   m_Dsc02.putString( cTID( "Nm  " ), name);  
   m_Dsc01.putObject( cTID( "Usng" ), sTID( "layerSection" ), m_Dsc02 );  
   executeAction( cTID( "Mk  " ), m_Dsc01, DialogModes.NO );  
  
   return activeDocument.activeLayer;  
}  
  
  
function addToSelection(layerName) {  
   var m_Dsc01 = new ActionDescriptor();  
   var m_Ref01 = new ActionReference();  
   m_Ref01.putName( cTID( "Lyr " ), layerName );  
   m_Dsc01.putReference( cTID( "null" ), m_Ref01 );  
   m_Dsc01.putEnumerated( sTID( "selectionModifier" ), sTID( "selectionModifierType" ), sTID( "addToSelection" ) );  
   m_Dsc01.putBoolean( cTID( "MkVs" ), false );  
  
   try {  
      executeAction( cTID( "slct" ), m_Dsc01, DialogModes.NO );  
   } catch(e) {}  
}  
  
  
function TemporaryAlpha() {  
   activeDocument.selection.store((this.alpha = activeDocument.channels.add()));  
   activeDocument.selection.deselect();  
  
   this.consume = function() {  
      activeDocument.selection.load(this.alpha);  
      this.alpha.remove();  
   }  
}  





function undoHistory()
{
	executeAction( charIDToTypeID('undo'), undefined, DialogModes.NO );  
}



function getBounds(layer, type)
{
	var lastActive = activeDocument.activeLayer;
	var mustMerge = (type == TYPE_GFX && layer.typename == "LayerSet");
	
	var targetLayer = layer;
	if(mustMerge){
		var mfnewdLayer = layer.duplicate();
		targetLayer = mfnewdLayer.merge();
	}
		
	var bounds = targetLayer.bounds;
	
	
	if(mustMerge) targetLayer.remove();
	
	// activeDocument.activeLayer = lastActive;
	
	return bounds;

}


 /* 
function getBounds(layer, type) 
{
		var mfDoc = activeDocument;
    var mflayer = activeDocument.activeLayer; // currently active layer
    var mfnewdLayer = mfDoc.activeLayer.duplicate(); // Dublicates active layer or group (creating a temp layer)
    mfDoc.activeLayer = mfnewdLayer; // sets the temp layer as the active layer
    mfnewdLayer.merge(); // merges it, this leaves only visible layers

    var mfmlayer = activeDocument.activeLayer; //Grab the currently selected layer
    var bounds = mfmlayer.bounds;

    mfmlayer.remove(); // delete the temp layer
    mfDoc.activeLayer = mflayer; // gets back to the layer that was active at the begining
	
	return bounds;
}
   */