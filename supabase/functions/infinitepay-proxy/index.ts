import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { action, payload } = body

    if (action === 'gerar_link') {
      console.log('[InfinitePay Proxy] Gerando link:', JSON.stringify(payload))

      const response = await fetch(
        'https://api.infinitepay.io/invoices/public/checkout/links',
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(payload),
        }
      )

      const responseText = await response.text()
      console.log('[InfinitePay Proxy] Resposta:', response.status, responseText)

      let data
      try {
        data = JSON.parse(responseText)
      } catch {
        return new Response(
          JSON.stringify({ error: 'Resposta invalida da InfinitePay', raw: responseText }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify(data),
        {
          status:  response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (action === 'verificar_pagamento') {
      console.log('[InfinitePay Proxy] Verificando pagamento:', JSON.stringify(payload))

      const response = await fetch(
        'https://api.infinitepay.io/invoices/public/checkout/payment_check',
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(payload),
        }
      )

      const data = await response.json()
      console.log('[InfinitePay Proxy] Status pagamento:', JSON.stringify(data))

      return new Response(
        JSON.stringify(data),
        {
          status:  response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Action desconhecida: ' + action }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('[InfinitePay Proxy] Erro interno:', err)
    return new Response(
      JSON.stringify({ error: 'Erro interno do proxy: ' + err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
