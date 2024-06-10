const express = require('express')
const router = express.Router()
const ai = require('./gemini-api.js')
// define the about route
router.post('/codereview', (req, res) => {
    console.log(req.body)
    const html = req.body.html
    const css = req.body.css
    const prompt = `次のコードが正しいかどうか教えてください。以下のルールに従ってください。[ルール]①HTMLとCSSを同じファイルにすることについては言及しないでください。②h1タグが1つだけ使われているかどうかを教えてください。③pタグを1つだけ使われているかどうかを教えてください。④②と③があっていれば、「合っているぴよ」、1つでもちがっていたら「ちがうぴよ」と言ってください。
    # HTMLコード
    ${html}
    # CSSコード
    ${css}`;
    ai.run(prompt).then((data)=>{
        res.send(data);
    })
})

module.exports = router