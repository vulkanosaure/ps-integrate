# PS-integrate

Convert a Photoshop document into a code integration, in a highly customizable way.
It is a substitute to the **slice tool** from Photoshop, which i never found suitable for my usage.

It uses a set of layer naming rules for specifying informations such as image paths, names, etc...

A code template will be generated, the template system is higly customizable to add / modify new language templates.

The template handles :

- containers
- layout
- text 
- buttons


## Dependencies

- Photoshop CS3 or higher


## Installation

TODO


## Documentation

A special set of rules are defined to indicate what to export, where, and how to generate the templates.

Everything is explained [in the documentation](docs/DOCUMENTATION.md)




## Todo


- [ ] HTML template
- [ ] Refactoring for multi-template system
- [ ] Close layers after script execution
- [ ] Handle JPG export (option format and quality)
- [x] Configuration dialog
- [x] Overwrite mode in dialog


## Current

- [x] refactoring template-functions
- [x] close tags (separate file, suffix -close)
- [x] nblinebreak
- [x] dialog, get directory ddlist tpl
- [ ] json config
- [ ] html
- [ ] background-image
- [ ] doc
- [x] generer errors dans un errors.log



### todo templates

- [x] j'ai modifié le prefix initial : ps--, type est une option comme les autres, ordre importe pas
- [x] Button (type ou option)
- [x] layout plus poussé (margin, centrage)
- [x] empecher la dupplication de same img (set same path+name ?)
- [x] permettre "-" dans name (ou bien le stipuler dans la doc)
- [x] VText (en haxe)
- [x] text width (only if multiline ?)
- [x] z-index inversé (jsais pas exactement ds quelle mesure, a la racine a l'air de garder l'ordre)
- [x] gestion text en haxe : faire une classe générique qui prend un objet de config en entrée (but : réduire le nombre de ligne de Textfield)
- [x] generation template, 
- [x] haxe : générer tout avec 2 indents (les linebreak aussi)
- [x] correspondance entre leading PS et starling
- [x] text height trop petite, starling resize font vers le bas (bcp)
- [x] export maquette memory, check loader, bug de containers ?


	
### todo errors handler

- [x] check que toutes les noms de propriétés existent
- [x] check que toutes les values sont autorisés pour chaque propriétés (trouver un format global dans constantes.jsx)
- [x] only text et gfx autorisé dans btnc
- [x] prop btnc only autorisé dans btnc
- [ ] only one btnc = bg
- [ ] don't include .extension in path
- [ ] afficher un dialog pour les afficher hors debug


