// js/pedidos-db.js — Gerenciamento de pedidos (Supabase)
// Loureiro Aquarismo

const pedidosDB = {

  async criar(pedido) {
    const registro = {
      order_nsu:        pedido.orderNsu || pedido.order_nsu,
      cliente_nome:     String(pedido.nome     || '').trim(),
      cliente_telefone: String(pedido.telefone || '').trim(),
      cliente_email:    pedido.email ? String(pedido.email).trim() : null,
      itens:            pedido.itens || [],
      total:            Number(pedido.total) || 0,
      entrega:          pedido.entrega   || 'retirada',
      pagamento:        pedido.pagamento || 'pix',
      observacoes:      pedido.obs       || pedido.observacoes || null,
      status:           pedido.status    || 'pendente'
    };

    if (!registro.order_nsu)    throw new Error('order_nsu obrigatório');
    if (!registro.cliente_nome) throw new Error('Nome do cliente obrigatório');

    const { data, error } = await supabaseClient
      .from('pedidos').insert(registro)
      .select().single();

    if (error) { console.error('[pedidos] criar:', error.message); throw error; }
    return data;
  },

  async getAll(filtros) {
    filtros = filtros || {};
    let query = supabaseClient.from('pedidos').select('*');

    if (filtros.status)   query = query.eq('status', filtros.status);
    if (filtros.desde)    query = query.gte('data_criacao', filtros.desde);
    if (filtros.ate)      query = query.lte('data_criacao', filtros.ate);

    query = query.order('data_criacao', { ascending: false });

    if (filtros.limit) query = query.limit(filtros.limit);

    const { data, error } = await query;
    if (error) { console.error('[pedidos] getAll:', error.message); return []; }
    return data || [];
  },

  async getById(id) {
    const { data, error } = await supabaseClient
      .from('pedidos').select('*').eq('id', id).single();
    if (error) { console.error('[pedidos] getById:', error.message); return null; }
    return data;
  },

  async getByOrderNsu(orderNsu) {
    const { data, error } = await supabaseClient
      .from('pedidos').select('*').eq('order_nsu', orderNsu).single();
    if (error && error.code !== 'PGRST116') {
      console.error('[pedidos] getByOrderNsu:', error.message);
    }
    return data || null;
  },

  async atualizarStatus(id, status, extras) {
    const update = { status };
    if (extras && typeof extras === 'object') Object.assign(update, extras);

    const { data, error } = await supabaseClient
      .from('pedidos').update(update).eq('id', id).select().single();

    if (error) { console.error('[pedidos] atualizarStatus:', error.message); return null; }
    return data;
  },

  async atualizarPorOrderNsu(orderNsu, update) {
    const { data, error } = await supabaseClient
      .from('pedidos').update(update)
      .eq('order_nsu', orderNsu).select().single();

    if (error) { console.error('[pedidos] atualizarPorOrderNsu:', error.message); return null; }
    return data;
  },

  async deletar(id) {
    const { error } = await supabaseClient
      .from('pedidos').delete().eq('id', id);
    if (error) { console.error('[pedidos] deletar:', error.message); return false; }
    return true;
  },

  formatarData(isoString) {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  },

  formatarTelefone(tel) {
    const n = String(tel || '').replace(/\D/g, '');
    if (n.length === 11) return `(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7)}`;
    if (n.length === 10) return `(${n.slice(0,2)}) ${n.slice(2,6)}-${n.slice(6)}`;
    return tel;
  },

  linkWhatsApp(pedido) {
    const tel = String(pedido.cliente_telefone || '').replace(/\D/g, '');
    if (!tel) return null;
    const telFull = tel.startsWith('55') ? tel : '55' + tel;
    const itensTxt = (pedido.itens || [])
      .map(i => `• ${i.nome} ×${i.quantidade} — R$ ${Number(i.preco * i.quantidade).toFixed(2).replace('.',',')}`)
      .join('\n');
    const msg =
      `Olá ${pedido.cliente_nome}! Recebi seu pedido *#${pedido.order_nsu}* no site da Loureiro Aquarismo.\n\n` +
      itensTxt +
      `\n\n*Total:* R$ ${Number(pedido.total).toFixed(2).replace('.',',')}` +
      `\n*Entrega:* ${pedido.entrega === 'retirada' ? 'Retirada na loja' : 'Entrega a combinar'}` +
      `\n\nVou te passar todos os detalhes!`;
    return `https://wa.me/${telFull}?text=${encodeURIComponent(msg)}`;
  },

  STATUS: {
    pendente:   { label: 'Pendente',   cor: '#f39c12', icone: '⏳' },
    pago:       { label: 'Pago',       cor: '#2ecc71', icone: '✅' },
    cancelado:  { label: 'Cancelado',  cor: '#e74c3c', icone: '❌' },
    entregue:   { label: 'Entregue',   cor: '#1A8FBF', icone: '📦' }
  }
};
