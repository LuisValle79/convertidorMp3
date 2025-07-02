const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const fs = require('fs');



const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the current directory (for index.html, style.css, script.js)
app.use(express.static(__dirname));

app.post('/convert', async (req, res) => {
    const { url } = req.body;



    try {
        try {
            const options = {
                method: 'POST',
                url: 'https://youtube-to-mp315.p.rapidapi.com/download',
                headers: {
                    'content-type': 'application/json',
                    'X-RapidAPI-Host': 'youtube-to-mp315.p.rapidapi.com',
                    'X-RapidAPI-Key': '50646a996emshe4e5f0d58b08d03p1f4853jsn124f826c1c12' // You need to replace this with your actual RapidAPI Key
                },
                data: {
                    url: url,
                    format: 'mp3'
                }
            };

            const response = await axios.request(options);
            const { id, downloadUrl, status, title } = response.data;

            if (status === 'AVAILABLE' && downloadUrl) {
                res.json({ message: 'Conversión completada.', title: title, downloadLink: downloadUrl });
            } else if (status === 'CONVERTING') {
                // You might want to implement a polling mechanism here to check status
                res.status(202).json({ message: 'Conversión en progreso, por favor espere.', id: id });
            } else {
                res.status(500).json({ error: 'Error en la conversión: ' + (response.data.error || 'Unknown error') });
            }
        } catch (apiError) {
            console.error('Error al llamar a la API de RapidAPI:', apiError.message, apiError.stack);
            res.status(500).json({ error: 'Error al procesar la URL del video: ' + apiError.message });
        }

    } catch (error) {
        console.error('Error al procesar la URL:', error.message, error.stack);
        res.status(500).json({ error: 'Error al procesar la URL del video: ' + error.message });
    }
});



app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});