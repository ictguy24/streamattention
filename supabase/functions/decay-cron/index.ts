import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DecayResult {
  user_id: string;
  decayed_amount: number;
  message: string;
}

interface ProcessingStats {
  users_processed: number;
  total_decayed: number;
  forgiveness_applied: number;
  errors: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const stats: ProcessingStats = {
    users_processed: 0,
    total_decayed: 0,
    forgiveness_applied: 0,
    errors: 0,
  };

  try {
    // Verify this is a cron call or authorized request
    const authHeader = req.headers.get('Authorization');
    const cronSecret = Deno.env.get('CRON_SECRET');
    
    // Allow cron calls with correct secret or service role
    const isAuthorized = authHeader?.includes(Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '') ||
                         authHeader?.includes(cronSecret || 'no-secret');
    
    if (!isAuthorized && cronSecret) {
      console.log('Unauthorized decay-cron call attempted');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting decay-cron job...');

    // 1. Get users eligible for decay (inactive 31+ days with balance)
    const { data: eligibleUsers, error: fetchError } = await supabaseAdmin.rpc('get_decay_eligible_users');

    if (fetchError) {
      console.error('Error fetching eligible users:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${eligibleUsers?.length || 0} users eligible for decay processing`);

    // 2. Process each eligible user
    const decayResults: DecayResult[] = [];
    
    for (const user of eligibleUsers || []) {
      try {
        // Apply AC decay
        const { data: decayResult, error: decayError } = await supabaseAdmin.rpc('apply_ac_decay', {
          p_user_id: user.user_id,
        });

        if (decayError) {
          console.error(`Decay error for user ${user.user_id}:`, decayError);
          stats.errors++;
          continue;
        }

        if (decayResult && decayResult[0]) {
          const result = decayResult[0];
          if (result.decayed_amount > 0) {
            stats.total_decayed += result.decayed_amount;
            decayResults.push({
              user_id: user.user_id,
              decayed_amount: result.decayed_amount,
              message: result.message,
            });
            console.log(`Decay applied: ${result.message} for user ${user.user_id}`);
          }
        }

        stats.users_processed++;
      } catch (userError) {
        console.error(`Error processing user ${user.user_id}:`, userError);
        stats.errors++;
      }
    }

    // 3. Process UPS forgiveness for recently returned users
    // Find users who were inactive but came back in the last 24 hours
    const { data: returningUsers, error: returningError } = await supabaseAdmin
      .from('profiles')
      .select('id, ups, last_active_at')
      .gte('last_active_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .lt('ups', 0.7) // Only those with reduced UPS
      .limit(50);

    if (!returningError && returningUsers) {
      console.log(`Found ${returningUsers.length} returning users for UPS forgiveness check`);

      for (const user of returningUsers) {
        try {
          const { data: forgivenessResult, error: forgivenessError } = await supabaseAdmin.rpc('apply_ups_forgiveness', {
            p_user_id: user.id,
          });

          if (!forgivenessError && forgivenessResult && forgivenessResult[0]?.ups_boost > 0) {
            stats.forgiveness_applied++;
            console.log(`UPS forgiveness applied to user ${user.id}: +${forgivenessResult[0].ups_boost}`);
          }
        } catch (forgivenessErr) {
          console.error(`Forgiveness error for user ${user.id}:`, forgivenessErr);
        }
      }
    }

    const duration = Date.now() - startTime;
    
    const summary = {
      success: true,
      duration_ms: duration,
      stats,
      decay_results: decayResults.slice(0, 10), // Only return first 10 for logging
      timestamp: new Date().toISOString(),
    };

    console.log('Decay-cron job completed:', JSON.stringify(summary));

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('Decay-cron job failed:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: duration,
      stats,
      timestamp: new Date().toISOString(),
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
