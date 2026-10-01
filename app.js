document.addEventListener("DOMContentLoaded", () => {
    const scannerContainer = document.getElementById('scanner-container');
    const resultDiv = document.getElementById('result');
    const productName = document.getElementById('product-name');
    const productPrice = document.getElementById('product-price');
    const rescanBtn = document.getElementById('rescan-btn');

    let html5QrCode;

    // Obtener el ID del cliente de la URL (ej. ?client=stock). Por defecto usa "stock"
    const urlParams = new URLSearchParams(window.location.search);
    const clientId = urlParams.get('client') || 'stock';

    function onScanSuccess(decodedText, decodedResult) {
        // Detener el escaneo temporalmente para evitar lecturas duplicadas
        html5QrCode.pause();
        
        // Efecto visual y de sonido (opcional)
        if ("vibrate" in navigator) {
            navigator.vibrate(100);
        }

        // Consultar a la API de Vercel
        fetch(`/api/scan?code=${encodeURIComponent(decodedText)}&client=${clientId}`)
            .then(res => res.json())
            .then(data => {
                scannerContainer.style.display = 'none';
                resultDiv.style.display = 'flex';

                if (data.success) {
                    productName.innerText = data.product.name;
                    // Formatear precio (ej: 36300 -> 36.300)
                    productPrice.innerText = data.product.price.toLocaleString('es-AR', { minimumFractionDigits: 0 });
                    document.querySelector('.currency').style.color = '#28a745'; // Verde
                } else {
                    productName.innerText = "Producto no encontrado";
                    productPrice.innerText = "---";
                    document.querySelector('.currency').style.color = '#dc3545'; // Rojo
                }
            })
            .catch(err => {
                scannerContainer.style.display = 'none';
                resultDiv.style.display = 'flex';
                productName.innerText = "Error de conexión";
                productPrice.innerText = "---";
                document.querySelector('.currency').style.color = '#dc3545'; // Rojo
                console.error(err);
            });
    }

    function onScanFailure(error) {
        // Ignorar fallos constantes de lectura ya que ocurren continuamente hasta que engancha el código
    }

    // Inicializar la cámara
    html5QrCode = new Html5Qrcode("reader");
    const config = { 
        fps: 10, 
        qrbox: { width: 250, height: 100 },
        aspectRatio: 1.0
    };

    html5QrCode.start({ facingMode: "environment" }, config, onScanSuccess, onScanFailure)
        .catch(err => {
            console.error("Error al iniciar la cámara:", err);
            productName.innerText = "Por favor, otorga permisos de cámara";
            scannerContainer.style.display = 'none';
            resultDiv.style.display = 'flex';
        });

    // Botón para volver a escanear
    rescanBtn.addEventListener('click', () => {
        resultDiv.style.display = 'none';
        scannerContainer.style.display = 'block';
        // Reiniciar los valores visuales
        productName.innerText = "Buscando...";
        productPrice.innerText = "0.00";
        document.querySelector('.currency').style.color = '#28a745';
        // Reanudar el escáner
        html5QrCode.resume();
    });
});
