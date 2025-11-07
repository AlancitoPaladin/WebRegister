class CameraManager {
  constructor() {
    this.video = document.getElementById('webcamVideo');
    this.canvas = document.getElementById('canvas');
    this.preview = document.getElementById('preview');
    this.cameraContainer = document.getElementById('cameraContainer');
    this.photoStatus = document.getElementById('photoStatus');
    this.fotoBase64Input = document.getElementById('fotoBase64');
    
    this.startButton = document.getElementById('startCamera');
    this.captureButton = document.getElementById('capturePhoto');
    this.retakeButton = document.getElementById('retakePhoto');
    
    this.stream = null;
    this.photoData = null;
    
    this.init();
  }

  init() {
    this.startButton.addEventListener('click', () => this.startCamera());
    this.captureButton.addEventListener('click', () => this.capturePhoto());
    this.retakeButton.addEventListener('click', () => this.retakePhoto());
  }

  async startCamera() {
    try {
      // Solicitar acceso a la cámara
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user', // Cámara frontal
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });

      // Asignar el stream al video
      this.video.srcObject = this.stream;
      await this.video.play();

      
      // Mostrar la cámara
      this.cameraContainer.classList.add('active');
      this.preview.classList.remove('active');
      
      // Cambiar visibilidad de botones
      this.startButton.style.display = 'none';
      this.captureButton.style.display = 'inline-block';
      this.retakeButton.style.display = 'none';
      this.photoStatus.classList.remove('active');

      console.log('✓ Cámara iniciada correctamente');
    } catch (error) {
      console.error('Error al acceder a la cámara:', error);
      alert('No se pudo acceder a la cámara. Verifica los permisos del navegador.');
    }
  }

  capturePhoto() {
    // Configurar el canvas con las dimensiones del video
    this.canvas.width = this.video.videoWidth;
    this.canvas.height = this.video.videoHeight;

    // Dibujar el frame actual del video en el canvas
    const context = this.canvas.getContext('2d');
    context.drawImage(this.video, 0, 0);

    // Convertir a Base64
    this.photoData = this.canvas.toDataURL('image/jpeg', 0.8);
    
    // Guardar en el campo oculto
    this.fotoBase64Input.value = this.photoData;

    // Mostrar vista previa
    this.preview.src = this.photoData;
    this.preview.classList.add('active');

    // Ocultar cámara
    this.cameraContainer.classList.remove('active');
    
    // Detener el stream
    this.stopCamera();

    // Cambiar visibilidad de botones
    this.captureButton.style.display = 'none';
    this.retakeButton.style.display = 'inline-block';
    this.startButton.style.display = 'none';
    this.photoStatus.classList.add('active');

    console.log('Foto capturada y convertida a Base64');
    console.log('Tamaño de la imagen:', (this.photoData.length / 1024).toFixed(2) + ' KB');
  }

  retakePhoto() {
    // Limpiar datos
    this.photoData = null;
    this.fotoBase64Input.value = '';
    this.preview.src = '';
    this.preview.classList.remove('active');
    this.photoStatus.classList.remove('active');

    // Reiniciar cámara
    this.startCamera();
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
      console.log('Cámara detenida');
    }
  }

  getPhotoBase64() {
    return this.photoData;
  }

  hasPhoto() {
    return this.photoData !== null;
  }

  reset() {
    this.stopCamera();
    this.photoData = null;
    this.fotoBase64Input.value = '';
    this.preview.src = '';
    this.preview.classList.remove('active');
    this.cameraContainer.classList.remove('active');
    this.photoStatus.classList.remove('active');
    
    this.startButton.style.display = 'inline-block';
    this.captureButton.style.display = 'none';
    this.retakeButton.style.display = 'none';
  }
}

// Inicializar cuando el DOM esté listo
let camera;
document.addEventListener('DOMContentLoaded', () => {
  camera = new CameraManager();
  console.log('Sistema de cámara inicializado');
});

// Limpiar al cerrar la página
window.addEventListener('beforeunload', () => {
  if (camera) {
    camera.stopCamera();
  }
});