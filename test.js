const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://cwdtpdtwklkwxltuhegz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3ZHRwZHR3a2xrd3hsdHVoZWd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5OTI1NzIsImV4cCI6MjA5NzU2ODU3Mn0.Vd7NnpmoXXkD1OYlGAr3_q5ZOFvDHXhSz859H9Wt7q8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSupabase() {
  console.log('🧪 Starting Supabase connection test...');
  const randomCode = 'BB-TEST-' + Math.floor(1000 + Math.random() * 9000);
  
  const { data, error } = await supabase
    .from('reservation')
    .insert([
        { 
            booking_ref: randomCode,
            customer_name: 'Node Test User',
            phone_number: '0811111111',
            booking_date: new Date().toISOString().split('T')[0],
            time_slot: '10:00 - 11:30 น.',
            guests_count: 1,
            special_requests: 'Test via Node.js script',
            status: 'Booked'
        }
    ]);

  if (error) {
    console.error('❌ Test Failed. Error inserting data:');
    console.error(error);
  } else {
    console.log(`✅ Test Passed! Data inserted successfully with ref: ${randomCode}`);
  }
}

testSupabase();
