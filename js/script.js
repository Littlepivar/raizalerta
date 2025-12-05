// script.js — versão compatível mobile/desktop sem IIFE

// Helpers
function qs(sel){return document.querySelector(sel)}
function qsa(sel){return document.querySelectorAll(sel)}

// ------------------------------
// LOGIN SIMPLES (DEMO)
// ------------------------------
var loginForm = qs('#loginForm');
if(loginForm){
  loginForm.addEventListener('submit', function(e){
    e.preventDefault();
    window.location.href = 'usuario.html';
  });
}

// ------------------------------
// FORM DE CONTATO (DEMO)
// ------------------------------
var contactForm = qs('#contactForm');
if(contactForm){
  contactForm.addEventListener('submit', function(e){
    e.preventDefault();
    alert('Mensagem enviada — (demo)');
    contactForm.reset();
  });
}

// Helper para escrever valores
function setText(id, text){
  var el = qs('#'+id);
  if(el) el.textContent = text;
}

// ------------------------------
// PAINEL DO USUÁRIO (DEMO)
// ------------------------------
function initUserPanel(){
  if(!qs('.user-panel')) return;  // só roda se estiver na página certa

  // Estado inicial simulado
  var state = {
    moisture: 45,
    temp: 23.5,
    ph: 6.4,
    light: 12000,
    historyMoisture: [],
    historyTemp: [],
    alerts: []
  };

  // Preenche gráficos com histórico inicial
  for(var i=0;i<20;i++){
    state.historyMoisture.push(45 + Math.round((Math.random()-0.5)*10));
    state.historyTemp.push(23 + (Math.random()-0.5)*3);
  }

  // Atualiza valores no painel
  function refreshValues(){
    setText('moistureValue', state.moisture + ' %');
    setText('phValue', state.ph.toFixed(1));
    setText('lightValue', state.light + ' lx');
    setText('tempValue', state.temp.toFixed(1) + ' °C');
  }

  // Gera alertas automáticos
  function maybePushAlert(){
    if(state.moisture < 30){
      state.alerts.unshift({
        time: new Date(),
        text: 'Umidade baixa — irrigar',
        level: 'warn'
      });
    }
    if(state.ph < 5.8 || state.ph > 7.2){
      state.alerts.unshift({
        time: new Date(),
        text: 'pH fora do ideal',
        level: 'warn'
      });
    }
    if(state.light < 1000){
      state.alerts.unshift({
        time: new Date(),
        text: 'Baixa luminosidade detectada',
        level: 'info'
      });
    }

    // Mantém só os últimos 12 alertas
    state.alerts = state.alerts.slice(0,12);
    renderAlerts();
  }

  // Exibe alertas na tela
  function renderAlerts(){
    var list = qs('#alertsList');
    if(!list) return;

    list.innerHTML = '';
    state.alerts.forEach(function(a){
      var li = document.createElement('li');
      li.textContent = '[' + a.time.toLocaleTimeString() + '] ' + a.text;
      list.appendChild(li);
    });
  }

  // -------------------------
  // GRÁFICOS (Chart.js)
  // -------------------------
  var ctxM = qs('#chartMoisture').getContext('2d');
  var ctxT = qs('#chartTemp').getContext('2d');

  var chartMoisture = new Chart(ctxM, {
    type:'line',
    data:{
      labels: state.historyMoisture.map((_,i)=>i),
      datasets:[{
        label:'Umidade',
        data:state.historyMoisture,
        fill:true,
        tension:0.3
      }]
    },
    options:{
      responsive:true,
      plugins:{ legend:{ display:false } }
    }
  });

  var chartTemp = new Chart(ctxT, {
    type:'line',
    data:{
      labels: state.historyTemp.map((_,i)=>i),
      datasets:[{
        label:'Temperatura',
        data:state.historyTemp,
        fill:true,
        tension:0.3
      }]
    },
    options:{
      responsive:true,
      plugins:{ legend:{ display:false } }
    }
  });

  // -------------------------
  // ATUALIZAÇÃO AUTOMÁTICA
  // -------------------------
  setInterval(function(){
    // Variações simuladas
    state.moisture = Math.max(8, Math.min(95, Math.round((state.moisture + (Math.random()-0.5)*6)*10)/10));
    state.temp = Math.max(-5, Math.min(45, (state.temp + (Math.random()-0.5)*1.2)));
    state.ph = Math.max(4.0, Math.min(8.5, (state.ph + (Math.random()-0.5)*0.12)));
    state.light = Math.max(0, Math.round(state.light + (Math.random()-0.5)*2000));

    // Atualiza históricos
    state.historyMoisture.push(Math.round(state.moisture));
    state.historyTemp.push(parseFloat(state.temp.toFixed(1)));

    if(state.historyMoisture.length > 40) state.historyMoisture.shift();
    if(state.historyTemp.length > 40) state.historyTemp.shift();

    // Atualiza gráficos
    chartMoisture.data.labels = state.historyMoisture.map((_,i)=>i);
    chartMoisture.data.datasets[0].data = state.historyMoisture;
    chartMoisture.update();

    chartTemp.data.labels = state.historyTemp.map((_,i)=>i);
    chartTemp.data.datasets[0].data = state.historyTemp;
    chartTemp.update();

    // Atualiza interface
    refreshValues();
    maybePushAlert();

  }, 3000);

  // Inicializa valores
  refreshValues();
  renderAlerts();
}

initUserPanel();
