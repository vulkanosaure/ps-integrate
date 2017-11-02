# PS-integrate

This script is intended to help converting a Photoshop document into a code integration, in a highly customizable way.
It is a substitute to the **slice tool** from Photoshop, which i never found suitable for my usage.

It uses a set of layer naming rules for specifying informations suchs as image paths, names, etc...

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

A special set of rules are defined to indicates what to export, where, and how to generate the templates.

Everything is explained here :
[Documentation](docs/DOCUMENTATION.md)




## Todo


- [ ] HTML template
- [ ] Refactoring for multi-template system
- [ ] Close layers after script execution
- [x] Configuration dialog
- [x] Overwrite mode in dialog



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

- [ ] hors dev : tester la vitesse avec / sans export, voir si on fait ça ds une premiere phase, ou pdt le scan global
- [ ] check que toutes les noms de propriétés existent
- [ ] check que toutes les values sont autorisés pour chaque propriétés (trouver un format global dans constantes.jsx)
- [ ] éventuellement séparer errors et warning
- [ ] voir comment afficher un dialog pour les afficher hors debug
- [ ] only text et gfx autorisé dans btnc
- [ ] prop btnc only autorisé dans btnc

- [ ] documentation
	a noter pour haxe: 2 points a rajouter manuellement : nom police, uppercase


