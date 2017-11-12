# Documentation

## Layers naming

By default, PS-integrate will ignore all layers unless you prefix it with:

````
ps--
````

You can then set options, split by the ````--```` separator.

````
ps--optionA=A--optionB=B...
````




## Options list

#### type
The most important type, you should always set it first. 

*See section below for details*

#### path
The folder in which the layer will be exported.

*If inside a container, this path is relative to the container's path. Default : empty*

#### filename
The name of the file to be exported, don't include the file extension

*__note__ : only png export is handled at the moment*

*If not specified, and ID will be automatically generated.*

#### name
The name of the element, used template generation.

*If not specified, and ID will be automatically generated.*

#### bgparent
- **1**
- **0**
Defines a graphic element to be passed to the parent. 
This is mandatory for 1 child of an element of type 'btnc'
*Only available for type gfx*

#### gfxtype

*Only available for type gfx*
TODO

#### layoutx
- **left** (default) : the template system will position the element in pixel from the left
- **right** : the template system will position the element in pixel from the right
- **center** : the template system will position the element in % value

#### layouty
- **top** (default) : the template system will position the element in pixel from the top
- **bottom** : the template system will position the element in pixel from the bottom
- **center** : the template system will position the element in % value

TODO : x, y, width, height
servait à forcer la position / dimension d'un container. width/height possible à 100% only


## Element types

A layer is considered as an **element**.
The type can be set with the ````--type```` option. 

Photoshop has a classification of **3 kinds** of layers :

- NORMAL
- LAYERSET
- TEXT

If the element is nested in a container, depending of the kind of layer (NORMAL, LAYERSET, TEXT), the type will sometime be set by default

There are 5 types of element


#### Graphic (gfx)
Will be exported directly.

*If nested in a container, a layer of kind NORMAL will be considered as a graphic automatically*

#### Text (txt)
Will not be exported.
Informations of font, size, color, leading, align will be collected for the template system.

*If nested in a container, a layer of kind TEXT will be considered as a text automatically*

#### Container (cont)
A container is a group of other element, and will not be exported directly. It will be used by the template system to manage  integration.

#### Button (btn)
A button is considered as a graphic, but will be treated accordingly by the template system.

#### Button container (btnc)
Simillar to a button, but it can contain children of element of type 'text' and 'gfx' only. 
*See option 'btnc' for details*




## Templates

A template must have a directory in the ````template```` folder, named by the id of the template.

The folder must have a ````config.json```` file.
3 subfolders :
- main
- layout
- textformat


## Template functions

In the file ````template-functions.jsx````, a new entry must be created in the object ````TPL_FUNCTIONS```` with 2 functions

#### getTextFormatData
A function that must return the string that will be displayed in ````textformat_data````

#### getLayoutData
A function that must return the string that will be displayed in ````layout_data````






#### Template variable

- varname
- parent_varname
- text
- txt_style_id
- filename
- width / height
- name
- path
- type
- x / y
- textformat
- textformat_id
- layout
- layout_id


#### Textformat variable

- textformat_id
- textformat_data

#### Layout variable

- layout_id
- layout_data


#### Config file

TODO



TODO :
	- fichier de config.json
	- expliquer les templates
	
	
	

#### Notes for HaXe
- think of renaming font accordingly
- set uppercase option if needed


## Photoshop tricks

#### Performances

To improove performances, disable layer thumbnail in the layer option pannel.

**Some other tricks i read but that depends on your system / configuration, so no garanty**
- Execute photoshop as an administrator
- In preferences / performances : disable "use GPU processor"



#### Useful shortcuts

- Ctrl + G 			:	group layers (or layersets)
- Ctrl + Shift + G	: 	ungroup
- Ctrl + E			: 	merge selected layers
- Ctrl + Shift + E	: 	merge visible layers ? (to test)
- Delete 			: 	delete layers
- Tab / Shift+tab (when editing layer name) : edit next / prev
- Ctrl+, Ctrl+;		: 	move up / down layer

- Ctrl+[]			: 	select layer below / above (qwerty)
- Alt + :!			:	select layer below / above (azerty)
- Alt + Shift + :!	:	add layer below / above to selection (azerty)

**some changes i added in edit / keyboard shorcut**

- F2				:	rename layer
- Ctrl+H			: 	layer / hide
- Shift+F2			: 	hide other layers (new action)

