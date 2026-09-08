// የ Supabase ቁልፎች
const SUPABASE_URL = 'https://csaqipbyxpprdsnyjpsc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzYXFpcGJ5eHBwcmRzbnlqcHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MTkwODIsImV4cCI6MjEwNDA5NTA4Mn0.1WJdBD5Ho_oFezTOnActxVjZ_O7_6999wIPZ2imilzk';

// የ Supabase ክላይንት መፍጠር
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// የሚንቀሳቀሰው አሁን የገባው ተጠቃሚ መረጃ እና ሌሎች ግሎባል ተለዋዋጮች (Global Variables)
let currentUser = null;
let isSignUpMode = false;
let activeReadingBook = null;
let allBooks = [];
let purchasedBooks = [];

// 1. ግንኙነቱ በትክክል መከናወኑን ማረጋገጫ (Test Connection)
async function testConnection() {
    const statusEl = document.getElementById('status');
    if (!statusEl) return;

    try {
        const { data, error } = await supabase.from('books').select('*').limit(1);
        
        if (error) {
            statusEl.innerText = "የግንኙነት ስህተት አጋጥሟል: " + error.message;
            statusEl.style.color = "#c62828";
            statusEl.style.background = "#ffebee";
        } else {
            statusEl.innerText = "ግንኙነቱ እና መረጃው በትክክል ሰርቷል!";
            statusEl.style.color = "#2e7d32";
            statusEl.style.background = "#e8f5e9";
        }
    } catch (err) {
        statusEl.innerText = "የግንኙነት ስህተት አጋጥሟል።";
        statusEl.style.color = "#c62828";
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

// 3. ሎግ አውት (Logout) የሚያደርግበት ፋንክሽን
async function handleLogout() {
    await supabase.auth.signOut();
    currentUser = null;
    await updateAuthUI();
    alert("ከአካውንትዎ ውጥተዋል።");
}

// 4. የተጠቃሚውን ሚና (Role) ከ Supabase profiles ቴብል በማረጋገጥ አዝራሮችን መቆጣጠሪያ
async function updateAuthUI() {
    const authBtn = document.getElementById('authBtn');
    
    const { data: { session } } = await supabase.auth.getSession();
    currentUser = session?.user || null;

    if (currentUser) {
        if (authBtn) {
            authBtn.innerText = 'ውጣ (Logout)';
            authBtn.onclick = handleLogout;
        }

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', currentUser.id)
            .single();

        const isAdmin = (profile && profile.role === 'admin');
        const displayStyle = isAdmin ? 'inline-block' : 'none';
        const displayFlexStyle = isAdmin ? 'block' : 'none';

        const safelySetDisplay = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.style.display = val;
        };

        safelySetDisplay('adminBookBtn', displayStyle);
        safelySetDisplay('adminBookBtnMob', displayFlexStyle);
        safelySetDisplay('adminDashboardBtn', displayStyle);
        safelySetDisplay('adminDashboardBtnMob', displayFlexStyle);
        safelySetDisplay('adminSettingsBtn', displayStyle);
        safelySetDisplay('adminSettingsBtnMob', displayFlexStyle);

    } else {
        if (authBtn) {
            authBtn.innerText = 'ግባ';
            authBtn.onclick = openAuthModal; 
        }
        
        ['adminBookBtn', 'adminBookBtnMob', 'adminDashboardBtn', 'adminDashboardBtnMob', 'adminSettingsBtn', 'adminSettingsBtnMob'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
    }
}

// 5. መጽሐፍ መዝጋቢው ፋንክሽን (ዋናው)
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

    const { error } = await supabase
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


// --- አዲሶቹ የተጨመሩ እና የተስተካከሉ የዩዘር፣ የሞዳል እና የንባብ ፋንክሽኖች ---

function openBookModal() { 
    document.getElementById('bookModal').style.display = 'flex'; 
}

function closeBookModal() { 
    document.getElementById('bookModal').style.display = 'none'; 
}

function switchAuthMode(e) {
    e.preventDefault();
    isSignUpMode = !isSignUpMode;
    const title = document.getElementById('auth-title');
    const btn = document.getElementById('auth-submit-btn');
    const toggleLink = document.getElementById('toggle-auth-mode');
    if (isSignUpMode) {
        title.innerText = 'አዲስ አካውንት ይፍጠሩ';
        btn.innerText = 'ተመዝገብ';
        toggleLink.innerText = 'ወደ መግቢያ ተመለስ';
    } else {
        title.innerText = 'ወደ አካውንትዎ ይግቡ';
        btn.innerText = 'ግባ';
        toggleLink.innerText = 'እዚህ ይመዝገቡ';
    }
}

async function handleLogin() {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    if (!email || !password) {
        alert('እባክዎ ኢሜይል እና ሚስጥራዊ ቃል ያስገቡ!');
        return;
    }

    if (isSignUpMode) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
            alert('ምዝገባ አልተሳካም: ' + error.message);
            return;
        }
        alert('ምዝገባው ተሳክቷል! እባክዎ ይግቡ።');
        isSignUpMode = false;
        switchAuthMode({preventDefault: () => {}});
    } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            alert('መግባት አልተቻለም: ' + error.message);
            return;
        }
        currentUser = data.user;
        
        // ካሉ ተጨማሪ የማጣሪያ ፋንክሽኖች በፕሮጀክትዎ ውስጥ የሚጠሩ ከሆነ
        if (typeof checkAdminStatus === 'function') await checkAdminStatus(currentUser.id);
        if (typeof loadUserDataFromDB === 'function') await loadUserDataFromDB(currentUser.id);
        
        if (typeof closeAuthModal === 'function') closeAuthModal();
        alert('እንኳን ደህና መጡ!');
        await updateAuthUI();
        if (typeof displayBooks === 'function') displayBooks(allBooks);
    }
}

async function submitBook() {
    const title = document.getElementById('b-title').value;
    const author = document.getElementById('b-author').value;
    const price = parseFloat(document.getElementById('b-price').value);
    const stock = parseInt(document.getElementById('b-stock').value) || 10;
    const category = document.getElementById('b-category').value;
    const image_url = document.getElementById('b-image').value;
    const content = document.getElementById('b-content').value;

    if (!title || isNaN(price)) {
        alert('እባክዎ ርዕስ እና ዋጋ በትክክል ያስገቡ!');
        return;
    }

    const { error } = await supabase.from('books').insert([{
        title, author, price, stock, category, image_url, content
    }]);

    if (error) {
        alert('መጽሐፉን መመዝገብ አልተቻለም: ' + error.message);
        return;
    }

    alert('መጽሐፉ በተሳካ ሁኔታ ተመዝግቧል!');
    closeBookModal();
    if (typeof fetchBooks === 'function') fetchBooks();
}

function openEditBookModal(bookId) {
    const book = allBooks.find(b => b.id == bookId);
    if (!book) return;
    document.getElementById('edit-b-id').value = book.id;
    document.getElementById('edit-b-title').value = book.title || '';
    document.getElementById('edit-b-author').value = book.author || '';
    document.getElementById('edit-b-price').value = book.price || 0;
    document.getElementById('edit-b-stock').value = book.stock || 10;
    document.getElementById('edit-b-category').value = book.category || 'fiction';
    document.getElementById('edit-b-image').value = book.image_url || '';
    document.getElementById('edit-b-content').value = book.content || '';
    document.getElementById('editBookModal').style.display = 'flex';
}

function closeEditBookModal() { 
    document.getElementById('editBookModal').style.display = 'none'; 
}

async function updateBookData() {
    const id = document.getElementById('edit-b-id').value;
    const title = document.getElementById('edit-b-title').value;
    const author = document.getElementById('edit-b-author').value;
    const price = parseFloat(document.getElementById('edit-b-price').value);
    const stock = parseInt(document.getElementById('edit-b-stock').value);
    const category = document.getElementById('edit-b-category').value;
    const image_url = document.getElementById('edit-b-image').value;
    const content = document.getElementById('edit-b-content').value;

    const { error } = await supabase.from('books').update({
        title, author, price, stock, category, image_url, content
    }).eq('id', id);

    if (error) {
        alert('ማስተካከል አልተቻለም: ' + error.message);
        return;
    }

    alert('መጽሐፉ በተሳካ ሁኔታ ተስተካክሏል!');
    closeEditBookModal();
    if (typeof fetchBooks === 'function') fetchBooks();
}

function openReader(bookId) {
    const book = allBooks.find(b => b.id == bookId);
    if (!book) return;
    activeReadingBook = book;

    document.getElementById('reader-book-title').innerText = book.title;
    document.getElementById('reader-book-author').innerText = book.author || 'ያልታወቀ';

    const isPurchased = purchasedBooks.some(pb => pb.id == book.id);
    const contentBox = document.getElementById('reader-content-box');
    const paywallSec = document.getElementById('paywall-section');

    let fullContent = book.content || 'ይህ መጽሐፍ ገና ይዘት አልተጻፈለትም።';
    if (!isPurchased && fullContent.length > 300) {
        contentBox.innerText = fullContent.substring(0, 300) + '...';
        paywallSec.style.display = 'block';
        document.getElementById('paywall-book-price').innerText = book.price;
    } else {
        contentBox.innerText = fullContent;
        paywallSec.style.display = 'none';
    }

    fetchBookComments(book.id);
    document.getElementById('readerModal').style.display = 'flex';
}

function closeReaderModal() {
    document.getElementById('readerModal').style.display = 'none';
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}

function changeFontSize(size) {
    const box = document.getElementById('reader-content-box');
    if (size === 'small') box.style.fontSize = '0.85rem';
    else if (size === 'normal') box.style.fontSize = '0.95rem';
    else if (size === 'large') box.style.fontSize = '1.15rem';
}

function toggleReadAloud() {
    if (!('speechSynthesis' in window)) {
        alert('ብሮውዘርዎ የድምፅ ንባብ (Speech Synthesis) አይደግፍም።');
        return;
    }
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        return;
    }
    const text = document.getElementById('reader-content-box').innerText;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'am-ET';
    window.speechSynthesis.speak(utterance);
}

function changeReaderTheme(theme) {
    const box = document.getElementById('reader-content-box');
    if (theme === 'dark') {
        box.style.background = '#0f172a';
        box.style.color = '#cbd5e1';
    } else {
        box.style.background = '#ffffff';
        box.style.color = '#0f172a';
    }
}

function buyCurrentBookFromReader() {
    if (!activeReadingBook) return;
    closeReaderModal();
    if (typeof addToCart === 'function') addToCart(activeReadingBook);
    if (typeof openCheckout === 'function') openCheckout();
}

async function fetchBookComments(bookId) {
    const container = document.getElementById('book-comments-container');
    if (!container) return;
    const { data } = await supabase.from('comments').select('*').eq('book_id', bookId);
    if (!data || data.length === 0) {
        container.innerHTML = '<p style="color:#94a3b8; font-size:0.8rem; text-align:center;">ምንም አስተያየት የለም።</p>';
        return;
    }
    container.innerHTML = '';
    data.forEach(c => {
        container.innerHTML += `
            <div style="background: rgba(15,23,42,0.6); padding: 6px 8px; border-radius: 6px; margin-bottom: 5px; font-size: 0.8rem;">
                <strong style="color: #38bdf8;">${c.user_name}</strong>: ${c.comment_text}
            </div>
        `;
    });
}

async function submitBookComment() {
    if (!activeReadingBook) return;
    const userName = document.getElementById('comment-user-name').value || 'እንግዳ';
    const commentText = document.getElementById('comment-text').value;
    if (!commentText) {
        alert('እባክዎ ሀሳብዎን ይጻፉ!');
        return;
    }
    const { error } = await supabase.from('comments').insert([{
        book_id: activeReadingBook.id,
        user_name: userName,
        comment_text: commentText
    }]);
    if (error) {
        alert('አስተያየት ማስቀመጥ አልተቻለም: ' + error.message);
        return;
    }
    document.getElementById('comment-text').value = '';
    fetchBookComments(activeReadingBook.id);
}

function shareOnSocial(platform) {
    if (!activeReadingBook) return;
    const url = window.location.href;
    const text = `ብርሃኑ መጽሐፍት መደብር - "${activeReadingBook.title}" በደራሲ ${activeReadingBook.author || ''} እጅግ አስደናቂ መጽሐፍ ነው!`;
    if (platform === 'telegram') {
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
    } else if (platform === 'facebook') {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    }
}
