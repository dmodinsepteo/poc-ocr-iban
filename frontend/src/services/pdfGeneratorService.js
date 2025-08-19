import { jsPDF } from 'jspdf'

class PDFGeneratorService {
  constructor() {
    this.doc = null
    this.pageWidth = 0
    this.pageHeight = 0
    this.margin = 20
    this.currentY = 0
  }

  // Initialiser le document PDF
  initDocument() {
    this.doc = new jsPDF('p', 'mm', 'a4')
    this.pageWidth = this.doc.internal.pageSize.getWidth()
    this.pageHeight = this.doc.internal.pageSize.getHeight()
    this.currentY = this.margin
  }

  // Ajouter un titre
  addTitle(text, fontSize = 18, color = '#000000') {
    this.doc.setFontSize(fontSize)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setTextColor(color)
    this.doc.text(text, this.pageWidth / 2, this.currentY, { align: 'center' })

    this.currentY += fontSize / 2 + 10
  }

  // Ajouter un sous-titre
  addSubtitle(text, fontSize = 14, color = '#000000') {
    this.doc.setFontSize(fontSize)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setTextColor(color)
    this.doc.text(text, this.margin, this.currentY)
    this.currentY += fontSize / 2 + 5
  }

  // Ajouter du texte normal
  addText(text, fontSize = 10, color = '#000000') {
    this.doc.setFontSize(fontSize)
    this.doc.setFont('helvetica', 'normal')
    this.doc.setTextColor(color)
    
    // Gérer le retour à la ligne automatique
    const maxWidth = this.pageWidth - 2 * this.margin
    const lines = this.doc.splitTextToSize(text, maxWidth)
    
    for (const line of lines) {
      if (this.currentY > this.pageHeight - this.margin) {
        this.doc.addPage()
        this.currentY = this.margin
      }
      this.doc.text(line, this.margin, this.currentY)
      this.currentY += fontSize / 2 + 2
    }
  }

  // Ajouter des statistiques
  addStats(stats) {
    this.addSubtitle('Statistiques de validation')
    
    const statsText = [
      `Total des champs: ${stats.total}`,
      `Champs valides: ${stats.valid} (${((stats.valid / stats.total) * 100).toFixed(0)}%)`,
      `Champs invalides: ${stats.invalid} (${((stats.invalid / stats.total) * 100).toFixed(0)}%)`,
      `Champs non validés: ${stats.unvalidated} (${((stats.unvalidated / stats.total) * 100).toFixed(0)}%)`
    ]
    
    for (const stat of statsText) {
      this.addText(stat)
    }
    this.currentY += 10
  }

  // Ajouter un tableau de résultats
  addResultsTable(metadata) {
    this.addSubtitle('Résultats d\'extraction')
    this.addSimpleTable(metadata)
  }

  // Tableau simple en fallback
  addSimpleTable(metadata) {
    const headers = ['Nom du champ','Valeur', 'Validation']
    const startX = this.margin
    const startY = this.currentY
    const colWidths = [50, 70, 40]
    const rowHeight = 10
    const fontSize = 9

    this.doc.setFontSize(fontSize)
    this.doc.setFont('helvetica', 'bold')

    // Dessiner le fond des en-têtes
    this.doc.setFillColor(46, 56, 98)
    this.doc.rect(startX, startY - 5, this.pageWidth - 2 * this.margin, rowHeight, 'F')

    // En-têtes en blanc
    this.doc.setTextColor(255, 255, 255)
    let currentX = startX + 2
    headers.forEach((header, index) => {
      this.doc.text(header, currentX, startY)
      currentX += colWidths[index]
    })

    this.currentY = startY + rowHeight
    this.doc.setTextColor(0, 0, 0)

    // Données
    this.doc.setFont('helvetica', 'normal')
    metadata.forEach((field, rowIndex) => {
      if (this.currentY > this.pageHeight - this.margin - rowHeight) {
        this.doc.addPage()
        this.currentY = this.margin
      }

      // Fond alterné pour les lignes
      if (rowIndex % 2 === 1) {
        this.doc.setFillColor(248, 249, 250)
        this.doc.rect(startX, this.currentY - 5, this.pageWidth - 2 * this.margin, rowHeight, 'F')
      }

      const rowData = [
        field.fieldName,
        this.getDisplayValue(field),
        this.getValidationStatus(field),
      ]

      currentX = startX + 2
      rowData.forEach((cell, colIndex) => {
        // Tronquer le texte si nécessaire
        const maxWidth = colWidths[colIndex] - 4
        const lines = this.doc.splitTextToSize(cell, maxWidth)
        
        lines.forEach((line, lineIndex) => {
          if (lineIndex === 0) {
            this.doc.text(line, currentX, this.currentY)
          } else if (this.currentY < this.pageHeight - this.margin - 5) {
            this.doc.text(line, currentX, this.currentY + (lineIndex * 3))
          }
        })
        
        currentX += colWidths[colIndex]
      })

      this.currentY += rowHeight + 2
    })

    this.currentY += 15
  }

  // Obtenir la valeur d'affichage pour un champ
  getDisplayValue(field) {
    if (field.fieldValues && Array.isArray(field.fieldValues) && field.fieldValues.length > 0) {
      return field.fieldValues.join(', ')
    }
    return field.fieldValue || '-'
  }

  // Obtenir le statut de validation
  getValidationStatus(field) {
    if (!field.validation) return 'Non validé'
    
    if (field.validation.isValid === null) return 'Non validé'
    if (field.validation.isValid === true) return 'Valide'
    if (field.validation.isValid === false) {
      return field.validation.expectedValue 
        ? `Invalide \r\n(${field.validation.expectedValue})`
        : 'Invalide'
    }
    
    return 'Non validé'
  }

  // Ajouter le texte OCR
  addOCRText(ocrText) {
    if (!ocrText) return
    
    this.addPageBreak()
    this.addSubtitle('Résultat OCR')
    
    // Limiter la longueur du texte OCR pour éviter les pages trop longues
    const maxLength = 2000
    const displayText = ocrText
    
    this.addText(displayText, 8)
    this.currentY += 10
  }

  // Ajouter le JSON d'extraction
  addExtractionJSON(data) {
    this.addPageBreak()
    this.addSubtitle('Données d\'extraction (JSON)')
    
    try {
      const jsonString = JSON.stringify(data, null, 2)
            
      this.addText(jsonString, 8)
    } catch (error) {
      this.addText('Erreur lors de la sérialisation JSON', 8)
    }
    
    this.currentY += 10
  }

  // Ajouter une page de séparation
  addPageBreak() {
    this.doc.addPage()
    this.currentY = this.margin
  }

  // Générer le PDF complet
  async generateTestReport(results, metadataMap, statsMap) {
    this.initDocument()
    
    // Titre principal
    this.addTitle('Rapport de Test - Extraction de Coordonnées Bancaires')
    this.addText(`Généré le ${new Date().toLocaleString('fr-FR')}`)
    this.currentY += 20

         // Résumé global
     this.addSubtitle('Résumé global')
     this.addText(`Nombre total de RIB traités: ${results.length}`)
     
     // Calculer les statistiques globales
     let totalFields = 0
     let totalValid = 0
     let totalInvalid = 0
     let totalUnvalidated = 0
     
     for (const stats of statsMap.values()) {
       if (stats) {
         totalFields += stats.total
         totalValid += stats.valid
         totalInvalid += stats.invalid
         totalUnvalidated += stats.unvalidated
       }
     }
     
     this.addText(`Total des champs extraits: ${totalFields}`)
     this.addText(`Champs validés: ${totalValid} (${((totalValid / totalFields) * 100).toFixed(0)}%)`, 10, 'green')
     this.addText(`Champs invalides: ${totalInvalid} (${((totalInvalid / totalFields) * 100).toFixed(0)}%)`, 10, 'red')
     this.addText(`Champs non validés: ${totalUnvalidated} (${((totalUnvalidated / totalFields) * 100).toFixed(0)}%)`, 10, 'orange')
     this.currentY += 10
     
     // Table des matières
     this.addSubtitle('Table des matières')
     results.forEach((result, index) => {
       const stats = statsMap.get(result.id)
       this.addText(`${index + 1}. ${result.fileName}`)
     })
     this.addPageBreak()

    // Pour chaque résultat
    for (let i = 0; i < results.length; i++) {
      const result = results[i]
      const metadata = metadataMap.get(result.id) || []
      const stats = statsMap.get(result.id)

      // Titre du résultat
      this.addTitle(`${i + 1}. ${result.fileName}`, 16)
      this.addText(`Taille: ${this.formatFileSize(result.fileSize)}`)
      this.currentY += 10

      // Statistiques
      if (stats) {
        this.addStats(stats)
      }

      // Tableau des résultats
      if (metadata.length > 0) {
        this.addResultsTable(metadata)
      }

      // Texte OCR
      if (result.ocrText) {
        this.addOCRText(result.ocrText)
      }

      // JSON d'extraction
      if (result.data) {
        this.addExtractionJSON(result.data)
      }

      // Page de séparation (sauf pour le dernier)
      if (i < results.length - 1) {
        this.addPageBreak()
      }
    }

    return this.doc
  }

  // Formater la taille de fichier
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Télécharger le PDF
  downloadPDF(filename = 'rapport-test-rib.pdf') {
    this.doc.save(filename)
  }
}

export default new PDFGeneratorService()
