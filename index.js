const express = require('express'); //2023,07,06 13:51パッケージの読み込み
const sqlite3 = require('sqlite3'); //sqlite3の読み込み
const session = require('express-session'); 
const app = express(); //expressの使う準備ができた状態
app.set("view engine", "ejs"); //テンプレートエンジンの使用
app.use(express.urlencoded()); //formで送ったデータをnodeのなかで扱えるように成形してくれるやつ

app.use(express.static("public"));

app.use(session({
    secret: 'squirearchicalgijbsgo]b93dvnjiyre4e31qqz46n28',
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 60 * 60 * 1000}
}));

//app.get('/main/:userId/books/:bookId', (req, res) => {
    //res.send(req.params)
 // })


// app.get('/html/:course', (req,res) => {
    //res.render(req.params.course);
//}); 

const DB_USER = "./user.db";

app.get('/', (req,res) => {
    if(req.session.login) {
        // ログイン日検索
        const db = new sqlite3.Database(DB_USER);
        db.all("SELECT * from login_dates WHERE uid = ?", 
        [req.session.uid], (err, rows) => {
            console.log("rows: ", rows);
            if (err) console.error(err);
            else {
                // データ
                let login_dates = [];
                for (let i = 0; i < rows.length; i++) {
                    // 
                    console.log("rows[i]: ", i,  rows[i]);
                    login_dates[i] = rows[i].date;
                }
                console.log("login_dates: ", login_dates);
                res.render("main/main.ejs", {
                    name: req.session.name,
                    loginDates: login_dates
                });

            }
            
        });
    } else {
        res.render("main/index.ejs");
    }
});     //req,res→無名関数。もともとfunction(){}だったのが() => {}となっている()
// end→もうかえしませんよという意味。

app.get('/contents/:type/:course', (req,res) => {
    if(req.session.login){
        const types = {
            html: "HTML_course",
            css: "CSS_course",
            js: "JS_course",
            main: "main"
        }

        const filepath = types[req.params.type] + "/" + req.params.course;
        console.log("filepath: ", filepath);

        const db = new sqlite3.Database(DB_USER);
        db.run(
            "INSERT INTO study_record (uid, course_type, course_id) VALUES(?, ?, ?)",
            [req.session.uid, types[req.params.type], ])

        res.render(filepath, {name: req.session.name});
    } else {
        res.redirect("/");
    }
});
// ↑hrefで呼び出す際、<a href="/contents/(ejsのファイル名)">とする　2023.08.30

// ↓ログインする時にうごく
app.post('/login', (req,res) => {
    console.log(req.body.uid, req.body.passwd);
    const db = new sqlite3.Database('./user.db');
    db.get("SELECT * FROM users WHERE name = ? AND passwd = ?", 
    [req.body.uid, req.body.passwd], (err,row) =>{
        if(!row){
            // ↓失敗
            console.log(err);
            res.redirect("/register");
        } else {
            // ↓成功
            req.session.login = true;
            req.session.name = req.body.uid;
            req.session.uid = row.uid;

            // ログイン日記録
            db.run("INSERT INTO login_dates VALUES (?, date())", [row.uid], (err)=>{});
            db.close();

            // リダイレクト
            res.redirect("/"); //正しいパスワードを入力した時にmain pageに戻る
            console.log(row);
        }
    });
});

app.get('/logout',(req,res) =>{
    req.session.login = false;
    req.session.name = "";
    res.redirect("/");
});


//bodyのうしろはhtmlで指定したnameの名前
app.get('/register',(req,res) => {
    res.render("main/register.ejs");
});

app.post('/new',(req,res) => {
    
    const db = new sqlite3.Database('./user.db'); //データベースを開くやつ
    db.get("SELECT count(*) FROM users", (err,count) =>{
        console.log(count["count(*)"]);
        db.run("INSERT INTO users VALUES(?,?,?)",
        count["count(*)"], req.body.uid, req.body.password
        );
});
db.close();
res.redirect('/');
});
//↑新規会員登録で、送信ボタンを押した時にそれがデータベースとして登録される。

app.post('/api/update',(req,res) =>{
    if(req.session.login) {
    }
}); //ログインしないと使えない機能を使おうとしていた時、loginのsessionを確認しようね、というもの。

app.get('/users', (req,res) =>{
    res.end("Hello,Users");
});


app.listen(8080, () => { //8080はポート番号
    console.log("Server Start");
});

