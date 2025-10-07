/**
 * Service pour les transformations d'image utilisées dans les tests OCR
 */
class ImageTransformationService {
  constructor() {
    this.canvas = null
    this.ctx = null
  }

  /**
   * Initialise le canvas pour les transformations
   */
  initCanvas() {
    if (!this.canvas) {
      this.canvas = document.createElement('canvas')
      this.ctx = this.canvas.getContext('2d')
    }
  }

  /**
   * Charge une image depuis un fichier PDF (convertit PDF en image)
   */
  loadImageFromFile(file) {
    return new Promise((resolve, reject) => {
      if (file.type === 'application/pdf') {
        // Pour les PDF, on utilise PDF.js pour convertir en image
        this.convertPDFToImage(file)
          .then(resolve)
          .catch(reject)
      } else {
        reject(new Error('Seuls les fichiers PDF sont supportés'))
      }
    })
  }

  /**
   * Convertit un PDF en image (première page)
   */
  async convertPDFToImage(file) {
    try {
      console.log('📄 Début conversion PDF vers image...')
      
      // Charger PDF.js via script tag si pas déjà chargé
      if (!window.pdfjsLib) {
        console.log('📦 Chargement de PDF.js...')
        await this.loadPDFJS()
      }
      
      // S'assurer que le worker est désactivé
      if (window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions) {
        console.log('🔧 Désactivation du worker PDF.js...')
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = false
        console.log('✅ Worker PDF.js désactivé')
      } else {
        console.warn('⚠️ Impossible de désactiver le worker PDF.js')
      }
      
      const arrayBuffer = await file.arrayBuffer()
      console.log('📄 PDF chargé, taille:', arrayBuffer.byteLength, 'bytes')
      
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise
      console.log('📄 PDF parsé, nombre de pages:', pdf.numPages)
      
      // Récupérer la première page
      const page = await pdf.getPage(1)
      const scale = 2.0 // Résolution plus élevée
      const viewport = page.getViewport({ scale })
      console.log('📄 Page 1, dimensions:', viewport.width, 'x', viewport.height)
      
      // Créer un canvas pour la page
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.height = viewport.height
      canvas.width = viewport.width
      
      // Rendre la page sur le canvas
      console.log('🎨 Rendu de la page sur le canvas...')
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise
      console.log('✅ Page rendue sur le canvas')
      
      // Convertir le canvas en image
      const img = new Image()
      img.src = canvas.toDataURL('image/png')
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          console.log('✅ Image créée:', img.width, 'x', img.height)
          resolve(img)
        }
        img.onerror = (error) => {
          console.error('❌ Erreur lors de la création de l\'image:', error)
          reject(error)
        }
      })
    } catch (error) {
      console.error('❌ Erreur lors de la conversion PDF:', error)
      throw new Error('Impossible de convertir le PDF en image: ' + error.message)
    }
  }

  /**
   * Charge PDF.js via script tag
   */
  async loadPDFJS() {
    return new Promise((resolve, reject) => {
      // Vérifier si PDF.js est déjà chargé
      if (window.pdfjsLib) {
        console.log('✅ PDF.js déjà chargé')
        resolve()
        return
      }

      console.log('📦 Chargement de PDF.js...')
      
      // Créer le script tag - utiliser une version plus ancienne qui fonctionne mieux
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js'
      script.onload = () => {
        console.log('✅ PDF.js chargé avec succès')
        
        // Désactiver immédiatement le worker
        if (window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = false
          console.log('✅ Worker PDF.js désactivé immédiatement')
        }
        
        // Attendre un peu pour que PDF.js soit complètement initialisé
        setTimeout(() => {
          // S'assurer que le worker reste désactivé
          if (window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = false
            console.log('✅ Worker PDF.js confirmé désactivé (mode synchrone)')
          } else {
            console.warn('⚠️ Impossible de configurer PDF.js')
          }
          
          resolve()
        }, 100)
      }
      script.onerror = (error) => {
        console.error('❌ Erreur lors du chargement de PDF.js:', error)
        reject(error)
      }
      
      document.head.appendChild(script)
    })
  }

  /**
   * Applique une transformation à un fichier PDF uniquement
   */
  async applyTransformation(file, transform) {
    try {
      console.log('🔄 Début transformation PDF:', file.name, 'Transform:', transform)
      
      // Vérifier que c'est bien un PDF
      if (file.type !== 'application/pdf') {
        throw new Error(`Seuls les fichiers PDF sont supportés. Type reçu: ${file.type}`)
      }
      
      console.log('📄 Traitement PDF...')
      // Pour les PDF, on fait PDF → Image → Transformation → PDF
      return await this.transformPDF(file, transform)
    } catch (error) {
      console.error('❌ Erreur lors de la transformation PDF:', error)
      // En cas d'erreur, retourner le fichier original
      console.log('⚠️ Erreur, retour du fichier PDF original')
      return file
    }
  }

  /**
   * Transforme un PDF directement
   */
  async transformPDF(file, transform) {
    try {
      console.log('📄 Transformation PDF directe pour:', transform)
      
      // Essayer d'abord la transformation directe
      if (transform.rotation && [90, 180, 270].includes(transform.rotation)) {
        console.log('🔄 Tentative de rotation directe du PDF')
        return await this.rotatePDFDirect(file, transform.rotation)
      }
      
      // Pour les autres transformations (contrast, brightness, etc.), 
      // on doit passer par la conversion image car PDF.js ne les supporte pas
      console.log('⚠️ Transformation non supportée en direct, utilisation de la conversion image')
      return await this.transformPDFViaImage(file, transform)
    } catch (error) {
      console.error('❌ Erreur lors de la transformation PDF:', error)
      throw error
    }
  }

  /**
   * Rotation directe d'un PDF avec PDF-lib
   */
  async rotatePDFDirect(file, angle) {
    try {
      console.log('🔄 Rotation directe PDF avec PDF-lib...')
      
      // Charger PDF-lib
      if (!window.PDFLib) {
        console.log('📦 Chargement de PDF-lib...')
        await this.loadPDFLib()
      }
      
      const arrayBuffer = await file.arrayBuffer()
      console.log('📄 PDF chargé, taille:', arrayBuffer.byteLength, 'bytes')
      
      // Charger le PDF avec PDF-lib
      const pdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer)
      console.log('📄 PDF parsé avec PDF-lib, nombre de pages:', pdfDoc.getPageCount())
      
      // Créer un nouveau PDF
      const newPdfDoc = await window.PDFLib.PDFDocument.create()
      
      // Copier et faire tourner chaque page
      const pages = await newPdfDoc.copyPages(pdfDoc, pdfDoc.getPageIndices())
      
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i]
        const { width, height } = page.getSize()
        
        // Calculer les nouvelles dimensions après rotation
        let newWidth = width
        let newHeight = height
        
        if (angle === 90 || angle === 270) {
          newWidth = height
          newHeight = width
        }
        
        // Ajouter la page avec rotation
        const newPage = newPdfDoc.addPage([newWidth, newHeight])
        
        // Appliquer la rotation
        newPage.drawPage(page, {
          x: 0,
          y: 0,
          xScale: 1,
          yScale: 1,
          rotate: window.PDFLib.degrees(angle)
        })
      }
      
      // Générer le nouveau PDF
      const pdfBytes = await newPdfDoc.save()
      console.log('✅ PDF roté généré, taille:', pdfBytes.length, 'bytes')
      
      // Créer un nouveau fichier
      const baseName = file.name.replace(/\.[^/.]+$/, '')
      const fileName = `${baseName}-rotated-${angle}.pdf`
      
      return new File([pdfBytes], fileName, { type: 'application/pdf' })
    } catch (error) {
      console.error('❌ Erreur rotation directe PDF:', error)
      // Fallback vers la conversion image
      console.log('⚠️ Fallback vers conversion image...')
      return await this.transformPDFViaImage(file, { rotation: angle })
    }
  }

  /**
   * Charge PDF-lib via script tag
   */
  async loadPDFLib() {
    return new Promise((resolve, reject) => {
      // Vérifier si PDF-lib est déjà chargé
      if (window.PDFLib) {
        console.log('✅ PDF-lib déjà chargé')
        resolve()
        return
      }

      console.log('📦 Chargement de PDF-lib...')
      
      // Créer le script tag
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js'
      script.onload = () => {
        console.log('✅ PDF-lib chargé avec succès')
        resolve()
      }
      script.onerror = (error) => {
        console.error('❌ Erreur lors du chargement de PDF-lib:', error)
        reject(error)
      }
      
      document.head.appendChild(script)
    })
  }

  /**
   * Transforme un PDF via conversion image
   */
  async transformPDFViaImage(file, transform) {
    try {
      console.log('🔄 Début transformation PDF via image...')
      console.log('📋 Transformation demandée:', JSON.stringify(transform, null, 2))
      
      // Étape 1: PDF → Image
      console.log('📄 Étape 1: Conversion PDF → Image')
      const img = await this.convertPDFToImage(file)
      console.log('✅ PDF converti en image:', img.width, 'x', img.height)
      
      // Étape 2: Appliquer la transformation sur l'image
      console.log('🎨 Étape 2: Application de la transformation')
      console.log('🎯 Type de transformation:', Object.keys(transform)[0], 'Valeur:', Object.values(transform)[0])
      const transformedFile = await this.transformImage(img, transform)
      console.log('✅ Transformation appliquée, fichier généré:', transformedFile.name, 'Taille:', transformedFile.size)
      
      // Étape 3: Image → PDF
      console.log('📄 Étape 3: Conversion Image → PDF')
      const pdfFile = await this.convertImageToPDF(transformedFile, file.name)
      console.log('✅ Image convertie en PDF, fichier final:', pdfFile.name, 'Taille:', pdfFile.size)
      
      return pdfFile
    } catch (error) {
      console.error('❌ Erreur transformation PDF via image:', error)
      throw error
    }
  }

  /**
   * Transforme une image (utilisé uniquement pour la conversion PDF -> Image -> PDF)
   * Peut être un fichier ou un objet Image
   */
  async transformImage(input, transform) {
    try {
      console.log('🖼️ Début transformation image...')
      console.log('📥 Type d\'entrée:', input.constructor.name)
      console.log('🎨 Transformation à appliquer:', transform)
      
      this.initCanvas()
      
      // Déterminer si c'est un fichier ou une image
      let img, fileName
      if (input instanceof File) {
        console.log('📁 Entrée est un fichier:', input.name)
        img = await this.loadImageFromFile(input)
        fileName = input.name
      } else if (input instanceof Image) {
        console.log('🖼️ Entrée est une image:', input.width, 'x', input.height)
        img = input
        fileName = 'transformed-image.png'
      } else {
        throw new Error('Type d\'entrée non supporté pour la transformation')
      }
      
      console.log('✅ Image chargée:', img.width, 'x', img.height)
      
      // Appliquer les transformations selon le type
      if (transform.rotation) {
        console.log('🔄 Application rotation:', transform.rotation, 'degrés')
        return await this.applyRotation(img, transform.rotation)
      } else if (transform.skew) {
        console.log('📐 Application skew:', transform.skew)
        return await this.applySkew(img, transform.skew)
      } else if (transform.contrast !== undefined) {
        console.log('🎨 Application contraste:', transform.contrast)
        return await this.applyContrast(img, transform.contrast)
      } else if (transform.brightness !== undefined) {
        console.log('💡 Application luminosité:', transform.brightness)
        return await this.applyBrightness(img, transform.brightness)
      } else if (transform.invert) {
        console.log('🔄 Application inversion')
        return await this.applyInvert(img)
      } else if (transform.noise !== undefined) {
        console.log('🔊 Application bruit:', transform.noise)
        return await this.applyNoise(img, transform.noise)
      }
      
      console.log('⚠️ Aucune transformation spécifique détectée, retour de l\'image originale')
      // Si aucune transformation spécifique, retourner l'image originale
      return await this.imageToFile(img, fileName)
      
    } catch (error) {
      console.error('❌ Erreur lors de la transformation image:', error)
      throw error
    }
  }

  /**
   * Applique une rotation à l'image
   */
  async applyRotation(img, angle) {
    const radians = (angle * Math.PI) / 180
    
    // Calculer les nouvelles dimensions
    const cos = Math.abs(Math.cos(radians))
    const sin = Math.abs(Math.sin(radians))
    const newWidth = img.width * cos + img.height * sin
    const newHeight = img.width * sin + img.height * cos
    
    // Configurer le canvas
    this.canvas.width = newWidth
    this.canvas.height = newHeight
    
    // Centrer l'image
    this.ctx.translate(newWidth / 2, newHeight / 2)
    this.ctx.rotate(radians)
    this.ctx.translate(-img.width / 2, -img.height / 2)
    
    // Dessiner l'image
    this.ctx.drawImage(img, 0, 0)
    
    return await this.canvasToFile(`rotated-${angle}deg-${Date.now()}.png`)
  }

  /**
   * Applique une inclinaison (skew) à l'image
   */
  async applySkew(img, angle) {
    this.canvas.width = img.width
    this.canvas.height = img.height
    
    // Appliquer la transformation de skew
    this.ctx.setTransform(1, Math.tan(angle * Math.PI / 180), 0, 1, 0, 0)
    this.ctx.drawImage(img, 0, 0)
    
    return await this.canvasToFile(`skewed-${angle}deg-${Date.now()}.png`)
  }

  /**
   * Applique un ajustement de contraste
   */
  async applyContrast(img, contrast) {
    this.canvas.width = img.width
    this.canvas.height = img.height
    
    // Dessiner l'image
    this.ctx.drawImage(img, 0, 0)
    
    // Appliquer le filtre de contraste
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
    const data = imageData.data
    
    for (let i = 0; i < data.length; i += 4) {
      // Appliquer la formule de contraste
      data[i] = this.clamp((data[i] - 128) * contrast + 128)     // R
      data[i + 1] = this.clamp((data[i + 1] - 128) * contrast + 128) // G
      data[i + 2] = this.clamp((data[i + 2] - 128) * contrast + 128) // B
    }
    
    this.ctx.putImageData(imageData, 0, 0)
    
    return await this.canvasToFile(`contrast-${contrast}-${Date.now()}.png`)
  }

  /**
   * Applique un ajustement de luminosité
   */
  async applyBrightness(img, brightness) {
    this.canvas.width = img.width
    this.canvas.height = img.height
    
    // Dessiner l'image
    this.ctx.drawImage(img, 0, 0)
    
    // Appliquer le filtre de luminosité
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
    const data = imageData.data
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = this.clamp(data[i] * brightness)     // R
      data[i + 1] = this.clamp(data[i + 1] * brightness) // G
      data[i + 2] = this.clamp(data[i + 2] * brightness) // B
    }
    
    this.ctx.putImageData(imageData, 0, 0)
    
    return await this.canvasToFile(`brightness-${brightness}-${Date.now()}.png`)
  }

  /**
   * Inverse les couleurs de l'image
   */
  async applyInvert(img) {
    this.canvas.width = img.width
    this.canvas.height = img.height
    
    // Dessiner l'image
    this.ctx.drawImage(img, 0, 0)
    
    // Appliquer l'inversion
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
    const data = imageData.data
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i]     // R
      data[i + 1] = 255 - data[i + 1] // G
      data[i + 2] = 255 - data[i + 2] // B
    }
    
    this.ctx.putImageData(imageData, 0, 0)
    
    return await this.canvasToFile(`inverted-${Date.now()}.png`)
  }

  /**
   * Ajoute du bruit à l'image
   */
  async applyNoise(img, intensity) {
    this.canvas.width = img.width
    this.canvas.height = img.height
    
    // Dessiner l'image
    this.ctx.drawImage(img, 0, 0)
    
    // Ajouter du bruit
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
    const data = imageData.data
    
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * intensity * 255
      data[i] = this.clamp(data[i] + noise)     // R
      data[i + 1] = this.clamp(data[i + 1] + noise) // G
      data[i + 2] = this.clamp(data[i + 2] + noise) // B
    }
    
    this.ctx.putImageData(imageData, 0, 0)
    
    return await this.canvasToFile(`noise-${intensity}-${Date.now()}.png`)
  }

  /**
   * Convertit une image en fichier
   */
  async imageToFile(img, originalName) {
    this.canvas.width = img.width
    this.canvas.height = img.height
    this.ctx.drawImage(img, 0, 0)
    return await this.canvasToFile(originalName)
  }

  /**
   * Convertit le canvas en fichier
   */
  async canvasToFile(filename) {
    return new Promise((resolve) => {
      this.canvas.toBlob((blob) => {
        const file = new File([blob], filename, { type: 'image/png' })
        resolve(file)
      }, 'image/png')
    })
  }

  /**
   * Convertit une image en PDF
   */
  async convertImageToPDF(imgFile, originalFileName) {
    try {
      console.log('🔄 Conversion image vers PDF...')
      
      // Charger jsPDF via script tag si pas déjà chargé
      if (!window.jsPDF && !window.jspdf) {
        console.log('📦 Chargement de jsPDF...')
        await this.loadJSPDF()
      }
      
      // Essayer différentes façons d'accéder à jsPDF
      let jsPDF = window.jsPDF || window.jspdf || window.jspdf.jsPDF
      
      if (!jsPDF) {
        console.error('❌ jsPDF non trouvé sur window:', Object.keys(window).filter(k => k.toLowerCase().includes('pdf')))
        throw new Error('jsPDF n\'est pas disponible après le chargement')
      }
      
      // Créer un nouveau PDF
      const pdf = new jsPDF()
      console.log('✅ jsPDF initialisé')
      
      // Lire l'image depuis le fichier
      const imgData = await this.fileToDataURL(imgFile)
      console.log('✅ Image convertie en data URL')
      
      // Calculer les dimensions pour ajuster l'image au PDF
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      console.log('📄 Dimensions PDF:', pdfWidth, 'x', pdfHeight)
      
      // Utiliser les dimensions de la page PDF
      const finalWidth = pdfWidth
      const finalHeight = pdfHeight
      
      // Ajouter l'image au PDF (pleine page)
      pdf.addImage(imgData, 'PNG', 0, 0, finalWidth, finalHeight)
      console.log('✅ Image ajoutée au PDF')
      
      // Générer le PDF
      const pdfBlob = pdf.output('blob')
      console.log('✅ PDF généré, taille:', pdfBlob.size, 'bytes')
      
      // Créer un nom de fichier approprié
      const baseName = originalFileName.replace(/\.[^/.]+$/, '')
      const fileName = `${baseName}-transformed.pdf`
      
      return new File([pdfBlob], fileName, { type: 'application/pdf' })
    } catch (error) {
      console.error('❌ Erreur lors de la conversion image vers PDF:', error)
      throw new Error('Impossible de convertir l\'image en PDF: ' + error.message)
    }
  }

  /**
   * Charge jsPDF via script tag
   */
  async loadJSPDF() {
    return new Promise((resolve, reject) => {
      // Vérifier si jsPDF est déjà chargé
      if (window.jsPDF || window.jspdf) {
        console.log('✅ jsPDF déjà chargé')
        resolve()
        return
      }

      console.log('📦 Chargement de jsPDF...')
      
      // Créer le script tag - utiliser une version plus stable
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.4.0/jspdf.umd.min.js'
      script.onload = () => {
        console.log('✅ jsPDF chargé avec succès')
        
        // Attendre un peu pour que jsPDF soit complètement initialisé
        setTimeout(() => {
          // Vérifier différentes façons d'accéder à jsPDF
          const jsPDF = window.jsPDF || window.jspdf || window.jspdf?.jsPDF
          if (jsPDF) {
            console.log('✅ jsPDF initialisé et prêt')
            console.log('📋 jsPDF trouvé sur:', Object.keys(window).filter(k => k.toLowerCase().includes('pdf')))
          } else {
            console.warn('⚠️ jsPDF chargé mais pas initialisé')
            console.log('🔍 Objets disponibles sur window:', Object.keys(window).filter(k => k.toLowerCase().includes('pdf')))
          }
          resolve()
        }, 200)
      }
      script.onerror = (error) => {
        console.error('❌ Erreur lors du chargement de jsPDF:', error)
        reject(error)
      }
      
      document.head.appendChild(script)
    })
  }

  /**
   * Convertit un fichier en data URL
   */
  async fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  /**
   * Contraint une valeur entre 0 et 255
   */
  clamp(value) {
    return Math.max(0, Math.min(255, Math.round(value)))
  }

  /**
   * Génère une preview d'une transformation
   */
  async generatePreview(file, transform) {
    try {
      const transformedFile = await this.applyTransformation(file, transform)
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.readAsDataURL(transformedFile)
      })
    } catch (error) {
      console.error('Erreur lors de la génération de preview:', error)
      return null
    }
  }

  /**
   * Obtient des informations sur le fichier PDF et les transformations supportées
   */
  getFileInfo(file) {
    const info = {
      name: file.name,
      size: file.size,
      type: file.type,
      isPDF: file.type === 'application/pdf',
      isImage: false, // Seuls les PDFs sont supportés
      supportedTransformations: []
    }

    if (info.isPDF) {
      info.supportedTransformations = [
        'rotation', 'skew', 'contrast', 'brightness', 'invert', 'noise'
      ]
      info.note = 'PDF → Image → Transformation → PDF → OCR'
      info.process = 'Conversion PDF en image, transformation, puis reconversion en PDF'
    } else {
      info.note = 'Seuls les fichiers PDF sont supportés par l\'API OCR'
      info.process = 'Format non supporté'
    }

    return info
  }
}

export default new ImageTransformationService()
