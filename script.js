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

// 4. የተጠቃሚውን ሚና (Role) ከ Supabase profiles ቴብል በማረጋገጥ አዝራሮችን መቆጣጠሪያ
async function updateAuthUI() {
    // የዴስክቶፕ እና የሞባይል ሜኑ አዝራሮች
    const authBtn = document.getElementById('authBtn');
    
    // የኮምፒዩተር እና የሞባይል አድሚን አዝራሮች (በሁለቱም በኩል ያሉት እንዲስተካከሉ)
    const adminBookBtn = document.getElementById('adminBookBtn');
    const adminBookBtnMob = document.getElementById('adminBookBtnMob');
    
    const adminDashboardBtn = document.getElementById('adminDashboardBtn');
    const adminDashboardBtnMob = document.getElementById('adminDashboardBtnMob');

    const adminSettingsBtn = document.getElementById('adminSettingsBtn');
    const adminSettingsBtnMob = document.getElementById('adminSettingsBtnMob');

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

        console.log("Profile Data:", profile);
        console.log("Error if any:", error);

        // ተጠቃሚው አድሚን ሚና ካለው ብቻ አዝራሮቹን በሁለቱም ቦታዎች እናሳያለን
        const displayStyle = (profile && profile.role === 'admin') ? 'inline-block' : 'none';
        const displayFlexStyle = (profile && profile.role === 'admin') ? 'block' : 'none'; // ለሜኑ ውስጥ

        if (adminBookBtn) adminBookBtn.style.display = displayStyle;
        if (adminBookBtnMob) adminBookBtnMob.style.display = displayFlexStyle;

        if (adminDashboardBtn) adminDashboardBtn.style.display = displayStyle;
        if (adminDashboardBtnMob) adminDashboardBtnMob.style.display = displayFlexStyle;

        if (adminSettingsBtn) adminSettingsBtn.style.display = displayStyle;
        if (adminSettingsBtnMob) adminSettingsBtnMob.style.display = displayFlexStyle;

    } else {
        if (authBtn) {
            authBtn.innerText = 'ግባ';
            authBtn.onclick = openAuthModal; // የግባ ፊርማ ሲነካ ሞዳሉን እንዲከፍት
        }
        
        // ካልገባ አዝራሮቹ ይጠፋሉ
        [adminBookBtn, adminBookBtnMob, adminDashboardBtn, adminDashboardBtnMob, adminSettingsBtn, adminSettingsBtnMob].forEach(btn => {
            if (btn) btn.style.display = 'none';
        });
    }
}

// 5. መጽሐፍ መዝጋቢው ፋንክሽን
async function addBook(title, author, price, category, imageUrl, content) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        alert("እባክዎ መጀመሪያ ይግቡ (Login)!");
        return;
    }

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

// 7. የሞባይል ሜኑ መክፈቻና መዘጋጃ ፋንክሽን (Hamburger Menu Toggle)
function toggleMobileMenu() {
    const menu = document.getElementById('mobileDropdownMenu');
    if (menu) {
        menu.classList.toggle('show');
    }
}

// ከሜኑ ውጪ ሲነካ ሜኑአቸው እንዲዘጋ ማድረግ
window.onclick = function(event) {
    if (!event.target.matches('.menu-toggle-btn') && !event.target.closest('.mobile-dropdown-menu')) {
        const menu = document.getElementById('mobileDropdownMenu');
        if (menu && menu.classList.contains('show')) {
            menu.classList.remove('show');
        }
    }
}

// Supabase የዩዘሩን ሎግ-ኢን ሁኔታ በራሱ እንዲከታተል ማድረግ
supabase.auth.onAuthStateChange(async (event, session) => {
    currentUser = session?.user || null;
    await updateAuthUI();
});

// ፋይሉ ሲከፈት የግንኙነት ምርመራውን ማቀጣጠር
testConnection();
