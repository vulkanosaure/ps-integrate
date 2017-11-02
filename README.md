# PS-integrate

Script for exporting layers from Photoshop + template generation


## Dependencies

- Photoshop CS3 or higher


## Documentation

A special set of rules are defined to indicates what to export, where, and how to generate the templates.

Everything is explained here :
[Documentation](docs/DOCUMENTATION.md)




## Todo

- [x] configuration dialog
- [x] mode overwrite TODO : dialog
- [ ] refermer les calques apres ouverture



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


