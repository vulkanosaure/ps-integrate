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


- [x] html : ordre layers inversé ?
- [ ] prefix image paramétrable (fenetre param start)
- [ ] equaloffset => ajouter un type MC (haxe, html le traite comme un container) (a voir si on lie les 2 propriétés)
- [ ] Warning d'erreur : ajouter btn close (critique sur CC 2017)
- [ ] Handle JPG export (option format and quality)
- [ ] container => prefixchildren
	numerote les children a partir de 0 préfixée

- [x] Configuration dialog
- [x] Overwrite mode in dialog

- [x] shortcut :
	- if only propname => =1
	- for some property with predefined value, activate shorcut => only value (type)
		center, centerx, centery, top, left, bottom, right
	- define special keyword with k => v associated
	


- [x] refactoring template-functions
- [x] close tags (separate file, suffix -close)
- [x] nblinebreak
- [x] dialog, get directory ddlist tpl
- [x] json config
- [x] html
- [x] doc
- [x] generer errors dans un errors.log






## HTML

- absolute VS flux
- [x] background-image
		avec btnc, on fait deja plus ou moins ça
		fusionner la logique
- [x] si je met un container en absolute, jdois aussi mettre sa dimensions a 100% / 100% / pas genant
- [x] chopper la police
- [x] letter spacing / ne pas le spécifier si ds une certaine marge



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
- [x] only text et img autorisé dans btnc
- [x] prop btnc only autorisé dans btnc
- [ ] only one btnc = bg
- [x] afficher un dialog pour les afficher hors debug



_______________________________________
- association text color, font insensitive								OK
- rename ps-integrate-export en export-ps-integrate						OK
- !export																OK
- renommer "gfx" en "img"												OK
- #element shorcut of name=element										OK
- file prefix css, insérer son contenu avant chaque css					OK
- rootClass																OK
- delete img before scanning											OK
- ne pas le faire parcourir les calques non nommés ps-- 				OK

=> algo chercher l'offset min sur tous les enfants, l'ajouter au		OK
	ex : cobra zero / chapter start / zone title
	ex : cobra zero / modal_history / btn up/down/close
	=> pas la peine, ct un problem de bounds sur layerset
	
if 0, ne pas mettre left / top => enlever ce truc						OK
ordre des width / height, top, right... bizarre ?						OK
	
layoutx / layouty, moyen pour préciser ce qu'on veut 					OK
	is absolute ?
		left / right, top / bottom ?
	else
		is horizontal or vertical ?
	default : !absolute / vertical
	
	
position relative :														OK
	prevItem, doit etre un static (prevStaticItem)

ajouter un display:flex, si row											OK
	
margin left/top, sur une mm ligne ?										OK
	
	
	
ne pas tout grouper ds un container
	a l'interieur d'un calque, on est au root du html
	on peut set des aditionnal classes (container_center)
	ptet juste coté génération template, incrémenter de 1 avant de lancer la boucle rec
		ou config.json ?
	
	l'ennuie, c'est que, ds les cas ou j'ai tout ds un mm groupe
	c'est pratique de pas avoir à créer un layer supplementaire, BALLEK

multiline : 
	if set : uncomment width, (mais la met qd mm au cas ou)				très peu utile
	
- ex sur : ps--img--#btn1, il ouvre le calque (et le laisse ouvert)
	soit tout refermer
	soit refermer les non recursifs

- bug de letterspacing (cobra zero / credits / title)

- size font mauvaise pour classname font
	21 => 80, 16 => 60, 37 => 140
	
ERRORS :
	- direction only for type container									OK
	multiline, only for text
	
évaluation des margins d'un text en fonction de sa taille
	textPaddingX = fontSize / 20
	textPaddingY = fontSize / 5
	RETRANCHER
	le faire au moment de la generation template
		(absolute et static)

centrage																OK
	centrer enfants d'un container : align-items:center/start/end
	centrer un item indivisuel :
		si position static :
			margin: x auto 0 auto;
			voir si marche pour direction row
		si position absolute :
			left : 100%, translate
		
	align-items : center, start, end
	layoutx: center
	layouty: center
	shortcut : centerx, centery
	
	
if multiple name similar : 
	not repeat them in css ?
	not sure it's a good idea...


_______________________________________
procédures à ne pas oublier

- réordonner les calques
- si effect : grouper et faire un img du groupe (sur ?)
- si fx sur quelque : rasterize calque (sur ?)
- PSD 50mo max (nettoyer, merger, puis diviser si nécéssaire)

