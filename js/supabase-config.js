// js/supabase-config.js
// Configuração Supabase — Loureiro Aquarismo

const SUPABASE_URL = 'https://mwhorsstralwwizvykhe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13aG9yc3N0cmFsd3dpenZ5a2hlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NzU0MzUsImV4cCI6MjA5MDQ1MTQzNX0.UNFCLxB731MoO3gs9ykdqe5u8OOI979qFOn8lKlInF0';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
