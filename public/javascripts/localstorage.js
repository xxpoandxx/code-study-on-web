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

function hogahoga() {
    // この変数にアップロードファイルの情報を復元することにする
    var file = null
    // この変数にアップロードファイルをデータURI化した情報を復元することにする
    var uri = localStorage.getItem('uri')

    // アップロードファイルを復元する。
    var binary = atob(
        uri.slice(value.answer.file.indexOf(',') + 1)
    )
    var bytes = new Uint8Array(binary.length)
    for (var i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
    }
    file = new Blob([bytes], {
        type: localStorage.getItem('type'),
    })
    file.name = localStorage.getItem('name')
    return file
}