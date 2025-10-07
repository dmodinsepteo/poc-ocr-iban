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
   * Charge une image depuis un fichier
   */
  loadImageFromFile(file) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const reader = new FileReader()
      
      reader.onload = (e) => {
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = e.target.result
      }
      
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  /**
   * Applique une transformation à une image
   */
  async applyTransformation(file, transform) {
    try {
      this.initCanvas()
      
      // Charger l'image
      const img = await this.loadImageFromFile(file)
      
      // Appliquer les transformations selon le type
      if (transform.rotation) {
        return await this.applyRotation(img, transform.rotation)
      } else if (transform.skew) {
        return await this.applySkew(img, transform.skew)
      } else if (transform.contrast !== undefined) {
        return await this.applyContrast(img, transform.contrast)
      } else if (transform.brightness !== undefined) {
        return await this.applyBrightness(img, transform.brightness)
      } else if (transform.invert) {
        return await this.applyInvert(img)
      } else if (transform.noise !== undefined) {
        return await this.applyNoise(img, transform.noise)
      }
      
      // Si aucune transformation spécifique, retourner l'image originale
      return await this.imageToFile(img, file.name)
      
    } catch (error) {
      console.error('Erreur lors de la transformation:', error)
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
}

export default new ImageTransformationService()
