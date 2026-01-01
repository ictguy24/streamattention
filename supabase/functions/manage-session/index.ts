import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SessionPayload {
  action: 'start' | 'end';
  device_hash: string;
  session_id?: string;
  abnormal?: boolean;
  metadata?: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseUser = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload: SessionPayload = await req.json();

    if (payload.action === 'start') {
      if (!payload.device_hash) {
        return new Response(JSON.stringify({ error: 'Device hash required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Create session using RPC
      const { data: sessionId, error: createError } = await supabaseAdmin.rpc('create_session', {
        p_user_id: user.id,
        p_device_hash: payload.device_hash,
        p_metadata: payload.metadata || {},
      });

      if (createError) {
        console.error('Session creation error:', createError);
        return new Response(JSON.stringify({ error: 'Failed to create session' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`Session started for user ${user.id}: ${sessionId}`);

      return new Response(JSON.stringify({ session_id: sessionId }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (payload.action === 'end') {
      if (!payload.session_id) {
        return new Response(JSON.stringify({ error: 'Session ID required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Verify session belongs to user
      const { data: session } = await supabaseAdmin
        .from('sessions')
        .select('user_id')
        .eq('id', payload.session_id)
        .single();

      if (!session || session.user_id !== user.id) {
        return new Response(JSON.stringify({ error: 'Invalid session' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // End session
      const { data: ended, error: endError } = await supabaseAdmin.rpc('end_session', {
        p_session_id: payload.session_id,
        p_abnormal: payload.abnormal || false,
      });

      if (endError) {
        console.error('Session end error:', endError);
      }

      console.log(`Session ended for user ${user.id}: ${payload.session_id}`);

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Session management error:', error);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
