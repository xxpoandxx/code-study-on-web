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
const DB_EDITOR = "./editor_page.db";

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

            // 前回の学習履歴
            const lastStudy = await (() => {
                return new Promise((resolve, reject) => {
                    db.get("SELECT * FROM study_record WHERE uid = ? ORDER BY 'update' DESC",
                        [uid], (err, row) => {
                            if (err) {
                                console.error(err);
                                reject(err);
                            } else {
                                // データ
                                resolve(row);
                            }
                        });
                });
            })();

            db.close();

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

app.get('/exercise/:id', (req, res) => {
    const courseId = req.params.id;

    const db = new sqlite3.Database(DB_EDITOR);
    db.get(
        'SELECT * FROM exercise WHERE course_id = ?',
        courseId,
        (err, row) => {
            const title = row.title
            const next = row.next
            const back = row.back
            const ai_prompt = row.ai_prompt
            db.all(
                "SELECT * FROM talks WHERE course_id = ?",
                courseId,
                (err, rows) => {
                    const talks = rows;
                    res.render(`${TYPES[courseType]}/layout-ex.ejs`, {
                        courseId,
                        relations: {next,back},
                        aiPrompt: ai_prompt.replaceAll('`','^'),
                        title,
                        talks
                    });
                }
            );
        }
    );
});

app.get('/contents/:type/:courseIndex', async (req, res) => {
    const courseType = req.params.type;
    const courseIdx = req.params.courseIndex;

    // ↓ URL変数とフォルダ名の変換用テーブル
    const TYPES = {
        html: "HTML_course",
        css: "CSS_course",
        js: "JS_course",
        main: "main",
        header: "header"
    }

    const course = await (() => new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_EDITOR);
        db.get(
            "SELECT * FROM course_list WHERE (type, idx) = (?, ?)",
            [courseType, courseIdx],
            (err, row) => {
                if (!err) reject(err);
                else resolve(row);
                db.close();
            }
        );
    }))();

    console.log(req.params, course);

    if (!course) return res.redirect("/");
    
    // ↓ログイン中 かつ req.params.typeが適切 の場合
    if (!req.session.login) return res.redirect("/");

    // ↓学習記録 書き込み
    (new sqlite3.Database(DB_USER)).run(
        "INSERT INTO study_record (uid, course_type, course_sn) VALUES(?, ?, ?)",
        [req.session.uid, courseType, course.sn],
        (err) => { db.close(); }
    );

    const filePath = `${TYPES[courseType]}/${course.file}.ejs`;

    res.render(filePath, {
        name: req.session.name,
        courseName: `${course.idx}. ${course.title}`, // コースID
        courseMeta: COURSE_LIST, // コースタイトル
    });
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

