// js/supabase-config.js
// Configuração Supabase — Loureiro Aquarismo

const SUPABASE_URL = 'https://imdrcbypudczfybkvhtx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltZHJjYnlwdWRjemZ5Ymt2aHR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3ODE4NDEsImV4cCI6MjA5MTM1Nzg0MX0.ZHUBmz7oslZPvA5G0MV7mGYb7elhXMdEFV2Uf0fC-FI';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
