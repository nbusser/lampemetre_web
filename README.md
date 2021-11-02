# Lampemetre web

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

Nous conseillons d'utiliser [python](https://www.python.org/).

## Installation

Vous pouvez utiliser Lampemetre web en mode en ligne, ou en mode hors ligne.

### Mode en ligne

Suivez [ce lien](https://nbusser.github.io/lampemetre_web/) pour utiliser Lampemetre web.

### Mode hors ligne

1. Téléchargez l'une des [versions](https://github.com/nbusser/lampemetre_web/releases) du logiciel et extrayez le contenu de l'archive dans un dossier quelquonque.
2. Lancez ensuite le fichier `run.bat`. Ce fichier utilisera une commande python permettant de lancer un serveur http sur votre machine.
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

Lampemetre web implémente un algorithme de correction de bruit après l'acquisition.

Il est possible de régler la sévérité de cet algorithme en manipulant le curseur dédié.

Pour la cohérence des données, nous vous obligeons a garder le même facteur de lissage pour toutes les captures d'un même tube.

Plus le facteur de lissage est élevé, moins les données seront bruitées. En contrepartie, vous perderez en nombre de données capturées.

Par exemple, avec un paramètre de lissage au minimum, les données seront hautement bruitées mais les captures s'étendront jusqu'à 280V.
En revanche, avec un paramètre de lissage au maximum, le bruit sera extrèmement réduit mais les captures ne s'étendront que jusqu'à 250V.

### Mesure

Pour effectuer une mesure:
1. Cliquez, dans la section Tubes, sur la tension grille pour laquelle vous souhaitez effectuer la mesure
2. Cliquez ensuite sur un des points des courbes

Le programme affichera alors en bas de l'écran le calcul de la résistance interne, de la transductance et du facteur d'amplification pour la tension grille selectionnée.

### Exportation

Cliquez sur le bouton Exporter pour compiler les données dans un fichier excel. Le fichier sera alors téléchargé par votre navigateur.

## Contribution

En cas de problème, n'hésitez pas à poster une [issue](https://github.com/nbusser/lampemetre_web/issues) sur github.

N'hésitez pas non plus à soumettre des pull-requests.
Tout ajout est le bienvenu.
