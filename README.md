# ps-integrate

Script for image export + template generation


# dependencies

- Photoshop CS3 or higher


# todo

- Haxe template generation (en cours)
- HTML/CSS template generation
##- ~~configuration dialog~~
##- mode overwrite TODO : dialog
- refermer les calques apres ouverture


# todo templates

##- j'ai modifié le prefix initial : ps--, type est une option comme les autres, ordre importe pas
##- Button (type ou option)

## layout plus poussé (margin, centrage)
##- empecher la dupplication de same img (set same path+name ?)
##- permettre "-" dans name (ou bien le stipuler dans la doc)
## - VText (en haxe)

# - text width (only if multiline ?)
	
	
# - z-index inversé (jsais pas exactement ds quelle mesure, a la racine àa a l'air de garder l'ordre)


##gestion text en haxe : faire une classe générique qui prend un objet de config en entrée (but : réduire le nombre de ligne de Textfield)
	

## generation template, 
	automatiser une fonction ou on donne le path du fichier template, l'objet converti

## - haxe : générer tout avec 2 indents (les linebreak aussi)
	


# - correspondance entre leading PS et starling

## - text height trop petite, starling resize font vers le bas (bcp)



- export maquette memory, check loader, bug de containers ?
	
todo errors handler

- hors dev : tester la vitesse avec / sans export, voir si on fait ça ds une premiere phase, ou pdt le scan global
- check que toutes les noms de propriétés existent
- check que toutes les values sont autorisés pour chaque propriétés (trouver un format global dans constantes.jsx)
- éventuellement séparer errors et warning
- voir comment afficher un dialog pour les afficher hors debug
- only text et gfx autorisé dans btnc
- prop btnc only autorisé dans btnc

- documentation
	a noter pour haxe: 2 points a rajouter manuellement : nom police, uppercase


