// ============================================
// js/aviso-construcao.js — VERSÃO 2
// Banner Em Construção com Ticker
// Para DESATIVAR: AVISO_ATIVO = false
// ============================================

const AVISO_ATIVO = true

// Frases que vão passar no ticker (texto correndo)
const TICKER_FRASES = [
  '🚧 Estamos montando nosso catálogo online!',
  '🐠 Em breve todos os produtos disponíveis aqui.',
  '🪸 Peixes, corais, aquários e equipamentos selecionados.',
  '💬 Enquanto isso, consulte pelo WhatsApp: (85) 98530-1616',
  '📍 Visite nossa loja — R. Raimundo Neri, 372 · Fortaleza, CE',
  '⭐ 4,8 no Google · Loureiro Aquarismo · Especialistas em aquarismo!',
]

;(function () {
  if (!AVISO_ATIVO) return

  // ── CSS ──────────────────────────────────────
  const style = document.createElement('style')
  style.textContent = `

    /* ═══════════════════════════════════════════
       BANNER TOPO
    ═══════════════════════════════════════════ */
    #aviso-topo {
      width: 100%;
      background: linear-gradient(135deg, #071422 0%, #0D4F7C 40%, #0A2744 60%, #071422 100%);
      background-size: 300% 300%;
      animation: bgMove 8s ease infinite;
      border-bottom: 3px solid #C9A84C;
      position: relative;
      z-index: 1000;
      overflow: hidden;
      box-shadow: 0 4px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,0.15);
    }

    @keyframes bgMove {
      0%   { background-position: 0% 50%; }
      50%  { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    /* Brilho dourado nas bordas */
    #aviso-topo::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 1px;
      background: linear-gradient(90deg,
        transparent 0%,
        rgba(201,168,76,0.6) 30%,
        #C9A84C 50%,
        rgba(201,168,76,0.6) 70%,
        transparent 100%
      );
    }

    /* Linha superior com info rápida */
    .aviso-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 24px 6px;
      gap: 16px;
      flex-wrap: wrap;
      max-width: 1280px;
      margin: 0 auto;
    }

    .aviso-topbar__left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .aviso-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      background: rgba(201,168,76,0.15);
      border: 1px solid rgba(201,168,76,0.4);
      border-radius: 20px;
      font-family: 'Cinzel', serif;
      font-size: 11px;
      font-weight: 700;
      color: #C9A84C;
      letter-spacing: 1px;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .aviso-badge .dot {
      width: 6px;
      height: 6px;
      background: #C9A84C;
      border-radius: 50%;
      animation: piscaBadge 1.5s ease-in-out infinite;
    }

    @keyframes piscaBadge {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%       { opacity: 0.3; transform: scale(0.6); }
    }

    .aviso-topbar__right {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .aviso-btn-wpp {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 7px 16px;
      background: #25D366;
      color: white;
      border: none;
      border-radius: 8px;
      font-family: 'Lato', sans-serif;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      text-decoration: none;
      white-space: nowrap;
      transition: all 0.2s;
      box-shadow: 0 2px 12px rgba(37,211,102,0.35);
    }

    .aviso-btn-wpp:hover {
      background: #20bc5a;
      transform: translateY(-1px);
      box-shadow: 0 4px 18px rgba(37,211,102,0.5);
    }

    .aviso-fechar-btn {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
      color: rgba(255,255,255,0.4);
      width: 28px;
      height: 28px;
      border-radius: 50%;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      flex-shrink: 0;
      padding: 0;
      line-height: 1;
    }

    .aviso-fechar-btn:hover {
      background: rgba(255,255,255,0.12);
      color: white;
      border-color: rgba(255,255,255,0.3);
    }

    /* ── TICKER (texto correndo) ── */
    .aviso-ticker-wrap {
      position: relative;
      overflow: hidden;
      background: rgba(0,0,0,0.25);
      border-top: 1px solid rgba(201,168,76,0.12);
      padding: 8px 0;
      cursor: default;
    }

    /* Fade nas bordas */
    .aviso-ticker-wrap::before,
    .aviso-ticker-wrap::after {
      content: '';
      position: absolute;
      top: 0; bottom: 0;
      width: 80px;
      z-index: 2;
      pointer-events: none;
    }

    .aviso-ticker-wrap::before {
      left: 0;
      background: linear-gradient(to right, #071422, transparent);
    }

    .aviso-ticker-wrap::after {
      right: 0;
      background: linear-gradient(to left, #071422, transparent);
    }

    .aviso-ticker-track {
      display: flex;
      width: max-content;
      animation: ticker 40s linear infinite;
      gap: 0;
    }

    .aviso-ticker-track:hover {
      animation-play-state: paused;
    }

    @keyframes ticker {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }

    .aviso-ticker-item {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 0 32px;
      font-family: 'Lato', sans-serif;
      font-size: 13px;
      color: rgba(255,255,255,0.75);
      white-space: nowrap;
      letter-spacing: 0.3px;
    }

    .aviso-ticker-sep {
      color: rgba(201,168,76,0.5);
      font-size: 18px;
      line-height: 1;
      margin: 0 -16px;
    }

    /* ═══════════════════════════════════════════
       BANNER RODAPÉ
    ═══════════════════════════════════════════ */
    #aviso-rodape {
      width: 100%;
      background: linear-gradient(180deg, #050D1A 0%, #0A1A2E 100%);
      border-top: 2px solid rgba(201,168,76,0.3);
      border-bottom: 1px solid rgba(201,168,76,0.1);
      padding: 28px 24px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    #aviso-rodape::before {
      content: '';
      position: absolute;
      top: 0; left: 50%;
      transform: translateX(-50%);
      width: 200px;
      height: 1px;
      background: linear-gradient(90deg, transparent, #C9A84C, transparent);
    }

    .aviso-rodape__inner {
      max-width: 700px;
      margin: 0 auto;
      position: relative;
      z-index: 1;
    }

    .aviso-rodape__icones {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-bottom: 16px;
      font-size: 24px;
    }

    .aviso-rodape__icone {
      animation: flutuarRodape 3s ease-in-out infinite;
    }

    .aviso-rodape__icone:nth-child(2) { animation-delay: 0.4s; }
    .aviso-rodape__icone:nth-child(3) { animation-delay: 0.8s; }
    .aviso-rodape__icone:nth-child(4) { animation-delay: 1.2s; }
    .aviso-rodape__icone:nth-child(5) { animation-delay: 1.6s; }

    @keyframes flutuarRodape {
      0%, 100% { transform: translateY(0); }
      50%       { transform: translateY(-6px); }
    }

    .aviso-rodape__titulo {
      font-family: 'Cinzel', serif;
      font-size: clamp(16px, 2.5vw, 22px);
      color: #C9A84C;
      margin-bottom: 8px;
      letter-spacing: 0.5px;
    }

    .aviso-rodape__sub {
      font-family: 'Lato', sans-serif;
      font-size: 14px;
      color: rgba(255,255,255,0.5);
      margin-bottom: 20px;
      line-height: 1.6;
    }

    .aviso-rodape__btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 28px;
      background: #25D366;
      color: white;
      border: none;
      border-radius: 10px;
      font-family: 'Lato', sans-serif;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s;
      box-shadow: 0 4px 20px rgba(37,211,102,0.3);
    }

    .aviso-rodape__btn:hover {
      background: #20bc5a;
      transform: translateY(-2px);
      box-shadow: 0 8px 28px rgba(37,211,102,0.4);
    }

    /* Responsivo */
    @media (max-width: 600px) {
      .aviso-topbar { padding: 8px 16px 4px; }
      .aviso-btn-wpp span { display: none; }
      .aviso-btn-wpp::after { content: 'WhatsApp'; }
      .aviso-ticker-item { font-size: 12px; padding: 0 20px; }
    }
  `
  document.head.appendChild(style)

  // ── Montar HTML do TICKER ─────────────────────
  // Duplicar as frases para loop sem corte
  const todasFrases = [...TICKER_FRASES, ...TICKER_FRASES]
  const tickerItens = todasFrases.map((frase, i) => `
    <span class="aviso-ticker-item">${frase}</span>
    <span class="aviso-ticker-sep">✦</span>
  `).join('')

  // ── Banner TOPO ───────────────────────────────
  const bannerTopo = document.createElement('div')
  bannerTopo.id    = 'aviso-topo'
  bannerTopo.innerHTML = `
    <div class="aviso-topbar">
      <div class="aviso-topbar__left">
        <span class="aviso-badge">
          <span class="dot"></span>
          Em Construção
        </span>
      </div>
      <div class="aviso-topbar__right">
        <a href="https://wa.me/5585985301616?text=Olá!%20Vi%20o%20site%20e%20gostaria%20de%20ver%20os%20produtos%20disponíveis."
           target="_blank" rel="noopener" class="aviso-btn-wpp">
          💬 <span>Ver produtos no WhatsApp</span>
        </a>
        <button class="aviso-fechar-btn"
                onclick="fecharAvisoTopo()"
                title="Fechar">✕</button>
      </div>
    </div>

    <div class="aviso-ticker-wrap">
      <div class="aviso-ticker-track" id="ticker-track">
        ${tickerItens}
      </div>
    </div>
  `

  // ── Banner RODAPÉ ─────────────────────────────
  const bannerRodape = document.createElement('div')
  bannerRodape.id    = 'aviso-rodape'
  bannerRodape.innerHTML = `
    <div class="aviso-rodape__inner">
      <div class="aviso-rodape__icones">
        <span class="aviso-rodape__icone">🐠</span>
        <span class="aviso-rodape__icone">🪸</span>
        <span class="aviso-rodape__icone">🏠</span>
        <span class="aviso-rodape__icone">⚙️</span>
        <span class="aviso-rodape__icone">🍖</span>
      </div>
      <h3 class="aviso-rodape__titulo">
        🚧 Catálogo em construção — em breve tudo disponível aqui!
      </h3>
      <p class="aviso-rodape__sub">
        Estamos preparando os melhores peixes, corais e equipamentos.<br>
        Consulte nosso catálogo completo pelo WhatsApp enquanto finalizamos.
      </p>
      <a href="https://wa.me/5585985301616?text=Olá!%20Vi%20o%20site%20e%20gostaria%20de%20ver%20os%20produtos%20disponíveis."
         target="_blank" rel="noopener" class="aviso-rodape__btn">
        💬 Ver catálogo completo no WhatsApp
      </a>
    </div>
  `

  // ── Inserir no DOM ────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    // Topo: inserir após o header
    const header = document.querySelector('header') || document.getElementById('header')
    if (header) {
      header.insertAdjacentElement('afterend', bannerTopo)
    } else {
      document.body.prepend(bannerTopo)
    }

    // Rodapé: inserir ANTES do footer
    const footer = document.querySelector('footer') || document.getElementById('footer')
    if (footer) {
      footer.insertAdjacentElement('beforebegin', bannerRodape)
    } else {
      document.body.appendChild(bannerRodape)
    }
  })

  // ── Fechar banner topo ────────────────────────
  window.fecharAvisoTopo = function () {
    const el = document.getElementById('aviso-topo')
    if (!el) return
    el.style.transition  = 'max-height 0.4s ease, opacity 0.4s ease, padding 0.4s ease'
    el.style.overflow    = 'hidden'
    el.style.maxHeight   = el.offsetHeight + 'px'
    requestAnimationFrame(() => {
      el.style.maxHeight = '0'
      el.style.opacity   = '0'
    })
    setTimeout(() => el.remove(), 420)
    // Guardar por 24h
    localStorage.setItem('loureiro_aviso_fechou', Date.now().toString())
  }

  // Checar se fechou recentemente (24h)
  const fechouEm = localStorage.getItem('loureiro_aviso_fechou')
  if (fechouEm && Date.now() - parseInt(fechouEm) < 24 * 60 * 60 * 1000) {
    // Remover só o topo, manter rodapé
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        const t = document.getElementById('aviso-topo')
        if (t) t.remove()
      }, 100)
    })
  }

})()
