// APNA NAYA URL YAHAN DALEIN:
const API_URL = "https://script.google.com/macros/s/AKfycbz1d8gB4NSPbsKNsDOhxazws-5fSfRaIE1cYOujy-bko27Fi_PriXVB_ubPlLM6jlkU/exec";

// Permanent Cache Load Karne ka Function
async function updateCache() {
    const type = document.getElementById('certType').value;
    const statusEl = document.getElementById('status');
    
    statusEl.innerText = "Sheet se naya data download ho raha hai, Kripya rukiye...";
    try {
        let response = await fetch(`${API_URL}?type=${type}`);
        let res = await response.json();
        
        if(res.status === 'success') {
            // Data hamesha ke liye browser memory (localStorage) me save ho gaya
            localStorage.setItem('sanad_cache_' + type, JSON.stringify(res.data));
            statusEl.innerText = "✅ Cache Memory Update ho gayi! Ab aap instantly Sanad bana sakte hain.";
        } else {
            statusEl.innerText = "❌ Data load error: " + res.message;
        }
    } catch(err) {
        statusEl.innerText = "❌ Error: Internet connection check karein.";
    }
}

// Data laane ka main function (Ab seedha Cache se aayega)
function fetchData() {
    const regNo = document.getElementById('regNo').value.trim();
    const type = document.getElementById('certType').value;
    const statusEl = document.getElementById('status');

    if(!regNo) { alert("Registration No darj karein"); return; }

    document.getElementById('certWrapper').style.display = 'none';
    document.getElementById('printBtn').style.display = 'none';

    // Background Set
    const imgEl = document.getElementById('certImage');
    imgEl.src = (type === 'Old_Hifz') ? 'sanad_hifz.jpg' : 'sanad_nazra.jpg';

    // Check Permanent Cache (localStorage)
    let cachedDataStr = localStorage.getItem('sanad_cache_' + type);
    
    if(cachedDataStr) {
        statusEl.innerText = "⚡ Data Cache Memory se Instantly laya gaya!";
        let allData = JSON.parse(cachedDataStr);
        processRecord(allData, regNo, statusEl);
    } else {
        // Agar system bilkul naya hai aur ek baar bhi cache nahi hua hai
        statusEl.innerText = "Memory me data nahi hai. Pehle 'Update Cache' button dabayein.";
    }
}

function processRecord(allData, regNo, statusEl) {
    if(allData[regNo]) {
        statusEl.innerText = "✅ Data set ho gaya! Ab 'Download HD PNG' par click karein.";
        fillData(allData[regNo]);
        document.getElementById('certWrapper').style.display = 'block';
        document.getElementById('printBtn').style.display = 'inline-block';
    } else {
        statusEl.innerText = "❌ Is Registration Number ka data Sheet/Cache me nahi mila.";
    }
}

function fillData(data) {
    document.getElementById('grNo').innerText = data['Registration No'] || '';
    
    let ts = data['Timestamp'] || '';
    let serial = ts.replace(/[^0-9]/g, '').slice(-5);
    if(!serial || serial.length < 5) serial = Math.floor(Math.random() * 90000) + 10000;
    document.getElementById('serialNo').innerText = serial;

    // --- SHEET DATA VARIABLES ---
    let branchName = data['Branch Name'] || '';
    let studentName = (data['Student Name'] || '') + " بن " + (data['Father Name'] || '');
    let dob = ""; // Sheet me column nahi hai
    
    let dist = data['District'] || '';
    let state = data['State'] || '';
    let residenceText = dist;
    if(dist && state) residenceText += ", " + state;
    else if(!dist) residenceText = state;

    let grade = data['Kaifiyat'] || '';
    let examDate = ts; 

    // --- LEFT SIDE (ENGLISH) SET KARNA ---
    document.getElementById('madrasaEng').innerText = branchName;
    document.getElementById('studentEng').innerText = studentName;
    document.getElementById('dobEng').innerText = dob;
    document.getElementById('residenceEng').innerText = residenceText;
    document.getElementById('gradeEng').innerText = grade;
    document.getElementById('examDateEng').innerText = examDate;

    // --- RIGHT SIDE (URDU) SET KARNA ---
    // Agar sheet me Urdu aur English columns alag-alag hain to aap yahan variable change kar sakte hain.
    // Abhi same data dono taraf map kar diya hai.
    document.getElementById('madrasaUrdu').innerText = branchName;
    document.getElementById('studentUrdu').innerText = studentName;
    document.getElementById('dobUrdu').innerText = dob;
    document.getElementById('residenceUrdu').innerText = residenceText;
    document.getElementById('gradeUrdu').innerText = grade;
    document.getElementById('examDateUrdu').innerText = examDate;

    let today = new Date();
    document.getElementById('issueDateUrdu').innerText = today.toLocaleDateString('en-GB');
}

// SUPER FAST HD PNG DOWNLOAD (bina browser hang kiye)
function downloadPNG() {
    const statusEl = document.getElementById('status');
    const btn = document.getElementById('printBtn');
    
    statusEl.innerText = "HD PNG Ban rahi hai, please wait...";
    btn.disabled = true;

    const textLayer = document.getElementById('textLayer');
    const bgImg = document.getElementById('certImage');

    // Scale 2.5 rakha hai jisse Quality HD rahe aur size 3MB-5MB ke beech aaye
    html2canvas(textLayer, {
        scale: 2.5, 
        backgroundColor: null, 
        useCORS: true
    }).then(textCanvas => {
        // Ek naya memory canvas banayenge (bina hang kiye image merge karne ke liye)
        const masterCanvas = document.createElement('canvas');
        masterCanvas.width = textCanvas.width;
        masterCanvas.height = textCanvas.height;
        const ctx = masterCanvas.getContext('2d');
        
        // 1. Pehle Background lagayenge
        ctx.drawImage(bgImg, 0, 0, masterCanvas.width, masterCanvas.height);
        
        // 2. Uske upar Text chipkayenge
        ctx.drawImage(textCanvas, 0, 0);
        
        // 3. PNG Image Download karwayenge
        const imgData = masterCanvas.toDataURL('image/png');
        let link = document.createElement('a');
        let grNo = document.getElementById('grNo').innerText || 'Sanad';
        link.download = `Sanad_${grNo}.png`;
        link.href = imgData;
        link.click();

        statusEl.innerText = "✅ HD PNG successfully download ho gayi!";
        btn.disabled = false;
    }).catch(err => {
        statusEl.innerText = "❌ Error aayi PNG banane me.";
        btn.disabled = false;
    });
}