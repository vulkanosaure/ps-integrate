
//non-recursive action manager traversal function
function traverseLayersAMFlat(doc, ftn)
{
   function _selectLayerById(ID)   //select just this layer
   {
      var ref = new ActionReference();
      ref.putIdentifier(charIDToTypeID('Lyr '), ID);
      var desc = new ActionDescriptor();
      desc.putReference(charIDToTypeID('null'), ref);
      desc.putBoolean(charIDToTypeID('MkVs'), false);
      executeAction(charIDToTypeID('slct'), desc, DialogModes.NO);
   }//_selectLayerById

   //how many layers are there in this document?
   var ref = new ActionReference();
   ref.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
   var count = executeActionGet(ref).getInteger(charIDToTypeID('NmbL'));

   //traverse the list backwards (does parents first)
   for (var i = count; i >= 1; i--)
   {
      ref = new ActionReference();
      ref.putIndex(charIDToTypeID('Lyr '), i);
			var desc = executeActionGet(ref);   //access layer index #i
			var visible = desc.getBoolean(charIDToTypeID('Vsbl'));
			if(!visible) continue;
      var layerID = desc.getInteger(stringIDToTypeID('layerID'));   //ID for selecting by ID #
      var layerSection = typeIDToStringID(desc.getEnumerationValue(stringIDToTypeID('layerSection')));
      if (layerSection != 'layerSectionEnd')
      {   //do this layer
         _selectLayerById(layerID);
         ftn(doc, app.activeDocument.activeLayer);    //apply function to this layer
      }      
   }//for i-- countdown

   try   
   {   //if there is a magic background layer, process it, too
      app.activeDocument.activeLayer = app.activeDocument.backgroundLayer;
      ftn(doc, app.activeDocument.backgroundLayer); 
   } catch (e) {;}

}//traverseLayersAMFlat