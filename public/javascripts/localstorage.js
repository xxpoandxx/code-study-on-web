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

function hogehoge(fileName,fileType,uri) {
    // アップロードファイル名
    localStorage.setItem(`name/uploadImage/${fileName}`, fileName)
    // ファイル種別
    localStorage.setItem(`type/uploadImage/${fileName}`, fileType)
    // ファイルのデータURI
    localStorage.setItem(`uri/uploadImage/${fileName}`, uri)
}

function getHogehoge(fileName) {
    const getFileName = localStorage.getItem(`name/uploadImage/${fileName}`); // アップロードファイル名
    if (getFileName == null) return null;   // データがなければ null を返す
    const file = {
        name:   getFileName,
        type:   localStorage.getItem(`type/uploadImage/${fileName}`),    // ファイル種別
        uri:    localStorage.getItem(`uri/uploadImage/${fileName}`),    // ファイルのデータURI
    }
    return file; // データがあればオブジェクトを返す
}