const express = require('express')
const router = express.Router()
const ai = require('./gemini-api.js')
// define the about route
router.post('/codereview', (req, res) => {
    console.log(req.body)
    const doc = req.body.doc;
    const html = req.body.html
    const css = req.body.css
    const javascript = req.body.javascript
    const aiprompt = req.body.aiprompt
        .replace('%%INPUT_CODE%%', doc)
        .replaceAll('^','`')
    ai.run(aiprompt).then((data)=>{
        res.send(data);
    })
})

module.exports = router