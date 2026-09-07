// የ Supabase ቁልፎች
const SUPABASE_URL = 'https://csaqipbyxpprdsnyjpsc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzYXFpcGJ5eHBwcmRzbnlqcHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MTkwODIsImV4cCI6MjEwNDA5NTA4Mn0.1WJdBD5Ho_oFezTOnActxVjZ_O7_6999wIPZ2imilzk';

// የ Supabase ክላይንት መፍጠር
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 1. ግንኙነቱ በትክክል መከናወኑን ማረጋገጫ (Test Connection)
async function testConnection() {
    const statusEl = document.getElementById('status');
    if (!statusEl) return; // 'status' የሚባል id ከሌለ እንዳይበላሽ

    try {
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

// 2. አድሚን ሎግ ኢን የሚያደርግበት ፋንክሽን
async function loginAdmin(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        alert("ግባ መሳሳት አለ (Login Failed): " + error.message);
        return false;
    } else {
        alert("በተሳካ ሁኔታ ገብተዋል! አሁን መጽሐፍ መመዝገብ ይችላሉ።");
        return true;
    }
}

// 3. መጽሐፍ መዝጋቢው ፋንክሽን
async function addBook(title, author, price, category, imageUrl, content) {
    // መጀመሪያ አድሚን መሆኑን/መግባቱን ማረጋገጥ
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        alert("እባክዎ መጀመሪያ እንደ አድሚን ይግቡ (Login)!");
        return;
    }

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

// 4. ከ HTML ፎርም መረጃዎችን ተቀብሎ ወደ addBook የሚልከው ረዳት ፋንክሽን
function handleFormSubmit() {
    const title = document.getElementById('title')?.value;
    const author = document.getElementById('author')?.value;
    const price = parseFloat(document.getElementById('price')?.value);
    const category = document.getElementById('category')?.value;
    const imageUrl = document.getElementById('imageUrl')?.value;
    const content = document.getElementById('content')?.value;

    if (!title || isNaN(price)) {
        alert("እባክዎ የመጽሐፉን ርዕስ እና ትክክለኛ ዋጋ ይሙሉ!");
        return;
    }

    addBook(title, author, price, category, imageUrl, content);
}

// ፋይሉ ሲከፈት የግንኙነት ምርመራውን ማቀጣጠር
testConnection();
