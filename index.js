const express = require('express');
const app = express();
const path = require('path');
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');
const csvParser = require('csv-parser');
const bodyParser = require('body-parser');
const Etudiant = require('./models/etudiant'); // Import the Sequelize model
const { Sequelize } = require('sequelize');

app.use(express.static(path.join(__dirname, 'public')));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});
const upload = multer({ storage: storage });

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public','home.html'));
});

app.post('/upload', upload.single('file'), (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).send('No file uploaded.');
    }

    // Check file type
    const fileType = path.extname(file.originalname).toLowerCase();
    if (fileType !== '.xlsx' && fileType !== '.csv') {
        return res.status(400).send('Unsupported file format. Please upload an Excel file (xlsx) or CSV file.');
    }

    // Read file and convert to JSON
    if (fileType === '.xlsx') {
        // Read Excel file
        const workbook = xlsx.readFile(`./uploads/${file.filename}`);

        // Convert first sheet to JSON
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const excelData = xlsx.utils.sheet_to_json(worksheet);

        // Send JSON data to client
        res.json(excelData);
    } else if (fileType === '.csv') {
        // Read CSV file
        const csvData = [];
        fs.createReadStream(`./uploads/${file.filename}`)
            .pipe(csvParser())
            .on('data', (row) => {
                csvData.push(row);
            })
            .on('end', () => {
                // Send JSON data to client
                res.json(csvData);
            });
    }
});

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Handle saving data
app.post('/saveData', async (req, res) => {
    const jsonData = req.body; // JSON data sent from the client
    try {
        // Update existing records and insert new ones
        // After defining the model, synchronize it with the database
                 //  await sequelize.sync();
        for (const data of jsonData) {
            // Find record by primary key (ID)
            const existingRecord = await Etudiant.findByPk(data.ID);
            if (existingRecord) {
                // If record exists, update it with new data
                await existingRecord.update(data);
            } else {
                // If record doesn't exist, create a new one
                await Etudiant.create(data);
            }
        }

        console.log('Data saved successfully');
        res.status(200).send('Data saved successfully');
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).send('Error saving data');
    }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
