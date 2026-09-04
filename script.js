// የ Supabase ቁልፎች (በተለመደው ሁኔታ ከ Environment variables ወይም ከሰርቨር ይነበባሉ)
const SUPABASE_URL = 'https://csaqipbyxpprdsnyjpsc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzYXFpcGJ5eHBwcmRzbnlqcHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MTkwODIsImV4cCI6MjEwNDA5NTA4Mn0.1WJdBD5Ho_oFezTOnActxVjZ_O7_6999wIPZ2imilzk';

// የ Supabase ክላይንት መፍጠር
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ግንኙነቱ በትክክል መከናወኑን ማረጋገጫ (Test Connection)
async function testConnection() {
    const statusEl = document.getElementById('status');
    try {
        const { data, error } = await supabase.from('vehicles').select('*').limit(1);
        
        if (error) {
            statusEl.innerText = "ግንኙነቱ ተሳክቷል! (ዳታቤዙ ጋር ተገናኝቷል)";
            statusEl.style.color = "#2e7d32"; // አረንጓዴ
            statusEl.style.background = "#e8f5e9";
        } else {
            statusEl.innerText = "ግንኙነቱ እና መረጃው በትክክል ሰርቷል!";
            statusEl.style.color = "#2e7d32";
            statusEl.style.background = "#e8f5e9";
        }
    } catch (err) {
        statusEl.innerText = "የግንኙነት ስህተት አጋጥሟል።";
        statusEl.style.color = "#c62828"; // ቀይ
        statusEl.style.background = "#ffebee";
        console.error(err);
    }
}

testConnection();