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
    // const prompt = `ユーザがエディタに入力しているコードについて、以下の[ルール]と[構成]に従って言及してください。[ルール]①HTMLとCSSを同じファイルにすることについては言及しないでください。②h1タグが1つだけ使われているかどうかを教えてください。③pタグを1つだけ使われているかどうかを教えてください。④②と③があっていれば、「正解です」、1つでもちがっていたら「違うところがあります」と言ってください。[構成]1行目:「正解です」or「違うところがあります」2行目:(正解ならば)「次に進んでください。」or(間違っているなら)「{間違っている行番号}行目が違います」'
    // # HTMLコード
    // ${html}
    // # CSSコード
    // ${css}`;
    ai.run(aiprompt).then((data)=>{
        res.send(data);
    })
})

module.exports = router