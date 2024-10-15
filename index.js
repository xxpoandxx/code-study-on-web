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

const database = require('./database.js');

const DB_USER = "./user.db";
const DB_EDITOR = "./editor_page.db";

app.get('/', async (req, res) => {
    if (req.session.login) {
        // ログイン済み: トップページ表示
        const uid = req.session.uid;
        const db = new database.User();
        // ログイン日検索
        const loginDatesRows = await db.all('SELECT * from login_dates WHERE uid = ?', [uid]);
        let login_dates = [];
        for (let i = 0; i < loginDatesRows.length; i++) {
            login_dates[i] = loginDatesRows[i].date;
        }

        // 前回の学習履歴
        const latestStudyRecord = await db.get(`
            SELECT * FROM study_record
                WHERE uid = ? AND updated = (
                    SELECT MAX(updated) FROM study_record WHERE uid = ?
            )`,
            [uid, uid]
        );

        let latestCourse;
        if (latestStudyRecord) {
            latestCourse = await db.get(
                'SELECT * FROM course_list WHERE sn = ?',
                [latestStudyRecord.course_sn]
            );
        }

        res.render("main/main.ejs", {
            name: req.session.name,
            loginDates: login_dates,
            LATEST_RECORD: latestStudyRecord,
            LATEST_COURSE: latestCourse,
        });
        db.close();
    } else {
        // 未ログイン: ログインページ表示
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

        db.all("SELECT course_type, count(course_sn) AS completed from study_record WHERE uid = ? GROUP BY course_type",
            [uid], (err, rows) => {
                if (err) {
                    console.error(err);
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
    const data = COURSE_LIST['html']['html3-ex1'];
    
    res.render('HTML_course/layout-ex.ejs', {
        title: data.title,
        talks: data.talks,
    });
});

// パスが /contents/... のものはすべて最初にここを通る
app.use('/contents', (req, res, next) => {
    // ログインチェック: 未ログインのときトップページへ
    if (!req.session.login) return res.redirect("/");
    // ログイン済みのときは処理を続行
    next();
});

// 演習コンテンツ表示
app.get('/contents/:type/ex/:id', async (req, res) => {
    const courseType = req.params.type;
    const courseId = req.params.id;

    const db = new database.EditorPage();
    const exercise = await db.get('SELECT * FROM exercise WHERE course_id = ?', courseId);
    const talks = await db.all('SELECT * FROM talks WHERE course_id = ?', courseId);
    res.render(`${courseType}/layout-ex.ejs`, {
        courseId,
        relations: {
            next: exercise.next,
            back: exercise.back,
        },
        aiPrompt: exercise.ai_prompt.replaceAll('`','^'),
        title: exercise.title,
        talks
    });
    db.close();
});

// コースごとのコンテンツリストを表示
app.get('/contents/:type/list', async (req, res) => {
    const type = req.params.type;   // コースタイプ: html/css/js
    const db = new database.User();
    // コースのメタデータの配列
    const courses = await db.all('SELECT * FROM course_list WHERE type = ? ORDER BY idx', type);
    res.render(`${type}/list.ejs`, {
        COURSES: courses,
    });
    db.close();
});

// コースコンテンツ表示
app.get('/contents/:type/:index', async (req, res) => {
    // ログインチェック
    const type = req.params.type;   // コースタイプ: html/css/js/...
    const idx = req.params.index;   // コースインデックス: 1/2/3..
    const db = new database.User();
    // コースのメタデータ
    const course = await db.get('SELECT * FROM course_list WHERE (type, idx) = (?, ?)', [ type, idx ]);
    const max = await db.get('SELECT MAX(idx) AS max FROM course_list WHERE type = ?', type);
    const courseMaxIdx = Number(max.max);
    
    // ↓学習記録 書き込み
    db.run(
        'INSERT INTO study_record(uid, course_type, course_sn) VALUES(?, ?, ?)',
        [req.session.uid, type, course.sn]
    );

    // レンダリングするファイルのパス
    let filePath = '';

    // コースタイプが html, css, js と、それ以外のとき、DB の file カラムのデータ形式が変わるため分岐
    if (['html', 'css', 'js'].includes(type)) {
        filePath = `${type}/${course.file}.ejs`;
    } else {
        filePath = `${course.file}.ejs`;
    }
    res.render(filePath, {
        name: req.session.name,
        COURSE: course,
        COURSE_MAX: courseMaxIdx,
    });
    db.close();
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

