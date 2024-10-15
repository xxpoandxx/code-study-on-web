/**
 * データベースを扱うためのモジュール
 */
const sqlite3 = require('sqlite3'); //sqlite3の読み込み

module.exports.User = class {
    constructor() {
        this.file = './user.db';
        this.database = new sqlite3.Database(this.file);
    }

    // 戻り値: オブジェクト | undefined
    get(query, params = []) {
        return new Promise((resolve, reject) => {
            this.database.get(query, params, (err, row) => {
                console.group('Database.GET');
                console.log('query:', query);
                console.log('params:', params);
                console.log('err:', err);
                console.log('row:', row);
                console.groupEnd();
                if (err !== null) reject(err);
                else resolve(row);
            });
        });
    }

    all(query, params = []) {
        return new Promise((resolve, reject) => {
            this.database.all(query, params, (err, rows) => {
                console.group('Database.ALL');
                console.log('query:', query);
                console.log('params:', params);
                console.log('err:', err);
                console.log('rows:', rows);
                console.groupEnd();
                if (err !== null) reject(err);
                else resolve(rows);
            });
        });
    }

    run(query, params) {
        this.database.run(query, params, (err) => {
            console.group('Database.RUN');
            console.log('query:', query);
            console.log('params:', params);
            console.log('err:', err);
            console.groupEnd();
            if (err !== null) console.log('DB Error in run.', err);
        });
    }

    close() {
        this.database.close();
    }
}

module.exports.EditorPage = class {
    constructor() {
        this.file = './editor_page.db';
        this.database = new sqlite3.Database(this.file);
    }

    // 戻り値: オブジェクト | undefined
    get(query, params = []) {
        return new Promise((resolve, reject) => {
            this.database.get(query, params, (err, row) => {
                console.group('Database.GET');
                console.log('query:', query);
                console.log('params:', params);
                console.log('err:', err);
                console.log('row:', row);
                console.groupEnd();
                if (err !== null) reject(err);
                else resolve(row);
            });
        });
    }

    all(query, params = []) {
        return new Promise((resolve, reject) => {
            this.database.all(query, params, (err, rows) => {
                console.group('Database.ALL');
                console.log('query:', query);
                console.log('params:', params);
                console.log('err:', err);
                console.log('rows:', rows);
                console.groupEnd();
                if (err !== null) reject(err);
                else resolve(rows);
            });
        });
    }

    run(query, params) {
        this.database.run(query, params, (err) => {
            console.group('Database.RUN');
            console.log('query:', query);
            console.log('params:', params);
            console.log('err:', err);
            console.groupEnd();
            if (err !== null) console.log('DB Error in run.', err);
        });
    }

    close() {
        this.database.close();
    }
}