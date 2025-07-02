const btn = document.getElementById("convertBtn");
const status = document.getElementById("status");

btn.addEventListener("click", () => {
  const url = document.getElementById("videoURL").value.trim();

  if (!url) {
    status.innerText = "⚠️ Por favor ingresa una URL válida.";
    return;
  }

  status.innerText = "⏳ Convirtiendo...";

  // Conexión con el backend
  fetch('http://localhost:3000/convert', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: url }),
  })
  .then(response => response.json())
  .then(data => {
    if (data.error) {
      status.innerText = `❌ Error: ${data.error}`;
    } else {
      status.innerText = `✅ ${data.message}`;
      if (data.downloadLink) {
        status.innerHTML = `✅ MP3 generado: <a href="${data.downloadLink}" target="_blank" class="download-link">Descargar ${data.title}.mp3</a>`;
      } else {
        status.innerText = `✅ ${data.message}`; // Fallback if no downloadLink is provided
      }
    }
  })
  .catch(error => {
    console.error('Error:', error);
    status.innerText = "❌ Error al conectar con el servidor.";
  });
});
