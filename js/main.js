/* ============================================
   LOUREIRO AQUARISMO — JavaScript Principal
   Vanilla ES6+ · Sem dependências externas
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ─────────────────────────────────────────────
     1. NAVBAR — Efeito de scroll + classe .scrolled
     ───────────────────────────────────────────── */
  const initNavbarScroll = () => {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    const SCROLL_THRESHOLD = 80;

    const onScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > SCROLL_THRESHOLD);
    };

    // Usar passive para melhor performance de scroll
    window.addEventListener('scroll', onScroll, { passive: true });
    // Estado inicial caso a página carregue já com scroll
    onScroll();
  };


  /* ─────────────────────────────────────────────
     2. MENU MOBILE — Hamburger ↔ X
     ───────────────────────────────────────────── */
  const initMobileMenu = () => {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    if (!hamburgerBtn || !mobileMenu) return;

    // Abre/fecha o menu
    const toggleMenu = (forceClose = false) => {
      const shouldClose = forceClose || mobileMenu.classList.contains('open');

      hamburgerBtn.classList.toggle('active', !shouldClose);
      mobileMenu.classList.toggle('open', !shouldClose);
      document.body.style.overflow = shouldClose ? '' : 'hidden';
    };

    hamburgerBtn.addEventListener('click', () => toggleMenu());

    // Fecha ao clicar em um link do menu
    mobileMenu.querySelectorAll('.mobile-menu__link').forEach(link => {
      link.addEventListener('click', () => toggleMenu(true));
    });

    // Fecha ao clicar fora do menu (no overlay)
    mobileMenu.addEventListener('click', (e) => {
      if (e.target === mobileMenu) toggleMenu(true);
    });

    // Fecha ao pressionar Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        toggleMenu(true);
      }
    });
  };


  /* ─────────────────────────────────────────────
     3. BUSCA — Toggle do campo de pesquisa
     ───────────────────────────────────────────── */
  const initSearch = () => {
    const navSearch = document.getElementById('navSearch');
    if (!navSearch) return;

    const searchBtn = navSearch.querySelector('.navbar__search-btn');
    const searchInput = navSearch.querySelector('.navbar__search-input');
    if (!searchBtn || !searchInput) return;

    searchBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navSearch.classList.toggle('active');
      if (navSearch.classList.contains('active')) {
        searchInput.focus();
      }
    });

    // Fecha ao clicar fora
    document.addEventListener('click', (e) => {
      if (!navSearch.contains(e.target)) {
        navSearch.classList.remove('active');
      }
    });

    // Fecha ao pressionar Escape
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        navSearch.classList.remove('active');
        searchBtn.focus();
      }
    });
  };


  /* ─────────────────────────────────────────────
     4. SCROLL SUAVE — Links internos (#âncoras)
     ───────────────────────────────────────────── */
  const initSmoothScroll = () => {
    const HEADER_OFFSET = 70;

    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      const targetId = link.getAttribute('href');
      if (targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      e.preventDefault();

      const targetPosition = targetEl.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    });
  };


  /* ─────────────────────────────────────────────
     5. ANIMAÇÕES DE ENTRADA — IntersectionObserver
     Observa: .animate-on-scroll e seletores específicos
     ───────────────────────────────────────────── */
  const initScrollReveal = () => {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    // Seletores de todos os elementos animáveis
    const selectors = [
      '.categorias__card',
      '.destaques__card',
      '.sobre__stat-card',
      '.animate-fade-up',
      '.animate-fade-left',
      '.animate-fade-right',
      '.animate-on-scroll'
    ];

    document.querySelectorAll(selectors.join(', ')).forEach(el => {
      revealObserver.observe(el);
    });
  };


  /* ─────────────────────────────────────────────
     6. LINK ATIVO — Destaque no navbar conforme scroll
     ───────────────────────────────────────────── */
  const initActiveLink = () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.navbar__link');
    if (!sections.length || !navLinks.length) return;

    const OFFSET = 150;

    const updateActiveLink = () => {
      let current = '';

      sections.forEach(section => {
        const top = section.offsetTop - OFFSET;
        const bottom = top + section.offsetHeight;

        if (window.scrollY >= top && window.scrollY < bottom) {
          current = section.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === '#' + current) {
          link.classList.add('active');
        }
      });
    };

    window.addEventListener('scroll', updateActiveLink, { passive: true });
    updateActiveLink();
  };


  /* ─────────────────────────────────────────────
     7. FILTRO DE PRODUTOS — Tabs de categorias
     ───────────────────────────────────────────── */
  const initProductFilter = () => {
    const tabs = document.querySelectorAll('.destaques__tab');
    const prodCards = document.querySelectorAll('.destaques__card');
    if (!tabs.length || !prodCards.length) return;

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Atualizar tab ativa
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const filter = tab.dataset.filter;

        // Primeiro: esconder todos com fadeOut
        prodCards.forEach(card => card.classList.add('filtering'));

        // Após transição: mostrar/esconder e animar entrada escalonada
        setTimeout(() => {
          let visibleIndex = 0;

          prodCards.forEach(card => {
            const match = filter === 'todos' || card.dataset.cat === filter;

            if (match) {
              card.classList.remove('hidden');
              card.classList.remove('filtering');
              // Re-disparar animação de entrada com delay escalonado
              card.classList.remove('visible');
              card.style.animationDelay = `${visibleIndex * 0.08}s`;
              void card.offsetWidth; // forçar reflow
              card.classList.add('visible');
              visibleIndex++;
            } else {
              card.classList.add('hidden');
              card.classList.remove('filtering');
            }
          });
        }, 250);
      });
    });
  };


  /* ─────────────────────────────────────────────
     8. FAVORITAR — Botão de coração nos produtos
     ───────────────────────────────────────────── */
  const initFavorites = () => {
    document.querySelectorAll('.destaques__fav').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        btn.classList.toggle('liked');
      });
    });
  };


  /* ─────────────────────────────────────────────
     9. CONTAGEM ANIMADA — Estatísticas da seção Sobre
     Easing quadrático suave com requestAnimationFrame
     ───────────────────────────────────────────── */
  const initCounters = () => {
    const counters = document.querySelectorAll('.sobre__stat-number[data-target]');
    if (!counters.length) return;

    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;

          const el = entry.target;
          const target = parseFloat(el.dataset.target);
          if (!target && target !== 0) return;

          const isDecimal = el.dataset.decimal === 'true';
          const prefix = el.dataset.prefix || '';
          const duration = isDecimal ? 1500 : 2000;
          const startTime = performance.now();

          const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing quadrático suave (ease-out quad)
            const ease = 1 - (1 - progress) * (1 - progress);
            const current = ease * target;

            if (isDecimal) {
              el.textContent = prefix + current.toFixed(1).replace('.', ',');
            } else {
              el.textContent = prefix + Math.floor(current).toLocaleString('pt-BR');
            }

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };

          requestAnimationFrame(animate);
          counterObserver.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(el => counterObserver.observe(el));
  };


  /* ─────────────────────────────────────────────
     10. CARROSSEL DE AVALIAÇÕES
         Auto-play + Navegação + Dots + Touch/Swipe
     ───────────────────────────────────────────── */
  const initCarousel = () => {
    const carousel = document.getElementById('avaliacoesCarousel');
    const prevBtn = document.querySelector('.avaliacoes__nav-btn--prev');
    const nextBtn = document.querySelector('.avaliacoes__nav-btn--next');
    if (!carousel) return;

    const cards = carousel.querySelectorAll('.avaliacoes__card');
    if (!cards.length) return;

    // Calcular largura de scroll (card + gap)
    const getScrollAmount = () => {
      const style = getComputedStyle(carousel);
      const gap = parseFloat(style.gap) || 24;
      return cards[0].offsetWidth + gap;
    };

    // Navegar para direção
    const scrollTo = (direction) => {
      const amount = getScrollAmount();
      carousel.scrollBy({ left: direction * amount, behavior: 'smooth' });
    };

    // Botões de navegação
    if (prevBtn) prevBtn.addEventListener('click', () => scrollTo(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => scrollTo(1));

    // ── Auto-play a cada 4 segundos ──
    let autoPlayTimer = null;

    const startAutoPlay = () => {
      stopAutoPlay();
      autoPlayTimer = setInterval(() => {
        const maxScroll = carousel.scrollWidth - carousel.clientWidth;
        // Se chegou ao fim, volta ao início
        if (carousel.scrollLeft >= maxScroll - 10) {
          carousel.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollTo(1);
        }
      }, 4000);
    };

    const stopAutoPlay = () => {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
      }
    };

    // Pausar auto-play ao interagir, retomar após 8s
    let resumeTimer = null;
    const pauseAndResume = () => {
      stopAutoPlay();
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(startAutoPlay, 8000);
    };

    carousel.addEventListener('mouseenter', stopAutoPlay);
    carousel.addEventListener('mouseleave', () => {
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(startAutoPlay, 2000);
    });

    // ── Touch / Swipe para mobile ──
    let touchStartX = 0;
    let touchEndX = 0;
    let isSwiping = false;

    carousel.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      isSwiping = true;
      pauseAndResume();
    }, { passive: true });

    carousel.addEventListener('touchmove', (e) => {
      touchEndX = e.changedTouches[0].screenX;
    }, { passive: true });

    carousel.addEventListener('touchend', () => {
      if (!isSwiping) return;
      isSwiping = false;

      const diff = touchStartX - touchEndX;
      const MIN_SWIPE = 50;

      if (Math.abs(diff) > MIN_SWIPE) {
        scrollTo(diff > 0 ? 1 : -1);
      }
    });

    // ── Indicadores (Dots) ──
    const createDots = () => {
      const wrapper = carousel.closest('.avaliacoes__carousel-wrapper');
      if (!wrapper) return;

      const dotsContainer = document.createElement('div');
      dotsContainer.className = 'avaliacoes__dots';
      dotsContainer.setAttribute('aria-label', 'Indicadores do carrossel');

      cards.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'avaliacoes__dot';
        dot.setAttribute('aria-label', `Ir para avaliação ${i + 1}`);
        if (i === 0) dot.classList.add('active');

        dot.addEventListener('click', () => {
          pauseAndResume();
          carousel.scrollTo({
            left: i * getScrollAmount(),
            behavior: 'smooth'
          });
        });

        dotsContainer.appendChild(dot);
      });

      wrapper.appendChild(dotsContainer);
    };

    // Atualizar dot ativo conforme scroll
    const updateDots = () => {
      const dots = document.querySelectorAll('.avaliacoes__dot');
      if (!dots.length) return;

      const scrollAmount = getScrollAmount();
      const activeIndex = Math.round(carousel.scrollLeft / scrollAmount);

      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === activeIndex);
      });
    };

    carousel.addEventListener('scroll', updateDots, { passive: true });

    createDots();
    startAutoPlay();
  };


  /* ─────────────────────────────────────────────
     11. FORMULÁRIO DE CONTATO → WHATSAPP
     ───────────────────────────────────────────── */
  const initContactForm = () => {
    const form = document.getElementById('contatoForm');
    if (!form) return;

    // ── Máscara de telefone: (00) 00000-0000 ──
    const phoneInput = document.getElementById('contatoTelefone');
    if (phoneInput) {
      phoneInput.addEventListener('input', () => {
        let v = phoneInput.value.replace(/\D/g, '');
        if (v.length > 11) v = v.slice(0, 11);

        if (v.length > 6) {
          v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
        } else if (v.length > 2) {
          v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
        } else if (v.length > 0) {
          v = `(${v}`;
        }

        phoneInput.value = v;
      });
    }

    // ── Feedback visual de validação ──
    const markInvalid = (input) => {
      input.classList.add('contato__input--error');
      input.addEventListener('input', () => {
        input.classList.remove('contato__input--error');
      }, { once: true });
    };

    // ── Submit → WhatsApp ──
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nome = document.getElementById('contatoNome');
      const email = document.getElementById('contatoEmail');
      const telefone = document.getElementById('contatoTelefone');
      const assunto = document.getElementById('contatoAssunto');
      const mensagem = document.getElementById('contatoMensagem');

      // Validação com feedback visual
      let valid = true;

      if (!nome.value.trim()) { markInvalid(nome); valid = false; }
      if (!telefone.value.trim()) { markInvalid(telefone); valid = false; }
      if (!mensagem.value.trim()) { markInvalid(mensagem); valid = false; }

      if (!valid) return;

      // Montar mensagem formatada
      let texto = `Olá! Vim pelo site do Loureiro Aquarismo.\n\n`;
      texto += `*Nome:* ${nome.value.trim()}\n`;
      if (email.value.trim()) texto += `*E-mail:* ${email.value.trim()}\n`;
      texto += `*Telefone:* ${telefone.value.trim()}\n`;
      texto += `*Assunto:* ${assunto.value}\n`;
      texto += `*Mensagem:* ${mensagem.value.trim()}`;

      const url = `https://wa.me/5585985301616?text=${encodeURIComponent(texto)}`;
      window.open(url, '_blank');
    });
  };


  /* ─────────────────────────────────────────────
     12. BOTÃO FLUTUANTE — WhatsApp
     ───────────────────────────────────────────── */
  const initWhatsAppFloat = () => {
    // Prevenir duplicata
    if (document.getElementById('whatsapp-float')) return;

    // Injetar estilos inline para funcionar em qualquer pagina
    // (independente de qual CSS esta carregado)
    if (!document.getElementById('wpp-float-styles')) {
      const style = document.createElement('style');
      style.id = 'wpp-float-styles';
      style.textContent = `
        #whatsapp-float {
          position: fixed !important;
          bottom: 24px !important;
          right: 24px !important;
          z-index: 9999 !important;
          display: flex !important;
          align-items: center !important;
          gap: 0 !important;
          opacity: 0;
          transform: translateX(100px);
          animation: wppFloatIn 0.6s ease 2s forwards;
        }
        @keyframes wppFloatIn {
          to { opacity: 1; transform: translateX(0); }
        }
        #whatsapp-float__link {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 60px !important;
          height: 60px !important;
          border-radius: 50% !important;
          background-color: #25D366 !important;
          border: none !important;
          cursor: pointer !important;
          box-shadow: 0 4px 16px rgba(37,211,102,0.4) !important;
          text-decoration: none !important;
          position: relative !important;
          transition: transform 0.2s, box-shadow 0.2s;
          animation: wppFloatPulse 2.5s ease-in-out 2.6s infinite;
        }
        #whatsapp-float__link svg {
          width: 32px !important;
          height: 32px !important;
          fill: #FFFFFF !important;
        }
        #whatsapp-float__link:hover {
          transform: scale(1.1) !important;
          box-shadow: 0 6px 24px rgba(37,211,102,0.5) !important;
          animation: none !important;
        }
        @keyframes wppFloatPulse {
          0%, 100% { box-shadow: 0 4px 16px rgba(37,211,102,0.4); }
          50% { box-shadow: 0 4px 28px rgba(37,211,102,0.6), 0 0 0 10px rgba(37,211,102,0.08); }
        }
        #whatsapp-float__tip {
          position: absolute;
          right: calc(100% + 14px);
          top: 50%;
          transform: translateY(-50%);
          white-space: nowrap;
          padding: 8px 16px;
          background: #0A1A2E;
          color: #FFFFFF;
          font-family: 'Lato', sans-serif;
          font-size: 0.82rem;
          font-weight: 700;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s;
        }
        #whatsapp-float__tip::after {
          content: '';
          position: absolute;
          right: -6px;
          top: 50%;
          transform: translateY(-50%);
          border-left: 6px solid #0A1A2E;
          border-top: 6px solid transparent;
          border-bottom: 6px solid transparent;
        }
        #whatsapp-float:hover #whatsapp-float__tip { opacity: 1; }
        @media (max-width: 768px) {
          #whatsapp-float { bottom: 20px !important; right: 20px !important; }
          #whatsapp-float__link { width: 54px !important; height: 54px !important; }
          #whatsapp-float__link svg { width: 28px !important; height: 28px !important; }
        }
        @media (max-width: 480px) {
          #whatsapp-float { bottom: 16px !important; right: 16px !important; }
          #whatsapp-float__tip { display: none !important; }
        }
      `;
      document.head.appendChild(style);
    }

    const wrapper = document.createElement('div');
    wrapper.id = 'whatsapp-float';
    wrapper.innerHTML = `
      <a id="whatsapp-float__link"
         href="https://wa.me/5585985301616?text=Olá!%20Vim%20pelo%20site%20e%20gostaria%20de%20mais%20informações."
         target="_blank" rel="noopener"
         aria-label="Falar no WhatsApp">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.05 21.785h-.009a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.981.998-3.648-.235-.374A9.86 9.86 0 0 1 2.16 12.01C2.16 6.576 6.582 2.16 12.06 2.16a9.84 9.84 0 0 1 6.982 2.898 9.825 9.825 0 0 1 2.893 6.994c-.003 5.434-4.426 9.853-9.885 9.853z"/>
        </svg>
      </a>
      <span id="whatsapp-float__tip">Falar no WhatsApp</span>
    `;
    document.body.appendChild(wrapper);
  };


  /* ─────────────────────────────────────────────
     13. LAZY LOADING — Imagens com data-src
     ───────────────────────────────────────────── */
  const initLazyLoad = () => {
    const lazyImages = document.querySelectorAll('img[data-src]');
    if (!lazyImages.length) return;

    const imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;

          const img = entry.target;
          img.src = img.dataset.src;

          // Carregar srcset se existir
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
          }

          img.removeAttribute('data-src');
          img.removeAttribute('data-srcset');
          img.classList.add('loaded');
          imageObserver.unobserve(img);
        });
      },
      {
        rootMargin: '200px 0px', // Começar a carregar 200px antes de entrar na viewport
        threshold: 0
      }
    );

    lazyImages.forEach(img => imageObserver.observe(img));
  };


  /* ─────────────────────────────────────────────
     14. DESTAQUES DINÂMICOS — Renderiza do Supabase
     ───────────────────────────────────────────── */
  const initDestaques = async () => {
    if (typeof produtosDB === 'undefined') return;

    const grid = document.getElementById('destaquesGrid');
    if (!grid) return;

    // Loading state
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px;color:rgba(255,255,255,0.5);">
        <div style="width:36px;height:36px;border:3px solid rgba(26,143,191,0.3);border-top-color:#1A8FBF;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 16px;"></div>
        <p style="font-family:'Lato',sans-serif;">Carregando produtos...</p>
      </div>`;

    const destaques = await produtosDB.getDestaques();

    const catMap = {
      'agua-doce': { nome: 'Peixe de Água Doce', css: 'peixe', icone: '🐠' },
      'marinho': { nome: 'Marinho', css: 'marinho', icone: '🪸' },
      'aquarios': { nome: 'Aquário', css: 'peixe', icone: '🏠' },
      'equipamentos': { nome: 'Equipamento', css: 'equipamento', icone: '⚙️' },
      'racoes': { nome: 'Ração', css: 'racao', icone: '🍖' },
      'manutencao': { nome: 'Manutenção', css: 'peixe', icone: '💧' }
    };

    if (!destaques.length) {
      grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px;color:rgba(255,255,255,0.4);font-family:'Lato',sans-serif;font-size:18px;"><span style="font-size:48px;display:block;margin-bottom:12px;">🐠</span>Em breve novos produtos!</div>`;
      return;
    }

    grid.innerHTML = destaques.map(p => {
      const cat = catMap[p.categoria] || catMap['agua-doce'];
      const precoFinal = p.preco_promo || p.preco;
      const precoStr = Number(precoFinal).toFixed(2).replace('.', ',');
      const precoPartes = precoStr.split(',');
      const imgSrc = (p.imagens && p.imagens[0]) ? p.imagens[0] : p.imagem_url;
      const produtoUrl = '/produto?id=' + encodeURIComponent(p.id);

      return `
        <a href="${produtoUrl}" class="destaques__card visible" data-cat="${cat.css}" data-id="${p.id}" style="cursor:pointer;text-decoration:none;color:inherit">
          <div class="destaques__img destaques__img--${cat.css}">
            ${p.preco_promo ? '<span class="destaques__badge destaques__badge--promo">Promoção</span>' : ''}
            <button class="destaques__fav" aria-label="Favoritar">
              <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
            ${imgSrc ? `<img src="${imgSrc}" alt="${p.nome}" style="width:100%;height:100%;object-fit:cover">` : cat.icone}
          </div>
          <div class="destaques__body">
            <span class="destaques__category">${cat.nome}</span>
            <h3 class="destaques__name">${p.nome}</h3>
            ${p.preco_promo ? `<span class="destaques__price" style="font-size:0.85rem;color:rgba(255,255,255,0.4);text-decoration:line-through">R$ ${Number(p.preco).toFixed(2).replace('.',',')}</span>` : ''}
            <span class="destaques__price">R$ ${precoPartes[0]}<span class="destaques__price-cents">,${precoPartes[1]}</span></span>
            <span class="destaques__whatsapp" onclick="event.preventDefault();event.stopPropagation();window.open('https://wa.me/5585985301616?text=${encodeURIComponent(`Olá! Tenho interesse no ${p.nome} (R$${precoStr})`)}','_blank')">
              <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
              Consultar no WhatsApp
            </span>
          </div>
        </a>
      `;
    }).join('');

    // Re-registrar favoritar nos novos cards
    grid.querySelectorAll('.destaques__fav').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        btn.classList.toggle('liked');
      });
    });
  };


  /* ─────────────────────────────────────────────
     INICIALIZAÇÃO — Chamar todas as funções
     ───────────────────────────────────────────── */
  initNavbarScroll();
  initMobileMenu();
  initSearch();
  initSmoothScroll();
  initScrollReveal();
  initActiveLink();
  initDestaques();
  initProductFilter();
  initFavorites();
  initCounters();
  initCarousel();
  initContactForm();
  initWhatsAppFloat();
  initLazyLoad();

});


/* ============================================
   HERO SLIDESHOW — Peixes Exóticos
   ============================================ */
(function() {
  let slideAtual = 0;
  let totalSlides = 0;
  let autoplayTimer = null;
  let pausado = false;

  function iniciarSlideshow() {
    const slides = document.querySelectorAll('.hero-slide');
    totalSlides = slides.length;
    if (totalSlides === 0) return;

    const wrap = document.querySelector('.hero-slideshow-wrap');
    if (wrap) {
      wrap.addEventListener('mouseenter', () => { pausado = true; });
      wrap.addEventListener('mouseleave', () => { pausado = false; });
    }

    iniciarAutoplay();
  }

  function irParaSlide(index) {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.slideshow-dots .dot');

    slides.forEach(s => s.classList.remove('ativo'));
    dots.forEach(d => d.classList.remove('ativo'));

    slideAtual = ((index % totalSlides) + totalSlides) % totalSlides;
    slides[slideAtual].classList.add('ativo');
    if (dots[slideAtual]) dots[slideAtual].classList.add('ativo');

    reiniciarAutoplay();
  }

  function slideProximo() { irParaSlide(slideAtual + 1); }
  function slideAnterior() { irParaSlide(slideAtual - 1); }

  function iniciarAutoplay() {
    autoplayTimer = setInterval(() => {
      if (!pausado) irParaSlide(slideAtual + 1);
    }, 4500);
  }

  function reiniciarAutoplay() {
    clearInterval(autoplayTimer);
    iniciarAutoplay();
  }

  function adicionarSwipe() {
    const wrap = document.querySelector('.hero-slideshow-wrap');
    if (!wrap) return;
    let startX = 0;

    wrap.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    }, { passive: true });

    wrap.addEventListener('touchend', (e) => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? slideProximo() : slideAnterior();
      }
    }, { passive: true });
  }

  // Expor globalmente para os botões onclick
  window.irParaSlide = irParaSlide;
  window.slideProximo = slideProximo;
  window.slideAnterior = slideAnterior;

  document.addEventListener('DOMContentLoaded', () => {
    iniciarSlideshow();
    adicionarSwipe();
  });
})();
