import { basicSetup } from 'cdm/codemirror/dist/index.js';
import { html } from 'cdm/lang-html/dist/index.js';
import { css } from 'cdm/lang-css/dist/index.js';
import { javascript } from 'cdm/lang-javascript/dist/index.js';
import { EditorState } from 'cdm/state/dist/index.js';
import { EditorView, keymap } from 'cdm/view/dist/index.js';

document.addEventListener('DOMContentLoaded', () => {
    // Preview の伸び縮み
    viewer();
    // Editor セットアップ
    editor();
});

function viewer() {
    const target = document.getElementById('preview');

    // (1)ページ読み込み時に一度だけスクロール量を出力
    let scroll_y = window.scrollY;
    console.log(scroll_y);

    // (2)スクロールするたびにスクロール量を出力
    window.addEventListener('scroll', (event) => {
        let scroll_y = window.scrollY;
        if (scroll_y > 165) {
            // ページ見出しがないとき、高さいっぱい表示
            target.classList.add('fullsize');
            target.style.height = `calc(100vh - 18px)`;
        } else {
            // ページ見出し分、上方に余白
            target.classList.remove('fullsize');
            // 100vh - preview's margin - ページ見出し分 + スクロール分
            target.style.height = `calc(100vh - 18px - 165px + ${scroll_y}px)`;
        }
    });
}

function editor() {
    // placeholderCodes 定義忘れ対策
    if (typeof placeholderCodes === undefined) {
        console.error('placeholderCodes is undefined');
        return;
    }

    const _placeholderCodes = placeholderCodes;
    const htmlEditor = document.getElementById('html-editor');
    const cssEditor = document.getElementById('css-editor');
    const javascriptEditor = document.getElementById('javascript-editor');
    const previewIframe = document.getElementById('preview');

    // Code Mirror セットアップ
    const htmlView = new EditorView({
        parent: htmlEditor,
        state: EditorState.create({
            doc: _placeholderCodes.html,
            extensions: [basicSetup, html()]
        })
    });

    const cssView = new EditorView({
        extensions: [basicSetup, css()],
        parent: cssEditor,
        state: EditorState.create({
            doc: _placeholderCodes.css,
            extensions: [basicSetup, css()]
        })
    });

    const javascriptView = new EditorView({
        parent: javascriptEditor,
        state: EditorState.create({
            doc: _placeholderCodes.javascript,
            extensions: [basicSetup, javascript()]
        })
    });

    // プレビュー
    function updatePreview() {
        const htmlCode = htmlView.state.doc.toString();
        const cssCode = cssView.state.doc.toString();
        const javascriptCode = javascriptView.state.doc.toString();

        const coveredCssCode = `<style>${cssCode}</style>`;
        const coveredJavascriptCode = `<script type='text/javascript'>${javascriptCode}</scr${'ipt'}>`; // エスケープ処理

        const combinedCode = `
            <html>
            <head>${coveredCssCode}</head>
            <body>${htmlCode}${coveredJavascriptCode}</body>
            </html>
        `;

        previewIframe.srcdoc = combinedCode;
    }

    // UPDATEボタンに updatePreview を登録
    document.getElementById('doPreviewUpdate').addEventListener('click', updatePreview);
}