const express = require("express");
const multer = require("multer");
const Promise = require("bluebird");
const { translate } = require('google-translate-api-browser');
const dotenv = require("dotenv");
dotenv.config();

const port = process.env.PORT || 5000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({ storage: multer.memoryStorage() })

// Language Code
// https://developers.google.com/admin-sdk/directory/v1/languages
app.post('/translator', upload.single('translator'), async (req, res) => {
    const data = JSON.parse(req.file.buffer.toString('utf8'))
    let translatedData = {}
    try {
        await Promise?.map(Object.keys(data), async (key) => {
            await translate(data[key], {
                to: req.body.lang
            }).then((res) => {
                translatedData[key] = res.text;
            }).catch((error) => {
                return res.status(200).json({
                    result: translatedData,
                    error
                });
            })
        }, { concurrency: 1 });
        return res.status(200).json({
            result: translatedData
        });
    } catch (error) {
        return res.status(200).json({
            result: translatedData,
            error
        });
    }
})

app.listen(port, () => {
    console.log(`Server is running at port ${port}`);
});
