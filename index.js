const express = require('express'); //2023,07,06 13:51パッケージの読み込み
const sqlite3 = require('sqlite3'); //sqlite3の読み込み
const bodyParser = require('body-parser');
const session = require('express-session');
const crypto = require('crypto'); // ハッシュ用
const app = express(); //expressの使う準備ができた状態
app.set("view engine", "ejs"); //テンプレートエンジンの使用
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true })); //formで送ったデータをnodeのなかで扱えるように成形してくれるやつ
app.use(bodyParser.json());

app.use('/apiuse', require('./apiuse.js')) //api利用　2024.06.01

app.use(session({
    secret: 'squirearchicalgijbsgo]b93dvnjiyre4e31qqz46n28',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 1000 }
}));

//app.get('/main/:userId/books/:bookId', (req, res) => {
//res.send(req.params)
// })


// app.get('/html/:course', (req,res) => {
//res.render(req.params.course);
//}); 

const DB_USER = "./user.db";

app.get('/', async (req, res) => {
    if (req.session.login) {
        const uid = req.session.uid;
        const db = new sqlite3.Database(DB_USER);

        try {
            // ログイン日検索
            const login_dates = await (() => {
                return new Promise((resolve, reject) => {
                    db.all("SELECT * from login_dates WHERE uid = ?",
                        [uid], (err, rows) => {
                            if (err) {
                                console.error(err);
                                reject(err);
                            } else {
                                // データ
                                let login_dates = [];
                                for (let i = 0; i < rows.length; i++) {
                                    login_dates[i] = rows[i].date;
                                }
                                resolve(login_dates);
                            }
                        });
                });
            })();

            db.close();

            console.log("@top page render > ", {
                name: req.session.name,
                loginDates: login_dates
            });

            res.render("main/main.ejs", {
                name: req.session.name,
                loginDates: login_dates
            });

        } catch (error) {

            db.close();
            console.error(error);
            res.render("main/index.ejs");

        }

    } else {

        res.render("main/index.ejs");

    }
});     //req,res→無名関数。もともとfunction(){}だったのが() => {}となっている()
// end→もうかえしませんよという意味。

//↓カレンダー下円形グラフ
app.get('/userprogress', (req, res) => {
    const uid = req.session.uid;

    if (uid) {
        const db = new sqlite3.Database(DB_USER);

        // 進捗取得
        const COURSE_CONTENT_AMOUNT = {
            "css": 8,
            "html": 9,
            "js": 0
        }

        db.all("SELECT course_type, count(course_id) AS completed from study_record WHERE uid = ? GROUP BY course_type",
            [uid], (err, rows) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    const row_including_amount = rows.map(row => {
                        row.amount = COURSE_CONTENT_AMOUNT[row.course_type];
                        return row
                    });
                    res.json(row_including_amount);
                }
            });
    }
})

// 一時的な　テンプレ作り用
app.get('/template', (req, res) => {
    res.render('HTML_course/layout-ex.ejs');
});

app.get('/contents/:type/:course', (req, res) => {

    // ↓course-list.jsonを展開
    const courseMeta = require('./course-list.json');
    
    // ↓URL変数とフォルダ名の変換用テーブル
    const TYPES = {
        html: "HTML_course",
        css: "CSS_course",
        js: "JS_course",
        main: "main",
        header: "header"
    }

    // ↓ログイン中 かつ req.params.typeが適切 の場合
    if (req.session.login && TYPES.hasOwnProperty(req.params.type)) {

        const course_type_dir = TYPES[req.params.type]; // ←フォルダ名

        // ↓req.params.course から末尾の数字を取り出す
        let matchResult = req.params.course.match(/\d+$/);

        // ↓マッチがあればその数字を、なければ req.params.course をそのまま、idとする
        const course_id = (matchResult) ? matchResult[0] : req.params.course;

        const course_id_black_list = ["0"]; // ←記録除外id リスト

        if (!course_id_black_list.includes(course_id)) {
            // ↓学習記録 書き込み
            const db = new sqlite3.Database(DB_USER);
            db.run(
                "INSERT INTO study_record (uid, course_type, course_id) VALUES(?, ?, ?)",
                [req.session.uid, req.params.type, course_id],
                (err) => { db.close(); }
            );
        }

        const filepath = course_type_dir + "/" + req.params.course;

        res.render(filepath, {
            name: req.session.name,
            courseName: req.params.course, // コースID
            courseMeta, // コースタイトル
        });
    } else {
        res.redirect("/");
    }
});
// ↑hrefで呼び出す際、<a href="/contents/(ejsのファイル名)">とする　2023.08.30

// ↓ログインする時にうごく
app.post('/login', (req, res) => {
    console.log('login data:', req.body.uid, req.body.passwd);

    // パスワードのハッシュ処理
    const hashedPWD = crypto.createHash('sha256')
        .update(req.body.passwd)
        .digest('hex');

    console.log('login data:', req.body.uid, hashedPWD);

    const db = new sqlite3.Database('./user.db');
    db.get("SELECT * FROM users WHERE name = ? AND passwd = ?",
        [req.body.uid, hashedPWD], (err, row) => {
            if (!row) {
                // ↓失敗
                console.log(err);
                res.redirect("/register");
            } else {
                // ↓成功
                req.session.login = true;
                req.session.name = req.body.uid;
                req.session.uid = row.uid;

                // ログイン日記録
                db.run("INSERT INTO login_dates VALUES (?, date())", [row.uid], (err) => { db.close(); });

                // リダイレクト
                res.redirect("/"); //正しいパスワードを入力した時にmain pageに戻る
                console.log(row);
            }
        });
});

app.get('/logout', (req, res) => {
    req.session.login = false;
    req.session.name = "";
    res.redirect("/");
});


//bodyのうしろはhtmlで指定したnameの名前
app.get('/register', (req, res) => {
    res.render("main/register.ejs");
});

app.post('/new', (req, res) => {

    // パスワードのハッシュ処理
    const hashedPWD = crypto.createHash('sha256')
        .update(req.body.passwd)
        .digest('hex');

    const db = new sqlite3.Database('./user.db'); //データベースを開くやつ
    db.get("SELECT count(*) FROM users", (err, count) => {
        console.log(count["count(*)"]);
        db.run("INSERT INTO users VALUES(?,?,?,?)",
            Number(count["count(*)"])+2, // uid は count+2
            req.body.uid, hashedPWD, req.body.email
        );
    });
    db.close();
    res.redirect('/');
});
//↑新規会員登録で、送信ボタンを押した時にそれがデータベースとして登録される。

app.post('/api/update', (req, res) => {
    if (req.session.login) {
    }
}); //ログインしないと使えない機能を使おうとしていた時、loginのsessionを確認しようね、というもの。

app.get('/users', (req, res) => {
    res.end("Hello,Users");
});



app.listen(8080, () => { //8080はポート番号
    console.log("Server Start");
});

