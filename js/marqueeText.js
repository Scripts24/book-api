const mensajes = [
    "🧭 Atención: L-V 9-18 hs",
    "📞 2211234567",
    "📦 Envío gratis en pedidos +$50.000", 
    "🎁 10% OFF con código WEB10",
    "📚 Nuevos ingresos cada semana"
  ];
  
  const trackSpans = document.querySelectorAll('#marqueeText, #marqueeTextDup');
  let idx = 0;
  
  setInterval(() => {
    idx = (idx + 1) % mensajes.length;
    trackSpans.forEach(el => el.textContent = mensajes[idx]);
  }, 5000);