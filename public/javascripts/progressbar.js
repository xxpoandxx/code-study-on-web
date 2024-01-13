fetch("/userprogress", {method: "GET"})
    .then(response => {
        if (!response.ok) console.error("fetch failed");
        return response.json();
    })
    .then(data => {
        let course_progress = [0, 0, 0]; // html, css, js
        for (const obj of data) {
            if (obj.course_type == "html") {course_progress[0] = Math.floor(obj.completed / obj.amount * 100);}
            if (obj.course_type == "css") {course_progress[1] = Math.floor(obj.completed / obj.amount * 100);}
            if (obj.course_type == "js") {course_progress[2] = Math.floor(obj.completed / obj.amount * 100);}
        }

        console.log("data = ", data);
        console.log("course_progress (html, css, js) = ", course_progress);

        const config = [
            {selecter: ".first", color: "#12a568", rate: course_progress[0]},
            {selecter: ".second", color: "#c3a40a", rate: course_progress[1]},
            {selecter: ".third", color: "#d5525f", rate: course_progress[2]}
        ];
        
        for (const obj of config) {
            document.querySelector(obj.selecter).style.backgroundImage = `radial-gradient(#f2f2f2 60%, transparent 61%), conic-gradient(${obj.color} 0% ${obj.rate}%, #d9d9d9 ${obj.rate}% 100%)`;
        }
    });

 