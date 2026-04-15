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
  // INFINITEPAY — Geração de link de pagamento
  // ================================================
  INFINITE_TAG: 'loureiro_pet_ltda',

  gerarLinkPagamento: async function(dadosPedido) {
    var itens = this.getItens();

    if (!itens || itens.length === 0) {
      throw new Error('Carrinho vazio');
    }

    var itensPagamento = itens.map(function(item) {
      return {
        quantity:    item.quantidade,
        price:       Math.round(Number(item.preco) * 100),
        description: String(item.nome).substring(0, 100)
      };
    });

    var orderNsu = 'loureiro-' + Date.now();

    var payload = {
      handle:       this.INFINITE_TAG,
      order_nsu:    orderNsu,
      itens:        itensPagamento,
      redirect_url: window.location.origin + '/pedido-confirmado'
    };

    console.log('[InfinitePay] Enviando payload:', JSON.stringify(payload, null, 2));

    var response = await fetch(
      'https://api.infinitepay.io/invoices/public/checkout/links',
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload)
      }
    );

    var responseText = await response.text();
    console.log('[InfinitePay] Resposta raw:', responseText);

    if (!response.ok) {
      console.error('[InfinitePay] Erro HTTP:', response.status, responseText);
      throw new Error('Erro ' + response.status + ': ' + responseText);
    }

    var data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      throw new Error('Resposta inválida da InfinitePay: ' + responseText);
    }

    console.log('[InfinitePay] Link gerado:', data);

    if (!data.link) {
      throw new Error('InfinitePay não retornou link de pagamento: ' + responseText);
    }

    localStorage.setItem('loureiro_order_nsu', orderNsu);
    localStorage.setItem('loureiro_pedido_dados', JSON.stringify(Object.assign({}, dadosPedido, {
      itens:     itens,
      total:     this.getTotalValor(),
      orderNsu:  orderNsu,
      timestamp: new Date().toISOString()
    })));

    return data.link;
  },

  // ================================================
  // INFINITEPAY — Verificar status do pagamento
  // ================================================
  verificarPagamento: async function(orderNsu, transactionNsu, slug) {
    try {
      var response = await fetch(
        'https://api.infinitepay.io/invoices/public/checkout/payment_check',
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            handle:          this.INFINITE_TAG,
            order_nsu:       orderNsu,
            transaction_nsu: transactionNsu,
            slug:            slug
          })
        }
      );

      if (!response.ok) return null;
      return await response.json();
    } catch (e) {
      console.error('[InfinitePay] Erro ao verificar pagamento:', e);
      return null;
    }
  }
};
