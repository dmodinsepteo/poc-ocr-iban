# Structure CSS Modulaire

Ce dossier contient tous les fichiers CSS de l'application, organisés de manière modulaire pour une meilleure maintenabilité.

## Structure des fichiers

### `main.css`
Fichier principal qui importe tous les autres fichiers CSS et contient :
- Les imports de tous les fichiers CSS
- Les styles de reset et de base
- Le layout principal de l'application
- Les styles des sections générales
- Les media queries responsive

### `components.css`
Fichier contenant les composants CSS réutilisables :
- **Boutons** : `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-success`, `.btn-danger`, `.btn-info`, `.btn-lg`, `.btn-gradient`
- **Conteneurs** : `.container`, `.container-gradient`
- **Tableaux** : `.table`, `.table-orange`, `.table-blue`
- **Statuts** : `.status`, `.status-pending`, `.status-processing`, `.status-completed`, `.status-success`, `.status-error`, `.status-warning`
- **Indicateurs** : `.status-dot`, `.status-dot.valid`
- **Zones de texte** : `.text-area`, `.text-area-code`, `.text-area-ocr`
- **Sélecteurs** : `.select`

### Fichiers spécifiques aux composants

#### `processing-steps.css`
Styles spécifiques au composant `ProcessingSteps.vue` :
- `.processing-steps` : Conteneur principal
- `.steps-container` : Conteneur des étapes
- `.step` : Style d'une étape individuelle
- `.step-header` : En-tête d'une étape
- `.step-number` : Numéro de l'étape
- `.ocr-display` : Affichage du texte OCR
- `.file-display` : Affichage du fichier sélectionné
- `.save-section` : Section de sauvegarde
- `.complete-process` : Section du traitement complet

#### `auth-manager.css`
Styles spécifiques au composant `AuthManager.vue` :
- `.auth-manager` : Conteneur principal
- `.auth-status` : Section du statut d'authentification
- `.status-indicator` : Indicateur de statut
- `.auth-actions` : Actions d'authentification
- `.token-display` : Affichage du token
- `.token-header` : En-tête du token
- `.token-container` : Conteneur du token

#### `file-selector.css`
Styles spécifiques au composant `FileSelector.vue` :
- `.file-selector` : Conteneur principal
- `.file-input-container` : Conteneur de l'input de fichier
- `.file-info` : Informations sur le fichier

#### `results-display.css`
Styles spécifiques au composant `ResultsDisplay.vue` :
- `.results-display` : Conteneur principal
- `.table-container` : Conteneur du tableau
- `.value-display` : Affichage des valeurs
- `.multiple-values` : Valeurs multiples
- `.values-label` : Label des valeurs
- `.values-list` : Liste des valeurs
- `.json-container` : Conteneur JSON
- `.buttons-row` : Rangée de boutons

#### `saved-results-viewer.css`
Styles spécifiques au composant `SavedResultsViewer.vue` :
- `.saved-results-viewer` : Conteneur principal
- `.selection-section` : Section de sélection
- `.select-label` : Label du sélecteur
- `.result-display` : Affichage du résultat
- `.result-header` : En-tête du résultat
- `.result-info` : Informations du résultat
- `.no-results` : Message d'absence de résultats
- `.no-selection` : Message d'absence de sélection

## Utilisation

### Dans les composants Vue
Les composants Vue utilisent maintenant les classes CSS communes définies dans `components.css` :

```vue
<!-- Bouton primaire -->
<button class="btn btn-primary">Action</button>

<!-- Bouton avec gradient et grande taille -->
<button class="btn btn-gradient btn-lg">Action importante</button>

<!-- Tableau avec en-tête orange -->
<table class="table table-orange">
  <!-- contenu du tableau -->
</table>

<!-- Statut en cours -->
<span class="status status-processing">En cours</span>

<!-- Zone de texte pour code -->
<pre class="text-area text-area-code">{{ code }}</pre>
```

### Responsive Design
Les media queries sont définies dans `main.css` et `components.css` pour assurer une expérience cohérente sur tous les appareils.

## Avantages de cette structure

1. **Modularité** : Chaque composant a ses propres styles
2. **Réutilisabilité** : Les composants communs sont centralisés
3. **Maintenabilité** : Facile de modifier un style spécifique
4. **Performance** : Les styles sont organisés et optimisés
5. **Cohérence** : Utilisation de classes communes pour une interface uniforme

## Ajout de nouveaux styles

Pour ajouter de nouveaux styles :

1. **Styles communs** : Ajouter dans `components.css`
2. **Styles spécifiques** : Créer un nouveau fichier CSS ou ajouter dans le fichier existant du composant
3. **Import** : Ajouter l'import dans `main.css` si c'est un nouveau fichier

## Convention de nommage

- **Classes communes** : Préfixe descriptif (ex: `.btn-`, `.status-`, `.table-`)
- **Classes spécifiques** : Nom du composant en préfixe (ex: `.processing-steps`, `.auth-manager`)
- **États** : Utiliser des suffixes (ex: `.status-pending`, `.btn-disabled`)
