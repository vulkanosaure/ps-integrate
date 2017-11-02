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
An option used in the HTML template.

*Only available for type gfx*
TODO

#### gfxtype

*Only available for type gfx*
TODO

#### btnc
- **bg** : will be treated as a background of the parent. *There can only be one*
- **child** : will be treated as a child of the *btnc*

*Only available for children of a container of typebtnc. Default value : 'bg' for image layer, 'item' for text layer*

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

TODO


#### Notes for HaXe template
- think of renaming font accordingly
- set uppercase option if needed