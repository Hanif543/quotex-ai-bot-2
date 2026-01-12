const GEMINI_API_KEY = "AIzaSyAhyrC2OJSnaQJ2lH7eqH1MfaMH_B1Bc8g"; 

async function runAnalysis() {
    const fileInput = document.getElementById('chartInput');
    const reportCard = document.getElementById('report-card');
    const reportTitle = document.getElementById('report-title');
    const observationText = document.getElementById('observation');
    const recommendationText = document.getElementById('rec-text');
    const signalDisplay = document.getElementById('signal-display');
    const tpVal = document.getElementById('tp-val');
    const slVal = document.getElementById('sl-val');

    if (!fileInput.files || fileInput.files.length === 0) {
        alert("দয়া করে একটি চার্টের স্ক্রিনশট আপলোড করুন!");
        return;
    }

    // UI রিসেট এবং লোডিং দেখানো
    reportCard.style.display = 'block';
    reportTitle.innerText = document.getElementById('market').value + " এনালাইসিস";
    observationText.innerText = "Wizard AI চার্টটি দেখছে... ৫-১০ সেকেন্ড সময় দিন।";
    recommendationText.innerText = "সাপোর্ট, রেজিস্ট্যান্স এবং ক্যান্ডেলস্টিক প্যাটার্ন স্ক্যান করা হচ্ছে।";
    signalDisplay.style.display = 'none';

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onloadend = async () => {
        const base64Data = reader.result.split(',')[1];

        const payload = {
            contents: [{
                parts: [
                    { text: "তুমি একজন পেশাদার বাইনারি অপশন ট্রেডার। এই চার্টটি দেখে নিখুঁতভাবে সাপোর্ট (Support), রেজিস্ট্যান্স (Resistance), এবং ব্রেক অফ স্ট্রাকচার (BOS) চিহ্নিত করো। বর্তমান প্রাইস একশন অনুযায়ী পরবর্তী ১-৫ মিনিটের জন্য 'UP' বা 'DOWN' ট্রেড সিগন্যাল দাও এবং তার পেছনে ৩টি লজিক্যাল কারণ বলো। উত্তরের শেষে TP: [প্রাইস] এবং SL: [প্রাইস] ফরম্যাটে লেভেলগুলো লিখে দাও।" },
                    { inline_data: { mime_type: file.type, data: base64Data } }
                ]
            }]
        };

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            
            if (data.candidates && data.candidates.length > 0) {
                const aiText = data.candidates[0].content.parts[0].text;
                
                // রেজাল্ট দেখানো
                observationText.innerText = aiText;
                recommendationText.innerText = "এনালাইসিস সফল হয়েছে। নিচের লজিকগুলো খেয়াল করুন।";

                // TP/SL এক্সট্রাকশন (Regex)
                const tpMatch = aiText.match(/TP:\s*([0-9.]+)/i);
                const slMatch = aiText.match(/SL:\s*([0-9.]+)/i);

                if (tpMatch && slMatch) {
                    tpVal.innerText = tpMatch[1];
                    slVal.innerText = slMatch[1];
                    signalDisplay.style.display = 'flex';
                }
            } else {
                observationText.innerText = "AI কোনো সিগন্যাল দিতে পারেনি। আবার চেষ্টা করুন।";
            }
            
        } catch (error) {
            observationText.innerText = "ভুল হয়েছে! হয়তো আপনার ইন্টারনেটে সমস্যা বা API কোটা শেষ।";
            console.error(error);
        }
    };
    reader.readAsDataURL(file);
}
