const API_URL = "https://script.google.com/macros/s/AKfycbwsZYqJeCioaphpNsXI-NSmZNGy1d8GWA7QTcH5L4bqd_uRjtKYShsHH0QUUZmuqBqA/exec";

function fetchData() {
    const regNo = document.getElementById('regNo').value;
    const type = document.getElementById('certType').value;
    const statusEl = document.getElementById('status');

    if(!regNo) { alert("Registration No darj karein"); return; }

    statusEl.innerText = "Data fetch ho raha hai, thoda intezar karein...";
    document.getElementById('certWrapper').style.display = 'none';
    document.getElementById('printBtn').style.display = 'none';

    const imgEl = document.getElementById('certImage');
    if(type === 'Old_Hifz') {
        imgEl.src = 'sanad_hifz.jpg'; 
    } else {
        imgEl.src = 'sanad_nazra.jpg'; 
    }

    fetch(`${API_URL}?regNo=${regNo}&type=${type}`)
        .then(res => res.json())
        .then(res => {
            if(res.status === 'success') {
                statusEl.innerText = "Data set ho gaya! Ab 'Download PDF' par click karein.";
                fillData(res.data);
                document.getElementById('certWrapper').style.display = 'block';
                document.getElementById('printBtn').style.display = 'inline-block';
            } else {
                statusEl.innerText = "Is Registration Number ka data nahi mila.";
            }
        })
        .catch(err => {
            statusEl.innerText = "Error: Data fetch nahi ho paya.";
        });
}

function fillData(data) {
    document.getElementById('grNo').innerText = data['Registration No'] || '';
    let serial = data['Timestamp'] ? new Date(data['Timestamp']).getTime().toString().slice(-5) : '';
    document.getElementById('serialNo').innerText = serial;
    document.getElementById('madrasaName').innerText = data['Branch Name'] || '';
    
    let sName = data['Student Name'] || '';
    let fName = data['Father Name'] || '';
    document.getElementById('studentName').innerText = sName + " بن " + fName;
    document.getElementById('dob').innerText = ""; 
    document.getElementById('residence').innerText = (data['District'] || '') + ", " + (data['State'] || '');
    document.getElementById('grade').innerText = data['Kaifiyat'] || '';

    if(data['Timestamp']) {
        let d = new Date(data['Timestamp']);
        document.getElementById('examDate').innerText = d.toLocaleDateString('en-GB'); 
    }

    let today = new Date();
    document.getElementById('issueDate').innerText = today.toLocaleDateString('en-GB');
}

// NAYA FUNCTION: PDF DOWNLOAD KARNE KE LIYE
function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const certElement = document.getElementById('certificate');
    const statusEl = document.getElementById('status');
    const btn = document.getElementById('printBtn');

    // Button disable karein taaki user baar baar click na kare
    statusEl.innerText = "High Quality PDF taiyar ho raha hai, thoda rukiye...";
    btn.disabled = true; 

    // html2canvas library Sanad ka screenshot legi (scale 3 matlab 3 guna High Quality)
    html2canvas(certElement, {
        scale: 3, 
        useCORS: true, 
        backgroundColor: null
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/jpeg', 0.95); // High quality Image
        
        // A4 PDF (Landscape) banayein
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        // Image ko PDF me bina kisi white margin ke A4 size (297x210 mm) me fit karein
        pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210);
        
        // Student ke Registration number se PDF ka naam save hoga
        let grNo = document.getElementById('grNo').innerText || 'Sanad';
        pdf.save(`${grNo}_Sanad.pdf`);

        statusEl.innerText = "PDF Download shuru ho gaya hai!";
        btn.disabled = false;
    }).catch(err => {
        statusEl.innerText = "PDF banne mein error aayi. Kripya page refresh karein.";
        btn.disabled = false;
    });
}