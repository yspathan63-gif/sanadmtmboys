// APNA NAYA URL YAHAN DALEIN:
const API_URL = "https://script.google.com/macros/s/AKfycbz1d8gB4NSPbsKNsDOhxazws-5fSfRaIE1cYOujy-bko27Fi_PriXVB_ubPlLM6jlkU/exec"; 

// var use kiya hai taaki galti se bhi "already declared" ka error na aaye
var sheetCache = {
    'Old_Nazra': null,
    'Old_Hifz': null
};

async function fetchData() {
    const regNo = document.getElementById('regNo').value.trim();
    const type = document.getElementById('certType').value;
    const statusEl = document.getElementById('status');

    if(!regNo) { alert("Registration No darj karein"); return; }

    document.getElementById('certWrapper').style.display = 'none';
    document.getElementById('printBtn').style.display = 'none';

    const imgEl = document.getElementById('certImage');
    if(type === 'Old_Hifz') { imgEl.src = 'sanad_hifz.jpg'; } 
    else { imgEl.src = 'sanad_nazra.jpg'; }

    // Check Cache
    if(sheetCache[type]) {
        statusEl.innerText = "⚡ Data Cache se Instantly laya gaya!";
        processRecord(sheetCache[type], regNo, statusEl);
    } else {
        statusEl.innerText = "Pehli baar poori sheet load ho rahi hai, Please wait...";
        try {
            let response = await fetch(`${API_URL}?type=${type}`);
            let res = await response.json();
            
            if(res.status === 'success') {
                sheetCache[type] = res.data; 
                statusEl.innerText = "✅ Sheet Cache ho gayi!";
                processRecord(sheetCache[type], regNo, statusEl);
            } else {
                statusEl.innerText = "❌ Data load error: " + res.message;
            }
        } catch(err) {
            statusEl.innerText = "❌ Error: Internet connection check karein.";
        }
    }
}

function processRecord(allData, regNo, statusEl) {
    if(allData[regNo]) {
        statusEl.innerText = "✅ Data set ho gaya! Ab 'Direct Download PDF' par click karein.";
        fillData(allData[regNo]);
        document.getElementById('certWrapper').style.display = 'block';
        document.getElementById('printBtn').style.display = 'inline-block';
    } else {
        statusEl.innerText = "❌ Is Registration Number ka data sheet me nahi mila.";
    }
}

function fillData(data) {
    document.getElementById('grNo').innerText = data['Registration No'] || '';
    
    let ts = data['Timestamp'] || '';
    let serial = ts.replace(/[^0-9]/g, '').slice(-5);
    if(!serial || serial.length < 5) serial = Math.floor(Math.random() * 90000) + 10000;
    document.getElementById('serialNo').innerText = serial;

    document.getElementById('madrasaName').innerText = data['Branch Name'] || '';
    
    let sName = data['Student Name'] || '';
    let fName = data['Father Name'] || '';
    document.getElementById('studentName').innerText = sName + " بن " + fName;
    document.getElementById('dob').innerText = ""; 
    
    let dist = data['District'] || '';
    let state = data['State'] || '';
    let residenceText = dist;
    if(dist && state) residenceText += ", " + state;
    else if(!dist) residenceText = state;
    document.getElementById('residence').innerText = residenceText;

    document.getElementById('grade').innerText = data['Kaifiyat'] || '';
    document.getElementById('examDate').innerText = ts; 

    let today = new Date();
    document.getElementById('issueDate').innerText = today.toLocaleDateString('en-GB');
}

function downloadPDF() {
    if (!window.jspdf || !window.html2canvas) {
        alert("PDF tool load nahi hua hai. Page refresh karein.");
        return;
    }
    const { jsPDF } = window.jspdf;
    const statusEl = document.getElementById('status');
    const btn = document.getElementById('printBtn');
    
    statusEl.innerText = "PDF Ban raha hai, please wait...";
    btn.disabled = true;

    const bgImg = document.getElementById('certImage');
    const textLayer = document.getElementById('textLayer');

    try {
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        // Background pehle laga diya
        pdf.addImage(bgImg, 'JPEG', 0, 0, 297, 210);

        // Ab transparent text layer capture karenge
        html2canvas(textLayer, {
            scale: 3, 
            backgroundColor: null, 
            useCORS: true
        }).then(canvas => {
            const textImgData = canvas.toDataURL('image/png');
            // Image ke upar text chipka diya
            pdf.addImage(textImgData, 'PNG', 0, 0, 297, 210);
            
            let grNo = document.getElementById('grNo').innerText || 'Sanad';
            pdf.save(`Sanad_${grNo}.pdf`);

            statusEl.innerText = "✅ PDF successfully download ho gaya!";
            btn.disabled = false;
        }).catch(err => {
            statusEl.innerText = "❌ Error aayi PDF text banane me.";
            btn.disabled = false;
        });
    } catch (error) {
        statusEl.innerText = "❌ PDF fail ho gaya.";
        btn.disabled = false;
    }
}