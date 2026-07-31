import React, { useState, useEffect } from 'react';

function App() {
  const [userEmail, setUserEmail] = useState('');
  const [emailInput, setEmailInput] = useState('');

  // ዌብሳይቱ ሲከፈት ከ localStorage ኢሜይል መኖሩን ይፈትሻል
  useEffect(() => {
    const savedEmail = localStorage.getItem('userEmail') || '';
    setUserEmail(savedEmail);
  }, []);

  // ሎጊን ሲሉ (ኢሜይል ሲያስገቡ) የሚሰራ
  const handleLogin = (e) => {
    e.preventDefault();
    if (emailInput.trim()) {
      localStorage.setItem('userEmail', emailInput.trim());
      setUserEmail(emailInput.trim());
      setEmailInput('');
    }
  };

  // ሎጋውት (ከአካውንት ሲወጡ)
  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    setUserEmail('');
  };

  // የሰጡኝ ትክክለኛ የአድሚን ኢሜይል አድራሻ
  const adminEmail = 'birhanubiyadgie23@gmail.com';
  const isAdmin = userEmail.toLowerCase() === adminEmail.toLowerCase();

  // 1. እስካሁን ሎጊን ካላደረጉ (ኢሜይል ካልተገባ) የሚታየው ትንሽ የሎጊን መስጫ 
  if (!userEmail) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f4f4', fontFamily: 'sans-serif' }}>
        <form onSubmit={handleLogin} style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', width: '350px', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '20px', color: '#333' }}>Ychalal Bookstore</h2>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>ለመቀጠል ኢሜይልዎን ያስገቡ</p>
          <input 
            type="email" 
            placeholder="ኢሜይል አድራሻዎ..." 
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
          <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            ግባ (Login)
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px' }}>
      {/* የላይኛው የዩዘር መረጃ እና የውጪ መውጫ (Logout) መስመር */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8f9fa', padding: '10px 20px', borderRadius: '5px', marginBottom: '20px', border: '1px solid #dee2e6' }}>
        <div>
          <span style={{ fontSize: '14px', color: '#333' }}>የገቡበት ኢሜይል: <strong>{userEmail}</strong></span>
          <span style={{ marginLeft: '15px', padding: '3px 8px', fontSize: '12px', borderRadius: '4px', background: isAdmin ? '#28a745' : '#6c757d', color: 'white' }}>
            {isAdmin ? 'አስተዳዳሪ (Admin)' : 'ተራ ተጠቃሚ (User)'}
          </span>
        </div>
        <button onClick={handleLogout} style={{ padding: '6px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          ውጣ (Logout)
        </button>
      </div>

      {/* 2. አድሚን ከገባ የሚታየው ገጽ (Admin Dashboard) */}
      {isAdmin ? (
        <div style={{ padding: '20px', background: '#e9f7ef', border: '1px solid #28a745', borderRadius: '5px' }}>
          <h2 style={{ color: '#155724' }}>የአስተዳዳሪ ዳሽቦርድ (Admin Dashboard)</h2>
          <p>እንኳን ደህና መጡ ብርሃን! ከዚህ በታች ያሉትን አማራጮች በመጠቀም መጻሕፍትን መጨመር፣ ማስተካከል ወይም መሰረዝ ይችላሉ።</p>
          {/* እዚህ ጋር የአድሚን ዋና ይዘቶችዎ ይኖራሉ */}
        </div>
      ) : (
        /* 3. ተራ ተጠቃሚ ከገባ የሚታየው ገጽ (User Dashboard) */
        <div style={{ padding: '20px', background: '#e8f4fd', border: '1px solid #b8daff', borderRadius: '5px' }}>
          <h2 style={{ color: '#004085' }}>የመጻሕፍት መደብር (Ychalal Bookstore)</h2>
          <p>እዚህ ጋር ያሉትን መጻሕፍት ማየት እና መመልከት ይችላሉ።</p>
          {/* እዚህ ጋር የዩዘር ዋና ይዘቶችዎ ይኖራሉ */}
        </div>
      )}
    </div>
  );
}

export default App;