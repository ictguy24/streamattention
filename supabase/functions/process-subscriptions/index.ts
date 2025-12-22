import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeductionResult {
  user_id: string;
  success: boolean;
  deducted: number;
  message: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('[process-subscriptions] Starting daily subscription deduction processing...');

    // Get all subscriptions due for deduction
    const { data: dueSubscriptions, error: fetchError } = await supabase
      .rpc('get_subscriptions_due');

    if (fetchError) {
      console.error('[process-subscriptions] Error fetching due subscriptions:', fetchError);
      throw fetchError;
    }

    if (!dueSubscriptions || dueSubscriptions.length === 0) {
      console.log('[process-subscriptions] No subscriptions due for deduction');
      return new Response(
        JSON.stringify({ 
          success: true, 
          processed: 0, 
          message: 'No subscriptions due for deduction' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[process-subscriptions] Found ${dueSubscriptions.length} subscriptions to process`);

    const results: DeductionResult[] = [];
    let successCount = 0;
    let failedCount = 0;

    // Process each subscription
    for (const sub of dueSubscriptions) {
      try {
        console.log(`[process-subscriptions] Processing user ${sub.user_id}, tier: ${sub.tier_name}, fee: ${sub.fee_amount} AC`);
        
        const { data, error } = await supabase
          .rpc('process_subscription_deduction', { p_user_id: sub.user_id });

        if (error) {
          console.error(`[process-subscriptions] Error processing user ${sub.user_id}:`, error);
          failedCount++;
          results.push({
            user_id: sub.user_id,
            success: false,
            deducted: 0,
            message: error.message
          });
        } else if (data && data.length > 0) {
          const result = data[0];
          if (result.success) {
            successCount++;
          } else {
            failedCount++;
          }
          results.push({
            user_id: sub.user_id,
            success: result.success,
            deducted: result.deducted,
            message: result.message
          });
          console.log(`[process-subscriptions] User ${sub.user_id}: ${result.message} (deducted: ${result.deducted} AC)`);
        }
      } catch (err) {
        console.error(`[process-subscriptions] Exception processing user ${sub.user_id}:`, err);
        failedCount++;
        results.push({
          user_id: sub.user_id,
          success: false,
          deducted: 0,
          message: String(err)
        });
      }
    }

    const summary = {
      success: true,
      processed: dueSubscriptions.length,
      successful: successCount,
      failed: failedCount,
      timestamp: new Date().toISOString(),
      results
    };

    console.log('[process-subscriptions] Processing complete:', JSON.stringify(summary, null, 2));

    return new Response(
      JSON.stringify(summary),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[process-subscriptions] Fatal error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: String(error) 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
