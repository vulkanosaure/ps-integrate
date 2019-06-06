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
*You can set a path starting with '/' to make it absolute from the root images path

#### filename
The name of the file to be exported, don't include the file extension

*__note__ : only png export is handled at the moment*

*If not specified, an ID will be automatically generated.*

#### name
The name of the element, used template generation.

*If not specified, an ID will be automatically generated.*

#### bgparent
- **1**
- **0**
Defines a graphic element to be passed to the parent. 
*Only available for type img*

#### imgtype

*Only available for type Adobe XD*
- **png**
- **svg**
*TODO : add JPEG*

#### position
- **static** (default)
- **abs**

#### dir
- **col** (default)
- **row**
Defines the flow directions of the container (only for type container)

#### alignitems
(deprecated)
- **start**
- **center**
- **end**
Similar to the *align-items* property for a flex container

#### layoutx
- **left** (default) : the template system will position the element in pixel from the left
- **right** : the template system will position the element in pixel from the right
- **center** : the item will be centered (PSD position will be ignored), depending on the position, for absolute : % and translate will be used, for static : margin auto
*When setting this option, position is automaticaly set to abs*

#### layouty
- **top** (default) : the template system will position the element in pixel from the top
- **bottom** : the template system will position the element in pixel from the bottom
- **center** : the item will be centered (PSD position will be ignored), depending on the position, for absolute : % and translate will be used, for static : margin auto
*When setting this option, position is automaticaly set to abs*

#### equaloffset
(deprecated)
- **1**
- **0**
Forces all the img childrens of the container to be exported at the size of the container (handy for game sprites)
*Only available for type container*

#### tag
override the default tag used
Possible values : "a", "button", "p", "img", "h1", "h2", "h3", "h4", "h5", "span", "div"

#### tplmodel
create a new template that can be reused on the same page, with the **tpl** attribute

#### tpl
attach the element to a template, that can be either :
- an in-memory template, create on the same document with the **tplmodel** attribute
- a template in a file of the same name, with the **.txt** extension, located in the **templates/html/main/tpl** folder of the plugin

#### ph (placeholder)
must be defined inside  a template (**tpl** or **tplmodel**)
define a dynamic element to be mapped between the template model and the copy
it can be used for **txt** or **img** type
for a file **tplmodel**, the {{placeholder}} with the same name must be present for the mapping
*if a placeholder is defined on a img elmt, the tag is automatically set to img*
*if a placeholder is defined, it's not necessary to define the other options, except the type options for img, in the case of a file template*





## Shortcuts

- **abs**
set position = absolute
- **bg**
set bgparent = 1
- **#item (or *item for XD)**
set name = item
- **special values (can be set without props)**
left, right, top, bottom, row, col, cont, img, txt
- **centerx, centery, center** 
layoutx=center, layouty=center or both
- **svg/png (XD only)** 
set type = img, imgtype = svg/png
- **>tagname** 
set tag = tagname


## Element types

A layer is considered as an **element**.
The type can be set with the ````--type```` option. 

Photoshop has a classification of **3 kinds** of layers :

- NORMAL
- LAYERSET
- TEXT


If the element is nested in a container, depending of the kind of layer (NORMAL, LAYERSET, TEXT), the type will sometime be set by default

There are 5 types of element


#### Graphic (img)
Will be exported directly.

*If nested in a container, a layer of kind NORMAL will be considered as a graphic automatically*

#### Text (txt)
Will not be exported.
Informations of font, size, color, leading, align will be collected for the template system.

*If nested in a container, a layer of kind TEXT will be considered as a text automatically*

#### Container (cont)
A container is a group of other element, and will not be exported directly. It will be used by the template system to manage  integration.











	
#### Settings

PHOTOSHOP :
- In edit / preferences : set unit and rulers as pixels.


#### Notes for HaXe
- think of renaming font accordingly
- set uppercase option if needed


## Photoshop tricks

#### Performances

To improove performances, disable layer thumbnail in the layer option pannel.

**Some other tricks i read but that depends on your system / configuration, so no garanty**
- Execute photoshop as an administrator
- In preferences / performances : disable "use GPU processor"



#### Useful keyboard shortcuts

##### PHOTOSHOP :

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

