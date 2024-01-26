
import { basicSetup } from "codemirror/codemirror/dist/index.js"
import { html } from "codemirror/lang-html/dist/index.js";
import { css } from "codemirror/lang-css/dist/index.js";
import { javascript } from "codemirror/lang-javascript/dist/index.js";
import { EditorState } from "codemirror/state/dist/index.js";
import { EditorView, keymap } from 'codemirror/view/dist/index.js'

document.addEventListener("DOMContentLoaded", () => {
    const target = document.getElementById("preview");

    // (1)ページ読み込み時に一度だけスクロール量を出力
    let scroll_y = window.scrollY;
    console.log(scroll_y);

    // (2)スクロールするたびにスクロール量を出力
    window.addEventListener('scroll', (event) => {
        let scroll_y = window.scrollY;
        if (scroll_y > 165) {
            target.classList.add("fullsize");
            target.style.height = `calc(100vh - 18px)`
        } else {
            target.classList.remove("fullsize");
            target.style.height = `calc(100vh - 18px - 165px + ${scroll_y}px)`
        }
    });

    console.log('Hello')
    editor()
})

async function editor() {
    console.log('Hello')
    const htmlEditor = document.getElementById('html-editor');
    const cssEditor = document.getElementById('css-editor');
    const javascriptEditor = document.getElementById('javascript-editor');
    const previewIframe = document.getElementById('preview');


    const placeholderCodes = {
        html: `<!-- ここにhtmlコードを書いてください -->
        
        

        `,
        css: `// ここにcssコードを書いてください //
        
        
        
        `,
        javascript: ` //ここにjavascriptコードを書いてください 
        
        

        `
    }

    // Code Mirror セットアップ
    const htmlView = new EditorView({
        parent: htmlEditor,
        state: EditorState.create({
            doc: placeholderCodes.html,
            extensions: [basicSetup, html()]
        })
    });

    const cssView = new EditorView({
        extensions: [basicSetup, css()],
        parent: cssEditor,
        state: EditorState.create({
            doc: placeholderCodes.css,
            extensions: [basicSetup, css()]
        })
    });

    const javascriptView = new EditorView({
        parent: javascriptEditor,
        state: EditorState.create({
            doc: placeholderCodes.javascript,
            extensions: [basicSetup, javascript()]
        })
    });

    // プレビュー
    function updatePreview() {
        const htmlCode = htmlView.state.doc.toString();
        const cssCode = cssView.state.doc.toString();
        const javascriptCode = javascriptView.state.doc.toString();

        const coveredCssCode = `<style>${cssCode}</style>`;
        const coveredJavascriptCode = `<script type="text/javascript">${javascriptCode}</scr${'ipt'}>`; // エスケープ処理

        const combinedCode = `
            <html>
            <head>${coveredCssCode}</head>
            <body>${htmlCode}${coveredJavascriptCode}</body>
            </html>
        `;

        previewIframe.srcdoc = combinedCode;
        // document.createElement
    }

    // window.setInterval(updatePreview, 100);
    document.getElementById("doPreviewUpdate").addEventListener("click", updatePreview);
}