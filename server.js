const express = require('express');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Set the path to the ffmpeg binary
ffmpeg.setFfmpegPath(ffmpegStatic);

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the current directory (for index.html, style.css, script.js)
app.use(express.static(__dirname));

app.post('/convert', async (req, res) => {
    const { url } = req.body;

    if (!ytdl.validateURL(url)) {
        return res.status(400).json({ error: 'URL de YouTube inválida.' });
    }

    try {
        const info = await ytdl.getInfo(url);
        const videoTitle = info.videoDetails.title.replace(/[^a-zA-Z0-9_ -]/g, '').substring(0, 50); // Sanitize and truncate title
        const outputFilePath = path.join(__dirname, 'downloads', `${videoTitle}.mp3`);

        // Ensure the downloads directory exists
        if (!fs.existsSync(path.join(__dirname, 'downloads'))) {
            fs.mkdirSync(path.join(__dirname, 'downloads'));
        }

        const audioStream = ytdl(url, { quality: 'highestaudio' });

        audioStream.on('error', (err) => {
            console.error('Error en el stream de ytdl-core:', err.message);
            // It's important to handle this error and potentially stop the ffmpeg process
            // or inform the client about the failure.
        });

        audioStream.on('end', () => {
            console.log('ytdl-core stream ended, starting ffmpeg conversion.');
        });

        ffmpeg(audioStream)
            .toFormat('mp3')
            .save(outputFilePath)
            .on('progress', (p) => {
                console.log(`${videoTitle}: ${p.targetSize}kb downloaded`);
            })
            .on('end', () => {
                console.log(`Conversión completada para: ${videoTitle}.mp3`);
                res.json({ message: 'Conversión completada.', title: videoTitle, downloadLink: `/download/${encodeURIComponent(videoTitle)}.mp3` });
            })
            .on('error', (err) => {
                console.error(`Error durante la conversión de ${videoTitle}:`, err.message);
                res.status(500).json({ error: 'Error durante la conversión del video.' });
            });

    } catch (error) {
        console.error('Error al procesar la URL:', error.message);
        res.status(500).json({ error: 'Error al procesar la URL del video.' });
    }
});

app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'downloads', filename);

    if (fs.existsSync(filePath)) {
        res.download(filePath, (err) => {
            if (err) {
                console.error('Error al descargar el archivo:', err);
                res.status(500).send('Error al descargar el archivo.');
            } else {
                console.log(`Archivo ${filename} descargado.`);
                // Optionally delete the file after download
                // fs.unlink(filePath, (unlinkErr) => {
                //     if (unlinkErr) console.error('Error al eliminar el archivo:', unlinkErr);
                // });
            }
        });
    } else {
        res.status(404).send('Archivo no encontrado.');
    }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});