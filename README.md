# ps-integrate

Script for image export + template generation


# dependencies

- Photoshop CS3 or higher


# todo

- Haxe template generation (en cours)
- HTML/CSS template generation
##- ~~configuration dialog~~
- mode overwrite TODO : dialog
- refermer les calques apres ouverture


# todo templates

##- j'ai modifié le prefix initial : ps--, type est une option comme les autres, ordre importe pas
##- Button (type ou option)

## layout plus poussé (margin, centrage)
##- empecher la dupplication de same img (set same path+name ?)
##- permettre "-" dans name (ou bien le stipuler dans la doc)
- VText (en haxe)
- text width (only if multiline ?)

##gestion text en haxe : faire une classe générique qui prend un objet de config en entrée (but : réduire le nombre de ligne de Textfield)
	- l'objet sera des variables qui seront définies dans un fichier styles_text.hx
	- (intégrer ce fichier à part dans la template)
	comme ça on a vraiment un fonctionnement aligné sur le HTML/CSS
	

## generation template, 
	automatiser une fonction ou on donne le path du fichier template, l'objet converti

	
	
# todo errors handler

- hors dev : tester la vitesse avec / sans export, voir si on fait ça ds une premiere phase, ou pdt le scan global
- check que toutes les noms de propriétés existent
- check que toutes les values sont autorisés pour chaque propriétés (trouver un format global dans constantes.jsx)
- éventuellement séparer errors et warning
- voir comment afficher un dialog pour les afficher hors debug
- only text et gfx autorisé dans btnc
- prop btnc only autorisé dans btnc
	

	
# todo layout haxe

width/ height pourrons prendre une string qui finit par % ou px
	si px : idem que si number
	si % : pourcent de la scene principal (simplification, sinon c'est trop lourd)

===================================
on veut que les container root soient comme le stage
	le seul interet à les regrouper doit etre le regroupement de visibilité
	le container root est tjs 0,0, 100%,100%
	pour haxe, il sert à la navigation
	pour html, a voir, on le sautera si besoin (ça peut etre un param)



