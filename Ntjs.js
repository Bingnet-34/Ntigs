const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// مجلد تحميل الملفات
const DOWNLOAD_FOLDER = path.join(__dirname, 'configs');

// إنشاء مجلدات HTTP_CUSTOM و Dark_Tunnel و Tls_Tunnel
const CONFIG_TYPES = ['HTTP_CUSTOM', 'Dark_Tunnel', 'Tls_Tunnel'];
CONFIG_TYPES.forEach(type => {
    const dirPath = path.join(DOWNLOAD_FOLDER, type);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
});

// الصفحة الرئيسية (HTML كامل مدمج)
app.get('/', (req, res) => {
    let configFiles = {};

    // قراءة الملفات من كل مجلد
    CONFIG_TYPES.forEach(type => {
        const dirPath = path.join(DOWNLOAD_FOLDER, type);
        configFiles[type] = fs.existsSync(dirPath) ? fs.readdirSync(dirPath) : [];
    });

    // توليد HTML ديناميكي
    let html = `
    <!DOCTYPE html>
    <html lang="ar">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تنزيل ملفات VPN</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                text-align: center;
                margin-top: 50px;
                background-color: #f4f4f4;
                color: #333;
            }
            .file-list {
                margin-top: 20px;
            }
            .file-item {
                padding: 10px;
                border: 1px solid #ccc;
                margin: 5px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .file-item button {
                padding: 5px 10px;
                background-color: #ff6600;
                color: white;
                border: none;
                cursor: pointer;
            }
        </style>
    </head>
    <body>
        <h1>تحميل ملفات VPN</h1>
        <select id="config-type" onchange="toggleFileList()">
            <option value="">اختر نوع التطبيق...</option>`;

    // إنشاء الخيارات داخل قائمة الاختيار (Dropdown)
    for (let type in configFiles) {
        html += `<option value="${type}">${type}</option>`;
    }

    html += `
        </select>

        <div id="file-options" class="file-list" style="display: none;">`;

    // إنشاء القوائم لكل نوع من الملفات
    for (let type in configFiles) {
        html += `
            <div id="${type}-files" class="file-list-group" style="display: none;">
                <h3>${type}</h3>`;

        configFiles[type].forEach(file => {
            html += `
                <div class="file-item">
                    <span>${file}</span>
                    <button onclick="window.location.href='/download/${type}/${file}'">تنزيل</button>
                </div>`;
        });

        html += `</div>`;
    }

    html += `
        </div>

        <script>
            function toggleFileList() {
                var selectedType = document.getElementById("config-type").value;
                var fileOptions = document.getElementById("file-options");
                var fileListGroups = document.querySelectorAll(".file-list-group");

                fileListGroups.forEach(function(group) {
                    group.style.display = "none";
                });

                if (selectedType !== "") {
                    document.getElementById(selectedType + "-files").style.display = "block";
                    fileOptions.style.display = "block";
                } else {
                    fileOptions.style.display = "none";
                }
            }
        </script>
    </body>
    </html>`;

    // إرسال HTML إلى العميل
    res.send(html);
});

// مسار تحميل الملفات
app.get('/download/:configType/:filename', (req, res) => {
    const { configType, filename } = req.params;
    const filePath = path.join(DOWNLOAD_FOLDER, configType, filename);

    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).send("الملف غير موجود.");
    }
});

// تشغيل السيرفر
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
