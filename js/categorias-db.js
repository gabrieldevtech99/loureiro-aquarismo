// js/categorias-db.js — Gerenciamento de categorias (Supabase)
// Loureiro Aquarismo
//
// Estratégia: carrega categorias do Supabase, mas mantém um
// fallback com as categorias originais para que o site continue
// funcionando caso a tabela "categorias" ainda não tenha sido criada.

const CATEGORIAS_FALLBACK = [
  { slug: 'agua-doce',                nome: 'Peixes de Água Doce',       icone: '🐠', ordem: 10,  ativo: true },
  { slug: 'marinho',                  nome: 'Peixes e Corais Marinhos',  icone: '🪸', ordem: 20,  ativo: true },
  { slug: 'aquarios',                 nome: 'Aquários & Kits',           icone: '🏠', ordem: 30,  ativo: true },
  { slug: 'equipamentos',             nome: 'Equipamentos',              icone: '⚙️', ordem: 40,  ativo: true },
  { slug: 'racoes',                   nome: 'Rações Premium',            icone: '🍖', ordem: 50,  ativo: true },
  { slug: 'manutencao',               nome: 'Produtos de Manutenção',    icone: '💧', ordem: 60,  ativo: true },
  { slug: 'suplementos-marinho',      nome: 'Suplementos Marinho',       icone: '🧂', ordem: 70,  ativo: true },
  { slug: 'plantados',                nome: 'Aquários Plantados',        icone: '🌿', ordem: 80,  ativo: true },
  { slug: 'plantas',                  nome: 'Plantas Aquáticas',         icone: '🌱', ordem: 90,  ativo: true },
  { slug: 'midias-biologicas',        nome: 'Mídias Biológicas',         icone: '🧫', ordem: 100, ativo: true },
  { slug: 'aceleradores-biologicos',  nome: 'Aceleradores Biológicos',   icone: '🧪', ordem: 110, ativo: true }
];

const categoriasDB = {

  _cache: null,

  async getAll(forcarRecarregar) {
    if (this._cache && !forcarRecarregar) return this._cache;

    if (typeof supabaseClient === 'undefined') {
      this._cache = [...CATEGORIAS_FALLBACK];
      return this._cache;
    }

    const { data, error } = await supabaseClient
      .from('categorias')
      .select('*')
      .order('ordem', { ascending: true })
      .order('nome', { ascending: true });

    if (error || !data || data.length === 0) {
      if (error) console.warn('[categorias] usando fallback:', error.message);
      this._cache = [...CATEGORIAS_FALLBACK];
      return this._cache;
    }

    this._cache = data;
    return data;
  },

  async getAtivas() {
    const todas = await this.getAll();
    return todas.filter(c => c.ativo !== false);
  },

  async getBySlug(slug) {
    const todas = await this.getAll();
    return todas.find(c => c.slug === slug) || null;
  },

  async getMap() {
    const todas = await this.getAll();
    const mapa = {};
    todas.forEach(c => { mapa[c.slug] = c; });
    return mapa;
  },

  async salvar(categoria) {
    const registro = {
      slug:       String(categoria.slug || '').trim().toLowerCase(),
      nome:       String(categoria.nome || '').trim(),
      icone:      categoria.icone || '📦',
      imagem_url: categoria.imagem_url || null,
      ordem:      parseInt(categoria.ordem) || 0,
      ativo:      categoria.ativo !== false
    };

    if (!registro.slug) throw new Error('Slug é obrigatório');
    if (!registro.nome) throw new Error('Nome é obrigatório');
    if (!/^[a-z0-9-]+$/.test(registro.slug)) {
      throw new Error('Slug deve conter apenas letras minúsculas, números e hífens');
    }

    let resultado;
    if (categoria.id) {
      const { data, error } = await supabaseClient
        .from('categorias').update(registro)
        .eq('id', categoria.id).select().single();
      if (error) { console.error('[categorias] update:', error.message); throw error; }
      resultado = data;
    } else {
      const { data, error } = await supabaseClient
        .from('categorias').insert(registro)
        .select().single();
      if (error) { console.error('[categorias] insert:', error.message); throw error; }
      resultado = data;
    }

    this._cache = null;
    return resultado;
  },

  async deletar(id) {
    const { error } = await supabaseClient
      .from('categorias').delete().eq('id', id);
    if (error) { console.error('[categorias] delete:', error.message); return false; }
    this._cache = null;
    return true;
  },

  slugify(texto) {
    return String(texto || '')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
};
