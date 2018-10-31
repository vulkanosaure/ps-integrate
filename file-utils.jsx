function deleteFolder(folderItem) {

	var theFiles = folderItem.getFiles();

	for(var c = 0; c < theFiles.length; c++){

			if (theFiles[c] instanceof Folder) {

				deleteFolder(theFiles[c]);

			}
			else{
				theFiles[c].remove();
			}

	}
	
	folderItem.remove();

}