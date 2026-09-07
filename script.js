// የ Supabase ቁልፎች
const SUPABASE_URL = 'https://csaqipbyxpprdsnyjpsc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzYXFpcGJ5eHBwcmRzbnlqcHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MTkwODIsImV4cCI6MjEwNDA5NTA4Mn0.1WJdBD5Ho_oFezTOnActxVjZ_O7_6999wIPZ2imilzk';

// የ Supabase ክላይንት መፍጠር
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// የሚንቀሳቀሰው አሁን የገባው ተጠቃሚ መረጃ (Current User)
let currentUser = null;

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

// 2. ሎግ ኢን የሚያደርግበት ፋንክሽን
async function loginAdmin(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        alert("ግባ መሳሳት አለ (Login Failed): " + error.message);
        return false;
    } else {
        currentUser = data.user;
        alert("በተሳካ ሁኔታ ገብተዋል!");
        
        // ገብቶ ሲጨርስ ዩአይ (UI) እንዲያስተካክል እና አድሚን አዝራር እንዲያሳይ ይህንን እንጠራዋለን
        await updateAuthUI(); 
        return true;
    }
}

// 3. ሎግ ഔት (Logout) የሚያደርግበት ፋንክሽን
async function handleLogout() {
    await supabase.auth.signOut();
    currentUser = null;
    await updateAuthUI();
    alert("ከአካውንትዎ ውጥተዋል።");
}

// 4. የተጠቃሚውን ሚና (Role) ከ Supabase profiles ቴብል በማረጋገጥ አድሚን አዝራሮችን መቆጣጠሪያ
async function updateAuthUI() {
    const authBtn = document.getElementById('authBtn');
    const adminBookBtn = document.getElementById('adminBookBtn');
    const adminNewsBtn = document.getElementById('adminNewsBtn');

    // አሁን የገባ ተጠቃሚ መኖሩን ማረጋገጥ
    const { data: { session } } = await supabase.auth.getSession();
    currentUser = session?.user || null;

    if (currentUser) {
        if (authBtn) {
            authBtn.innerText = 'ውጣ (Logout)';
            authBtn.onclick = handleLogout;
        }

        // ከፕሮፋይል ቴብል መረጃውን ማንበብ
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', currentUser.id)
            .single();

        // በኮንሶል ውስጥ ምን እያነበበ እንደሆነ ለማየት (F12 ተጭነው ማየት ይችላሉ)
        console.log("Profile Data:", profile);
        console.log("Error if any:", error);

        // ተጠቃሚው አድሚን ሚና ካለው ብቻ አዝራሮቹን እናሳያለን
        if (profile && profile.role === 'admin') {
            if (adminBookBtn) adminBookBtn.style.display = 'inline-block';
            if (adminNewsBtn) adminNewsBtn.style.display = 'inline-block';
        } else {
            if (adminBookBtn) adminBookBtn.style.display = 'none';
            if (adminNewsBtn) adminNewsBtn.style.display = 'none';
        }
    } else {
        if (authBtn) {
            authBtn.innerText = 'ግባ / ተመዝገብ';
        }
        if (adminBookBtn) adminBookBtn.style.display = 'none';
        if (adminNewsBtn) adminNewsBtn.style.display = 'none';
    }
}

// 5. መጽሐፍ መዝጋቢው ፋንክሽን (በዳታቤዝ አድሚን ሚናው የተረጋገጠ)
async function addBook(title, author, price, category, imageUrl, content) {
    // መጀመሪያ ሎግ ኢን ማድረጉን ማረጋገጥ
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        alert("እባክዎ መጀመሪያ ይግቡ (Login)!");
        return;
    }

    // ከዳታቤዝ አድሚን መሆኑን ዳግም ማረጋገጥ (ለተጨማሪ ደህንነት)
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

    if (!profile || profile.role !== 'admin') {
        alert("ይህንን ድርጊት ለመፈጸም አድሚን መሆን አለብዎት!");
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

// 6. ከ HTML ፎርም መረጃዎችን ተቀብሎ ወደ addBook የሚልከው ረዳት ፋንክሽን
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

// ፋይሉ ሲከፈት የግንኙነት ምርመራውን ማቀጣጠር እና የዩዘርን ሁኔታ ማጣራት
testConnection();
updateAuthUI(); // ገጹ ሲከፈት ወዲያውኑ ዩዘሩ አድሚን መሆኑን እንዲያጣራ
