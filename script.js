 // የ Supabase ቁልፎች
const SUPABASE_URL = 'https://csaqipbyxpprdsnyjpsc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzYXFpcGJ5eHBwcmRzbnlqcHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MTkwODIsImV4cCI6MjEwNDA5NTA4Mn0.1WJdBD5Ho_oFezTOnActxVjZ_O7_6999wIPZ2imilzk';

// የ Supabase ክላይንት መፍጠር
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ግንኙነቱ በትክክል መከናወኑን ማረጋገጫ (Test Connection)
async function testConnection() {
    const statusEl = document.getElementById('status');
    try {
        // ማስታወሻ፡ በመጀመሪያ የፈጠርነው ቴብል 'books' ስለሆነ ከ 'vehicles' ወደ 'books' ቀይሬዋለሁ
        const { data, error } = await supabase.from('books').select('*').limit(1);
        
        if (error) {
            statusEl.innerText = "የግንኙነት ስህተት አጋጥሟል: " + error.message;
            statusEl.style.color = "#c62828"; // ቀይ
            statusEl.style.background = "#ffebee";
        } else {
            statusEl.innerText = "ግንኙነቱ እና መረጃው በትክክል ሰርቷል!";
            statusEl.style.color = "#2e7d32"; // አረንጓዴ
            statusEl.style.background = "#e8f5e9";
        }
    } catch (err) {
        statusEl.innerText = "የግንኙነት ስህተት አጋጥሟል።";
        statusEl.style.color = "#c62828"; // ቀይ
        statusEl.style.background = "#ffebee";
        console.error(err);
    }
}

// መጽሐፍ መዝጋቢው ፋንክሽን (በትክክለኛው የ supabase ስም ተስተካክሏል)
async function addBook(title, author, price, category, imageUrl, content) {
    const { data, error } = await supabase
        .from('books')
        .insert([
            { 
                title: title, 
                author: author, 
                price: price, 
                category: category, 
                image_url: imageUrl, 
                content: content 
            }
        ]);

    if (error) {
        alert("መጽሐፍ ማስገባት አልተቻለም: " + error.message);
    } else {
        alert("መጽሐፉ በተሳካ ሁኔታ ተመዝግቧል!");
    }
}

// ፋይሉ ሲከፈት የግንኙነት ምርመራውን ማቀጣጠር
testConnection();
