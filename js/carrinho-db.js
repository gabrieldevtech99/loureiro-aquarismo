// js/carrinho-db.js — Gerenciamento do carrinho via localStorage
// Loureiro Aquarismo

var carrinhoDB = {

  getItens: function() {
    try { return JSON.parse(localStorage.getItem('loureiro_carrinho') || '[]'); }
    catch(e) { return []; }
  },

  getTotalItens: function() {
    return this.getItens().reduce(function(acc, i) { return acc + i.quantidade; }, 0);
  },

  getTotalValor: function() {
    return this.getItens().reduce(function(acc, i) { return acc + (i.preco * i.quantidade); }, 0);
  },

  adicionarItem: function(produto, quantidade) {
    if (!quantidade) quantidade = 1;
    var itens = this.getItens();
    var idx = -1;
    for (var j = 0; j < itens.length; j++) { if (itens[j].id === produto.id) { idx = j; break; } }
    if (idx >= 0) {
      itens[idx].quantidade += quantidade;
    } else {
      itens.push({
        id:            produto.id,
        nome:          produto.nome,
        preco:         Number(produto.preco_promo || produto.preco),
        precoOriginal: Number(produto.preco),
        imagem:        (produto.imagens && produto.imagens[0]) || produto.imagem_url || null,
        categoria:     produto.categoria,
        quantidade:    quantidade
      });
    }
    this._salvar(itens);
    this._atualizarContador();
  },

  removerItem: function(id) {
    var itens = this.getItens().filter(function(i) { return i.id !== id; });
    this._salvar(itens);
    this._atualizarContador();
  },

  alterarQuantidade: function(id, quantidade) {
    if (quantidade <= 0) { this.removerItem(id); return; }
    var itens = this.getItens().map(function(i) {
      return i.id === id ? Object.assign({}, i, { quantidade: quantidade }) : i;
    });
    this._salvar(itens);
    this._atualizarContador();
  },

  estaNoCarrinho: function(id) {
    return this.getItens().some(function(i) { return i.id === id; });
  },

  limpar: function() {
    localStorage.removeItem('loureiro_carrinho');
    this._atualizarContador();
  },

  fmt: function(valor) {
    return Number(valor || 0).toFixed(2).replace('.', ',');
  },

  _salvar: function(itens) {
    localStorage.setItem('loureiro_carrinho', JSON.stringify(itens));
  },

  _atualizarContador: function() {
    var total = this.getTotalItens();
    var badges = document.querySelectorAll('.carrinho-badge');
    badges.forEach(function(badge) {
      badge.textContent = total > 99 ? '99+' : total;
      badge.style.display = total > 0 ? 'flex' : 'none';
    });
  },

  // ================================================
  // INFINITEPAY — Via proxy Supabase Edge Function
  // ================================================
  PROXY_URL: 'https://imdrcbypudczfybkvhtx.supabase.co/functions/v1/infinitepay-proxy',
  INFINITE_TAG: 'loureiro_pet_ltd',

  gerarLinkPagamento: async function(dadosPedido) {
    var itens = this.getItens();

    if (!itens || itens.length === 0) {
      throw new Error('Carrinho vazio');
    }

    var itensPagamento = itens.map(function(item) {
      return {
        quantity:    Math.max(1, parseInt(item.quantidade) || 1),
        price:       Math.round(Number(item.preco) * 100),
        description: String(item.nome).substring(0, 100).replace(/[^\w\s\-\.]/g, '')
      };
    });

    var precoInvalido = itensPagamento.find(function(i) { return !i.price || i.price <= 0; });
    if (precoInvalido) {
      throw new Error('Preco invalido no carrinho: ' + JSON.stringify(precoInvalido));
    }

    var orderNsu = 'loureiro-' + Date.now();

    var payload = {
      handle:       this.INFINITE_TAG,
      order_nsu:    orderNsu,
      items:        itensPagamento,
      redirect_url: window.location.origin + '/pedido-confirmado'
    };

    console.log('[InfinitePay] Enviando via proxy:', JSON.stringify(payload, null, 2));

    var response = await fetch(this.PROXY_URL, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
      },
      body:    JSON.stringify({ action: 'gerar_link', payload: payload })
    });

    var responseText = await response.text();
    console.log('[InfinitePay] Resposta proxy:', response.status, responseText);

    if (!response.ok) {
      throw new Error('Proxy retornou erro ' + response.status + ': ' + responseText);
    }

    var data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      throw new Error('Resposta invalida do proxy: ' + responseText);
    }

    var paymentUrl = data.url || data.link;
    if (!paymentUrl) {
      throw new Error('Link nao retornado: ' + JSON.stringify(data));
    }

    localStorage.setItem('loureiro_order_nsu', orderNsu);
    localStorage.setItem('loureiro_pedido_dados', JSON.stringify(Object.assign({}, dadosPedido, {
      itens:     itens,
      total:     this.getTotalValor(),
      orderNsu:  orderNsu,
      timestamp: new Date().toISOString()
    })));

    return paymentUrl;
  },

  // ================================================
  // INFINITEPAY — Verificar status do pagamento
  // ================================================
  verificarPagamento: async function(orderNsu, transactionNsu, slug) {
    try {
      var response = await fetch(this.PROXY_URL, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
        },
        body:    JSON.stringify({
          action: 'verificar_pagamento',
          payload: {
            handle:          this.INFINITE_TAG,
            order_nsu:       orderNsu,
            transaction_nsu: transactionNsu,
            slug:            slug
          }
        })
      });

      if (!response.ok) return null;
      return await response.json();
    } catch (e) {
      console.error('[InfinitePay] Erro ao verificar pagamento:', e);
      return null;
    }
  }
};
