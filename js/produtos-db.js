// js/produtos-db.js — Versão Supabase
// Loureiro Aquarismo

const produtosDB = {

  async getAll() {
    const { data, error } = await supabaseClient
      .from('produtos')
      .select('*')
      .order('data_cadastro', { ascending: false });
    if (error) { console.error('getAll:', error.message); return []; }
    return data || [];
  },

  async getByCategoria(categoria) {
    const { data, error } = await supabaseClient
      .from('produtos')
      .select('*')
      .eq('categoria', categoria)
      .eq('disponivel', true)
      .order('data_cadastro', { ascending: false });
    if (error) { console.error('getByCategoria:', error.message); return []; }
    return data || [];
  },

  async getDestaques() {
    const { data, error } = await supabaseClient
      .from('produtos')
      .select('*')
      .eq('destaque', true)
      .eq('disponivel', true)
      .order('data_cadastro', { ascending: false })
      .limit(8);
    if (error) { console.error('getDestaques:', error.message); return []; }
    return data || [];
  },

  async getById(id) {
    const { data, error } = await supabaseClient
      .from('produtos')
      .select('*')
      .eq('id', id)
      .single();
    if (error) { console.error('getById:', error.message); return null; }
    return data;
  },

  async buscar(texto) {
    const { data, error } = await supabaseClient
      .from('produtos')
      .select('*')
      .ilike('nome', `%${texto}%`)
      .eq('disponivel', true)
      .order('nome');
    if (error) { console.error('buscar:', error.message); return []; }
    return data || [];
  },

  async salvar(produto) {
    const registro = {
      nome:        produto.nome,
      categoria:   produto.categoria,
      preco:       parseFloat(produto.preco),
      preco_promo: produto.preco_promo ? parseFloat(produto.preco_promo) : null,
      estoque:     parseInt(produto.estoque) || 0,
      descricao:   produto.descricao   || '',
      detalhes:    produto.detalhes    || {},
      imagem_url:  produto.imagem_url  || null,
      imagens:     produto.imagens     || [],
      video_url:   produto.video_url   || null,
      disponivel:  produto.disponivel  !== false,
      destaque:    produto.destaque    || false,
      variacoes:   produto.variacoes   || [],
    };

    if (produto.id) {
      const { data, error } = await supabaseClient
        .from('produtos').update(registro)
        .eq('id', produto.id).select().single();
      if (error) { console.error('update:', error.message); return null; }
      return data;
    } else {
      const { data, error } = await supabaseClient
        .from('produtos').insert(registro)
        .select().single();
      if (error) { console.error('insert:', error.message); return null; }
      return data;
    }
  },

  async deletar(id) {
    const { error } = await supabaseClient
      .from('produtos').delete().eq('id', id);
    if (error) { console.error('delete:', error.message); return false; }
    return true;
  },

  async uploadImagem(arquivo, nomeBase) {
    const ext  = arquivo.name.split('.').pop().toLowerCase();
    const nome = `${nomeBase}-${Date.now()}.${ext}`;
    const { error } = await supabaseClient.storage
      .from('produtos').upload(nome, arquivo, { upsert: true, cacheControl: '3600' });
    if (error) { console.error('upload:', error.message); return null; }
    const { data } = supabaseClient.storage.from('produtos').getPublicUrl(nome);
    return data.publicUrl;
  },

  async deletarImagem(url) {
    if (!url || !url.includes('supabase')) return;
    const nome = url.split('/').pop();
    await supabaseClient.storage.from('produtos').remove([nome]);
  }
};
