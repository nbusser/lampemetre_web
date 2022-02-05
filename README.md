# Lampemetre web

**Projet non-maintenu.**

**Consultez le nouveau dépôt post-migration [Lampemetre.Vue](https://github.com/nbusser/lampemetre_vue).**

___

Lampemetre web est un programme permettant la visualisation des mesures acquises par [Module Lampemètre Analyseur Traceur de Courbes](https://www.radioelec.com/module-lampemetre-analyseur-traceur-de-courbes-vacuum-tube-analyzer-xml-352_387-828.html) de [RadioElec](https://www.radioelec.com).

Le programme Liberty BASIC fourni par RadioElec lors de l'achat du module souffre de nombreuses limitations.

Ce programme libre et gratuit offre de nombreuses nouvelles fonctionnalités, une meilleure ergonomie et de nombreuses corrections techniques.

## Prérequis

### Matériel

Vous aurez besoin du module lampemetre de RadioElec.
Toute la logique d'acquisition de données est effectuée par le boîtier.

### Navigateur internet

Lampemetre web s'exécute dans un navigateur internet.

Lampemetre web utilise la nouvelle API [Web Serial](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API), permettant au navigateur de communiquer avec une interface RS232.

Ces fonctionnalités ne sont supportées pour l'instant que par le navigateur [Google Chrome](https://www.google.fr/chrome/) (ou **Chromium**).

Dans le futur, ces fonctionalités seront sûrement implémentées par d'autres navigateurs.

### Serveur web (mode hors ligne uniquement)

Si vous utilisez l'application en mode hors-ligne, vous aurez besoin d'utiliser un quelquonque serveur http.

Nous conseillons d'utiliser le serveur http inclus dans [python](https://www.python.org/).

## Installation

Vous pouvez utiliser Lampemetre web en mode en ligne, ou en mode hors ligne.

### Mode en ligne

Suivez [ce lien](https://nbusser.github.io/lampemetre_web/) pour utiliser Lampemetre web.

### Mode hors ligne

1. Téléchargez l'une des [versions](https://github.com/nbusser/lampemetre_web/releases) du logiciel et extrayez le contenu de l'archive dans un dossier quelquonque.
2. Lancez ensuite le fichier `run.bat`. Ce fichier utilisera une commande python permettant de lancer un serveur http sur votre machine. L'installation préalable de python est requise.
3. Lancez Google Chrome et tapez `localhost` dans la barre de lien.

## Utilisation

### Création de tube

Dans l'interface **Tubes**, cliquez sur **+** pour ajoutezr un nouveau tube.

### Acquisition de données

Vous pouvez ensuite effectuer des captures pour ce tube en appuyant sur le bouton **+** à côté de **Captures**.

Dans la pop-up, écrivez la série de valeurs de tension grille pour laquelle vous voulez effectuer l'acquisition.
Notez que toutes les valeurs de tension grille sont implicitement négatives. Le boîtier ne permet pas l'acquisition de données pour des tensions de grille positives.

Vous pouvez écrire plusieurs valeurs séparées par des espaces.

Exemple: `1 0.5 -2` effectuera 3 captures pour des tensions grille de -1V, -0.5V et -2V.

#### Lissage

Lampemetre web implémente un algorithme de correction de bruit après acquisition des données.

Il est possible de régler la sévérité de cet algorithme en manipulant le curseur dédié.

Pour assurer la cohérence des données, nous vous obligeons a garder le même facteur de lissage pour toutes les captures d'un même tube.

Plus le facteur de lissage est élevé, moins les données seront bruitées. En contrepartie, vous perderez en nombre de données capturées.

Par exemple, avec un paramètre de lissage au minimum, les données seront hautement bruitées mais les captures s'étendront jusqu'à 280V.
En revanche, avec un paramètre de lissage au maximum, le bruit sera extrèmement réduit mais les captures ne s'étendront que jusqu'à 250V.

### Mesure

Pour effectuer une mesure:
1. Cliquez, dans la section Tubes, sur la tension grille pour laquelle vous souhaitez effectuer la mesure
2. Cliquez ensuite sur un des points des courbes

Le programme affichera alors en bas de l'écran le calcul de la résistance interne, de la transductance et du facteur d'amplification pour la tension grille selectionnée.

Vous pouvez également cliquer sur le bouton **+** dans l'onglet mesure pour effectuer une mesure pour la tension anode de votre choix.

### Sauvegarde de l'espace de travail

En utilisant le bouton Sauvegarder, vous pouvez sauvegarder votre espace de travail.

Les tubes, captures, mesures et notes personnelles seront sauvegardées dans un fichier json.

En utilisant le bouton Charger, vous pouvez alors retrouver votre environnement de travail.

### Importation/exportation Excel

Cliquez sur le bouton Exporter pour compiler les données dans un fichier excel. Le fichier sera alors téléchargé par votre navigateur.

Vous pouvez réaliser la manipulation inverse en utilisant le bouton Importer.
Les mesures ne seront pas importées.
Pensez à respecter scrupuleusement le format.

Au vu des contraintes quentraine le format de sauvegarde, nous vous recommandons de n'utiliser la fonctionnalité d'importation de fichier Excel uniquement si vous souhaitez entrer votre datasheet à la main.
Dans le cas où vous souhaitez simplement sauvegarder votre espace de travail, référez vous aux boutons Sauvegarder et Charger.

### Minuterie

Vous pouvez trouver en haut de l'écran un espace dédié à la minuterie.

Ce minuteur vous permet de vous assurer que vos lampes sont bien chaudes avant de lancer les captures.

Appuyez sur Reset pour remettre le compteur sur 60 secondes.

En cochant la case 'Bloquer les capture', vous empêcherez de réaliser des captures avant la fin de la minuterie.

## Contribution

En cas de problème, n'hésitez pas à poster une [issue](https://github.com/nbusser/lampemetre_web/issues) sur github.

N'hésitez pas non plus à soumettre des pull-requests.
Tout ajout est le bienvenu.
