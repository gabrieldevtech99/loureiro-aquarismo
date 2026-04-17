// ============================================
// js/aviso-construcao.js
// Banner "Em Construção" — Loureiro Aquarismo
// Para ATIVAR:  AVISO_ATIVO = true
// Para REMOVER: AVISO_ATIVO = false
// ============================================

const AVISO_ATIVO = true  // ← mudar para false quando o catálogo estiver pronto

const AVISO_CONFIG = {
  mensagem:   'Estamos montando nosso catálogo! Em breve todos os produtos disponíveis aqui. 🐠',
  submensagem:'Enquanto isso, consulte pelo WhatsApp ou visite nossa loja em Fortaleza.',
  botaoTexto: '💬 Ver produtos no WhatsApp',
  botaoLink:  'https://wa.me/5585985301616?text=Olá!%20Vi%20o%20site%20e%20gostaria%20de%20ver%20os%20produtos%20disponíveis.',
  dispensavel: true,  // true = mostra botão de fechar (X)
}

;(function () {
  if (!AVISO_ATIVO) return

  // Não mostrar novamente se o usuário fechou recentemente (24h)
  if (AVISO_CONFIG.dispensavel) {
    const fechouEm = localStorage.getItem('loureiro_aviso_fechou')
    if (fechouEm && Date.now() - parseInt(fechouEm) < 24 * 60 * 60 * 1000) return
  }

  const style = document.createElement('style')
  style.textContent = `
    #aviso-construcao {
      position: relative;
      width: 100%;
      background: linear-gradient(135deg, #0A1A2E 0%, #0D4F7C 50%, #0A1A2E 100%);
      background-size: 200% 200%;
      animation: gradientShift 6s ease infinite;
      border-bottom: 2px solid #C9A84C;
      padding: 14px 20px;
      z-index: 999;
      box-shadow: 0 4px 24px rgba(0,0,0,0.4);
      overflow: hidden;
    }

    @keyframes gradientShift {
      0%   { background-position: 0% 50%; }
      50%  { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    /* Bolhas decorativas */
    #aviso-construcao::before {
      content: '🐠 🪸 🐟 🌊 🐠 🪸 🐟 🌊 🐠 🪸 🐟 🌊';
      position: absolute;
      top: -8px;
      left: 0;
      right: 0;
      font-size: 14px;
      opacity: 0.08;
      letter-spacing: 20px;
      white-space: nowrap;
      overflow: hidden;
    }

    .aviso-inner {
      max-width: 1280px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
      justify-content: center;
      position: relative;
    }

    .aviso-icone {
      font-size: 28px;
      animation: balancar 2s ease-in-out infinite;
      flex-shrink: 0;
    }

    @keyframes balancar {
      0%, 100% { transform: rotate(-8deg); }
      50%       { transform: rotate(8deg); }
    }

    .aviso-textos {
      flex: 1;
      min-width: 200px;
      text-align: center;
    }

    .aviso-titulo {
      font-family: 'Cinzel', serif;
      font-size: 15px;
      font-weight: 700;
      color: #C9A84C;
      margin: 0 0 3px;
      letter-spacing: 0.5px;
    }

    .aviso-sub {
      font-family: 'Lato', sans-serif;
      font-size: 13px;
      color: rgba(255,255,255,0.65);
      margin: 0;
      line-height: 1.4;
    }

    .aviso-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 9px 18px;
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
      flex-shrink: 0;
      box-shadow: 0 2px 12px rgba(37,211,102,0.3);
    }

    .aviso-btn:hover {
      background: #20bc5a;
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(37,211,102,0.4);
    }

    .aviso-fechar {
      position: absolute;
      top: 50%;
      right: 0;
      transform: translateY(-50%);
      background: transparent;
      border: 1px solid rgba(255,255,255,0.15);
      color: rgba(255,255,255,0.4);
      width: 28px;
      height: 28px;
      border-radius: 50%;
      font-size: 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      flex-shrink: 0;
      line-height: 1;
      padding: 0;
    }

    .aviso-fechar:hover {
      background: rgba(255,255,255,0.1);
      color: white;
      border-color: rgba(255,255,255,0.3);
    }

    /* Barra de progresso decorativa */
    .aviso-progresso {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 2px;
      background: linear-gradient(90deg, #C9A84C, #E8C96A, #C9A84C);
      background-size: 200% 100%;
      animation: progressoShine 2s linear infinite;
      width: 100%;
      opacity: 0.6;
    }

    @keyframes progressoShine {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    @media (max-width: 600px) {
      #aviso-construcao { padding: 12px 16px; }
      .aviso-titulo { font-size: 13px; }
      .aviso-sub    { font-size: 12px; }
      .aviso-btn    { font-size: 12px; padding: 8px 14px; }
      .aviso-fechar { right: 0; }
    }
  `
  document.head.appendChild(style)

  const banner = document.createElement('div')
  banner.id    = 'aviso-construcao'
  banner.innerHTML = `
    <div class="aviso-inner">
      <span class="aviso-icone">🚧</span>

      <div class="aviso-textos">
        <p class="aviso-titulo">${AVISO_CONFIG.mensagem}</p>
        <p class="aviso-sub">${AVISO_CONFIG.submensagem}</p>
      </div>

      <a href="${AVISO_CONFIG.botaoLink}"
         target="_blank"
         rel="noopener"
         class="aviso-btn">
        ${AVISO_CONFIG.botaoTexto}
      </a>

      ${AVISO_CONFIG.dispensavel ? `
        <button class="aviso-fechar"
                onclick="fecharAviso()"
                title="Fechar aviso">✕</button>
      ` : ''}

      <div class="aviso-progresso"></div>
    </div>
  `

  // Inserir logo após o header
  document.addEventListener('DOMContentLoaded', function () {
    const header = document.querySelector('header') || document.querySelector('#header')
    if (header && header.nextSibling) {
      header.parentNode.insertBefore(banner, header.nextSibling)
    } else {
      document.body.insertBefore(banner, document.body.firstChild)
    }
  })

  // Função para fechar o banner
  window.fecharAviso = function () {
    const el = document.getElementById('aviso-construcao')
    if (el) {
      el.style.transition = 'all 0.4s ease'
      el.style.maxHeight  = el.offsetHeight + 'px'
      requestAnimationFrame(() => {
        el.style.maxHeight  = '0'
        el.style.padding    = '0'
        el.style.opacity    = '0'
        el.style.overflow   = 'hidden'
      })
      setTimeout(() => el.remove(), 400)
    }
    if (AVISO_CONFIG.dispensavel) {
      localStorage.setItem('loureiro_aviso_fechou', Date.now().toString())
    }
  }
})()
