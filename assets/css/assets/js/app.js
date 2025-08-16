// Doors — shared JS: door open/close and per-page interactives

// Door opens on load
function doorOpenOnLoad(){
  const frame = document.querySelector('.doorframe');
  if (!frame) return;
  // small delay so CSS can apply before animating
  requestAnimationFrame(()=> setTimeout(()=> frame.classList.add('open'), 60));
}

// Close door, then navigate
function doorNavigate(href){
  const frame = document.querySelector('.doorframe');
  if (!frame){ location.href = href; return; }
  const L = frame.querySelector('.left'), R = frame.querySelector('.right');
  // bring panels back to center
  L.style.transition = R.style.transition = 'transform .6s ease';
  L.style.transform = 'translateX(0)';
  R.style.transform = 'translateX(0)';
  setTimeout(()=> location.href = href, 610);
}

// Wire any [data-next] links
function wireDoorLinks(){
  document.querySelectorAll('[data-next]').forEach(link=>{
    link.addEventListener('click', (e)=>{
      e.preventDefault();
      const target = link.getAttribute('data-next') || link.getAttribute('href');
      doorNavigate(target);
    });
  });
}

/* ===== Page Interactives ===== */

// 1) LIFE — particle garden with growth slider
function initLifeGarden(){
  const canvas = document.getElementById('garden');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const slider = document.getElementById('growth');

  function size(){
    const dpr = devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = Math.max(260, canvas.clientWidth * 0.5) * dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  size(); addEventListener('resize', size);

  const particles = [];
  function spawn(count){
    for (let i=0;i<count;i++){
      particles.push({
        x: Math.random()*canvas.clientWidth,
        y: canvas.clientHeight + Math.random()*30,
        vx: (Math.random()-0.5)*0.4,
        vy: - (0.6 + Math.random()*0.9),
        life: 260 + Math.random()*240,
        age: 0,
        hue: 160 + Math.random()*60
      });
    }
  }

  function frame(){
    ctx.clearRect(0,0,canvas.clientWidth,canvas.clientHeight);
    const growth = parseFloat(slider.value);
    spawn(Math.round(1 + growth/6));
    for (let i=particles.length-1;i>=0;i--){
      const p = particles[i];
      p.x += p.vx; p.y += p.vy; p.age++;
      const alpha = Math.max(0, 1 - p.age/p.life);
      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.hue}, 90%, 70%, ${alpha})`;
      ctx.arc(p.x, p.y, 2 + (1-alpha)*3, 0, Math.PI*2);
      ctx.fill();
      if (p.age > p.life || p.y < -10) particles.splice(i,1);
    }
    requestAnimationFrame(frame);
  }
  frame();
}

// 2) DEATH — entropy slider dissolves a shape
function initEntropyDissolve(){
  const canvas = document.getElementById('entropyCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const slider = document.getElementById('entropy');

  function size(){
    const dpr = devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = Math.max(220, canvas.clientWidth * 0.45) * dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  size(); addEventListener('resize', size);

  function draw(level){
    ctx.clearRect(0,0,canvas.clientWidth,canvas.clientHeight);
    ctx.fillStyle = '#4ee2c0';
    const r = Math.min(canvas.clientWidth, canvas.clientHeight)*0.18;
    ctx.beginPath(); ctx.arc(canvas.clientWidth/2, canvas.clientHeight/2, r, 0, Math.PI*2); ctx.fill();

    // dissolve: randomly punch out alpha pixels depending on entropy level
    const img = ctx.getImageData(0,0,canvas.clientWidth,canvas.clientHeight);
    const data = img.data;
    const chance = (level/100)*0.9;
    for (let i=0;i<data.length;i+=4){
      if (data[i+3]>0 && Math.random()<chance){ data[i+3] = 0; }
    }
    ctx.putImageData(img,0,0);
  }

  draw(0);
  slider.addEventListener('input', ()=> draw(parseInt(slider.value,10)));
}

// 3) QUANTUM — Schrödinger’s box
function initSchrodingerBox(){
  const stateEl = document.getElementById('state');
  const btn = document.getElementById('observe');
  if (!stateEl || !btn) return;
  let observed = false;
  let alive = null;

  function update(){
    if (!observed){
      stateEl.textContent = 'superposition: |alive〉 + |dead〉';
      return;
    }
    stateEl.textContent = alive ? 'collapsed: |alive〉' : 'collapsed: |dead〉';
  }

  btn.addEventListener('click', ()=>{
    observed = true;
    alive = Math.random() < 0.5;
    update();
  });

  update();
}

// 4) TIME — light-cone with play/pause
function initLightCone(){
  const svg = document.getElementById('lightcone');
  const play = document.getElementById('play');
  const pause = document.getElementById('pause');
  if (!svg || !play || !pause) return;

  const dot = svg.querySelector('#now');
  let raf = null, t=0;

  function step(){
    t += 0.01;
    const y = 160 - (Math.sin(t)*60 + 60);
    dot.setAttribute('cy', y.toFixed(2));
    raf = requestAnimationFrame(step);
  }
  play.addEventListener('click', ()=> { if (!raf) raf = requestAnimationFrame(step); });
  pause.addEventListener('click', ()=> { if (raf) cancelAnimationFrame(raf); raf = null; });
}

// 5) PARADOX — interpretation toggle
function initInterpretationToggle(){
  const toggle = document.getElementById('interpToggle');
  const mw = document.getElementById('manyworlds');
  const cph = document.getElementById('copenhagen');
  if (!toggle || !mw || !cph) return;

  function render(){
    const on = toggle.checked;
    mw.style.display = on ? 'block' : 'none';
    cph.style.display = on ? 'none' : 'block';
  }
  toggle.addEventListener('input', render);
  render();
}

// Boot per page
document.addEventListener('DOMContentLoaded', ()=>{
  doorOpenOnLoad();
  wireDoorLinks();
  const page = document.body.dataset.page;
  ({
    life: initLifeGarden,
    death: initEntropyDissolve,
    quantum: initSchrodingerBox,
    time: initLightCone,
    paradox: initInterpretationToggle
  }[page] || (()=>{}))();
});
