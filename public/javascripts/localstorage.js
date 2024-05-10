function setCode(id, html, css, js) {
    localStorage.setItem(`exCode-${id}-html`, html);
    localStorage.setItem(`exCode-${id}-css`, css);
    localStorage.setItem(`exCode-${id}-js`, js);
}

function hugahuga(id) {
    const html = localStorage.getItem(`exCode-${id}-html`);
    const css = localStorage.getItem(`exCode-${id}-css`);
    const js = localStorage.getItem(`exCode-${id}-js`);
    return { html: html, css: css, js: js }
}

function hogehoge(file, uri) {
    // アップロードファイル名
    localStorage.setItem('name', file.name)
    // ファイル種別
    localStorage.setItem('type', file.type)
    // ファイルのデータURI
    localStorage.setItem('uri', uri)
}

function getHogehoge() {
    const fileName = localStorage.getItem('name'); // アップロードファイル名
    if (fileName == null) return null;   // データがなければ null を返す
    const file = {
        name:   fileName,
        type:   localStorage.getItem('type'),    // ファイル種別
        uri:    localStorage.getItem('uri'),           // ファイルのデータURI
    }
    return file; // データがあればオブジェクトを返す
}