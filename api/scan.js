const fs = require('fs');
const path = require('path');

export default function handler(req, res) {
    // Permitir CORS por si acaso
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Obtenemos el código de barras y el cliente desde la query string (?code=123&client=stock)
    const { code, client = 'stock' } = req.query;

    if (!code) {
        return res.status(400).json({ success: false, message: 'Código de barras no proporcionado' });
    }

    try {
        // En Vercel, process.cwd() apunta a la raíz del proyecto.
        const filePath = path.join(process.cwd(), 'data', `${client}.json`);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: 'Base de datos del cliente no encontrada' });
        }

        const fileContents = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContents);

        // Soporta formatos donde el array principal está bajo "stock" o es directamente un array
        const stockArray = data.stock ? data.stock : data;

        // Buscar el producto por código
        const product = stockArray.find(p => p.code === code);

        if (product) {
            res.status(200).json({ success: true, product });
        } else {
            res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }
    } catch (error) {
        console.error("Error leyendo la base de datos:", error);
        res.status(500).json({ success: false, message: 'Error interno del servidor leyendo el archivo JSON' });
    }
}
