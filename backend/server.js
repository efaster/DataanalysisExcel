const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const cors = require('cors');
const fs = require('fs');
const ti = require('technicalindicators');

const app = express();
const PORT = 3001;
app.use(cors());

// ... (ส่วนของ multer ไม่ต้องแก้ไข) ...
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)){ fs.mkdirSync(uploadDir); }
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });


app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    fs.unlinkSync(req.file.path);

    if (data.length === 0) {
      return res.status(400).json({ error: 'File is empty.' });
    }
    
    // --- 1. เตรียมข้อมูล Input ให้ครบ (HLC) ---
    const labels = data.map(row => `${row[0]} ${row[1]}`);
    const closePrices = data.map(row => parseFloat(row[5])); // ราคาปิด (Close) - Index 5
    const highPrices = data.map(row => parseFloat(row[3])); // ราคาสูงสุด (High) - Index 3
    const lowPrices = data.map(row => parseFloat(row[4]));  // ราคาต่ำสุด (Low) - Index 4

    // สร้าง Input Object สำหรับ Indicator ที่ต้องการ HLC
    const inputHLC = {
      high: highPrices,
      low: lowPrices,
      close: closePrices,
    };

    // --- 2. คำนวณ Indicators ---
    // กลุ่มที่ใช้แค่ Close Price
    const ema20 = ti.EMA.calculate({ period: 20, values: closePrices });
    const macd = ti.MACD.calculate({ values: closePrices, fastPeriod: 12, slowPeriod: 26, signalPeriod: 9, SimpleMAOscillator: false, SimpleMASignal: false });
    const rsi14 = ti.RSI.calculate({ period: 14, values: closePrices });

    // กลุ่มที่ซับซ้อนขึ้น
    const bbInput = { period: 20, values: closePrices, stdDev: 2 };
    const bb = ti.BollingerBands.calculate(bbInput);

    const stochInput = { ...inputHLC, period: 14, signalPeriod: 3 };
    const stochastic = ti.Stochastic.calculate(stochInput);


    // --- 3. ส่งข้อมูลทั้งหมดกลับไป ---
    res.json({
      labels,
      prices: closePrices, // ยังใช้ closePrices เป็นราคาหลัก
      indicators: {
        ema20,
        macd,
        rsi14,
        bb, // << เพิ่มข้อมูลใหม่
        stochastic // << เพิ่มข้อมูลใหม่
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process the file.' });
  }
});

app.listen(PORT, () => {
  console.log(`✨ Backend server is running on http://localhost:${PORT}`);
});