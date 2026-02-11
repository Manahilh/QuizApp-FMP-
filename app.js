window.addEventListener("load", () => {
    // 🔐 1. AUTH PROTECTION & REDIRECTION
    auth.onAuthStateChanged(user => {
        const path = window.location.pathname;
        
        const isOnLoginPage = path.includes("index.html") || path.endsWith("/");
        const isOnQuizPage = path.includes("quiz.html");

        if (user) {
            if (isOnLoginPage) {
                window.location.href = "quiz.html";
            }

            
            const userDisp = document.getElementById("user");
            if (userDisp) {
                userDisp.innerText = "Welcome " + (user.email || user.phoneNumber || "User");
            }

            
            if (document.getElementById("ques")) {
                loadQuestion();
                startTimer();
            }
        } else {
          
            if (isOnQuizPage) {
                window.location.href = "index.html";
            }
        }
    });

    // 📚 2. QUESTIONS DATA
    const questions = [
        { q: "How many elements are in the periodic table?", o1: "118", o2: "115", o3: "120", ans: "118" },
        { q: "Which planet is closest to the sun?", o1: "Venus", o2: "Mercury", o3: "Mars", ans: "Mercury" },
        { q: "How many bones do we have in an ear?", o1: "5", o2: "2", o3: "3", ans: "3" },
        { q: "What is the chemical element with the symbol Fe?", o1: "Iron", o2: "Gold", o3: "Silver", ans: "Iron" },
        { q: "What is the smallest unit of matter?", o1: "Molecule", o2: "Atom", o3: "Electron", ans: "Atom" },
        { q: "What is the process by which a liquid changes into a gas?", o1: "Freezing", o2: "Condensation", o3: "Evaporation", ans: "Evaporation" },
        { q: "Which planet has the most moons?", o1: "Jupiter", o2: "Saturn", o3: "Uranus", ans: "Saturn" },
        { q: "Where is the strongest human muscle located?", o1: "Jaw", o2: "Leg", o3: "Heart", ans: "Jaw" },
        { q: "Which is the only body part that is fully grown from birth?", o1: "Ears", o2: "Nose", o3: "Eyes", ans: "Eyes" },
        { q: "What is the outermost layer of the Earth’s atmosphere called?", o1: "Stratosphere", o2: "Exosphere", o3: "Mesosphere", ans: "Exosphere" },
        { q: "What is the process by which plants convert sunlight to energy?", o1: "Photosynthesis", o2: "Respiration", o3: "Osmosis", ans: "Photosynthesis" },
        { q: "What scientific theory proposed that Earth revolves around the sun?", o1: "Evolution", o2: "Heliocentrism", o3: "Big Bang", ans: "Heliocentrism" }
    ];

    let index = 0; 
    let score = 0; 
    let timeLeft = 240; 

    // 🖥️ 3. LOAD QUESTION
    function loadQuestion() {
        const payload = questions[index];
        if (!payload) return;

        document.getElementById("ques").innerText = payload.q;
        document.getElementById("opt1").innerText = payload.o1;
        document.getElementById("opt2").innerText = payload.o2;
        document.getElementById("opt3").innerText = payload.o3;

        document.getElementById("btn").disabled = true;

        const radioButtons = document.getElementsByClassName("options");
        for (let radio of radioButtons) {
            radio.checked = false;
        }
    }

    // ⏱️ 4. TIMER
    function startTimer() {
        if (window.timerInterval) clearInterval(window.timerInterval);
        window.timerInterval = setInterval(() => {
            let mins = Math.floor(timeLeft / 60);
            let secs = timeLeft % 60;
            if (secs < 10) secs = "0" + secs;

            const timerDisp = document.getElementById("timer");
            if (timerDisp) timerDisp.innerText = mins + ":" + secs;

            timeLeft--;

            if (timeLeft < 0) {
                clearInterval(window.timerInterval);
                alert("Time's Up!");
                window.location.reload();
            }
        }, 1000);
    }

    window.enableNext = () => {
        document.getElementById("btn").disabled = false;
    };

    // ➡️ 5. NEXT QUESTION & SAVE TO DATABASE
    window.nextQuestion = () => {
        const selectedOption = document.querySelector('input[name="quiz"]:checked');
        if (!selectedOption) return;

        const selectedText = document.getElementById("opt" + selectedOption.value).innerText;
        if (selectedText === questions[index].ans) {
            score++;
        }

        index++;

        if (index < questions.length) {
            loadQuestion();
        } else {
            clearInterval(window.timerInterval);
            const user = auth.currentUser;
            
            if (user) {
                // Realtime Database mein score push karna
                database.ref('scores/' + user.uid).push({
                    email: user.email || user.phoneNumber,
                    score: score,
                    total: questions.length,
                    timestamp: Date.now()
                }).then(() => {
                    alert("Quiz Finished! Score " + score + " saved to Database.");
                    window.location.href = "index.html";
                }).catch(e => alert("Error saving score: " + e.message));
            } else {
                alert("Quiz Finished! Your Score: " + score);
                window.location.href = "index.html";
            }
        }
    };

    // 🔑 6. LOGIN / LOGOUT FUNCTIONS
    window.loginWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider)
            .catch(error => alert("Google Login Error: " + error.message));
    };

    window.showPhoneBox = () => {
        document.getElementById("login-options").style.display = "none";
        document.getElementById("phoneBox").style.display = "block";
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier("recaptcha-container");
        }
    };

    window.sendOTP = () => {
        const ph = document.getElementById("phone").value;
        auth.signInWithPhoneNumber(ph, window.recaptchaVerifier)
            .then(res => { 
                window.confirmationResult = res; 
                alert("OTP Sent!"); 
            })
            .catch(e => alert(e.message));
    };

    window.verifyOTP = () => {
        const code = document.getElementById("otp").value;
        window.confirmationResult.confirm(code)
            .catch(() => alert("Invalid OTP"));
    };

    window.logout = () => {
        auth.signOut().then(() => {
            window.location.href = "index.html";
        });
    };
});
