function setCode(id, html, css, js) {
    localStorage.setItem(`exCode/${id}/html`, html);
    localStorage.setItem(`exCode/${id}/css`, css);
    localStorage.setItem(`exCode/${id}/js`, js);
}

function hugahuga(id) {
    const html = localStorage.getItem(`exCode/${id}/html`);
    const css = localStorage.getItem(`exCode/${id}/css`);
    const js = localStorage.getItem(`exCode/${id}/js`);
    return { html: html, css: css, js: js }
}

function hogehoge(fileName, fileType, uri) {
    try {
        // ファイルのデータURI
        localStorage.setItem(`uri/uploadImage/${fileName}`, uri);
        // アップロードファイル名
        localStorage.setItem(`name/uploadImage/${fileName}`, fileName);
        // ファイル種別
        localStorage.setItem(`type/uploadImage/${fileName}`, fileType);
    } catch (error) {
        console.error(error);
        /**
         * DOMException: Failed to execute 'setItem' on 'Storage':
         * Setting the value of 'uri/uploadImage/DSC_1089.JPG' exceeded the quota
         * => QuotaExceededError ; ストレージの容量超過
         * https://developer.mozilla.org/ja/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
         */
    }
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

// function imageData(){
//     for(let i = 0; i < localStorage.length; i++ ){
//       const key = localStorage.key(i);
//       if (key.match(/.*\/uploadImage\/.*/) !== null) {
//         localStorage.removeItem(key);
//       }
//     }
//   }

function deleteImage(fileName){
    const key = {
        name: `name/uploadImage/${fileName}`,
        type: `type/uploadImage/${fileName}`,
        uri: `uri/uploadImage/${fileName}`
    }
    localStorage.removeItem(key.name)
    localStorage.removeItem(key.type)
    localStorage.removeItem(key.uri)

}