import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InteractionPayload {
  session_id: string;
  target_id?: string;
  interaction_type: string;
  duration_ms?: number;
  content_hash?: string;
  context_hash?: string;
  metadata?: Record<string, unknown>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      // Silent discard - no error to frontend
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create client with user's auth token for user context
    const supabaseUser = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    
    // Service role client for secure operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      console.log('Auth validation failed - silent discard');
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload: InteractionPayload = await req.json();
    
    // Validate required fields
    if (!payload.session_id || !payload.interaction_type) {
      console.log('Missing required fields - silent discard');
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate session belongs to user and is active
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('sessions')
      .select('id, user_id, end_time, abnormal_flag')
      .eq('id', payload.session_id)
      .single();

    if (sessionError || !session || session.user_id !== user.id || session.end_time !== null) {
      console.log('Session validation failed - silent discard');
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If session is flagged as abnormal, reduce quality silently
    const adjustedMetadata = {
      ...payload.metadata,
      abnormal_session: session.abnormal_flag,
    };

    // Call the mint_verified_ac function
    const { data: mintResult, error: mintError } = await supabaseAdmin.rpc('mint_verified_ac', {
      p_user_id: user.id,
      p_session_id: payload.session_id,
      p_target_id: payload.target_id || null,
      p_interaction_type: payload.interaction_type,
      p_duration_ms: payload.duration_ms || null,
      p_content_hash: payload.content_hash || null,
      p_context_hash: payload.context_hash || null,
      p_metadata: adjustedMetadata,
    });

    if (mintError) {
      console.error('Minting error:', mintError);
      // Silent discard - don't expose errors
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`AC minted for user ${user.id}: interaction=${payload.interaction_type}`);

    // Return success but don't expose AC amount (per spec)
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    // Silent discard on any error
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
