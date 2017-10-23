# ps-integrate

Script for image export + template generation


# dependencies

- Photoshop CS3 or higher


# todo

- Haxe template generation (en cours)
- HTML/CSS template generation
- ~~configuration dialog~~
- delete folder before generation


# todo templates

- j'ai modifié le prefix initial : ps--, type est une option comme les autres, ordre importe pas
- Button (type ou option)
	button est un container ? (pour le texte)
	oui, au moins de le scan, apres selon l'export, on choisi de l'utiliser ou pas

- layout plus poussé (margin, centrage)
- text width
- empecher la dupplication de same img (set same path+name ?)
- permettre "-" dans name (ou bien le stipuler dans la doc)


gestion text en haxe : faire une classe générique qui prend un objet de config en entrée (but : réduire le nombre de ligne de Textfield)
	- l'objet sera des variables qui seront définies dans un fichier styles_text.hx
	- (intégrer ce fichier à part dans la template)
	comme ça on a vraiment un fonctionnement aligné sur le HTML/CSS
	
