window.addEventListener("load", () => {
    // 🔐 1. AUTHENTICATION & PAGE PROTECTION
    // Triggers when user logs in or out
    auth.onAuthStateChanged(user => {
        const path = window.location.pathname;
        const isOnLoginPage = path.includes("login.html");
        const isOnQuizPage = path.includes("index.html") || path === "/";

        if (user) {
            // User is logged in
            console.log("User is logged in:", user.email);

            // Redirect to quiz page if currently on login page
            if (isOnLoginPage) {
                window.location.href = "index.html";
            }

            // Show User Info on Quiz Page
            const userDisp = document.getElementById("user");
            if (userDisp) {
                userDisp.innerText = "Welcome " + (user.email || user.phoneNumber || "User");
            }

            // Start Quiz if we are on the quiz page
            if (document.getElementById("ques")) {
                loadQuestion();
                startTimer();
            }

        } else {
            // User is logged out
            console.log("User is not logged in");

            // Redirect to login page if currently on quiz page
            if (isOnQuizPage) {
                window.location.href = "login.html";
            }
        }
    });

    // 📚 2. QUIZ DATA
    // Simple list of questions
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

    // 🔢 3. VARIABLES
    let index = 0;       // Current question number (starts at 0)
    let score = 0;       // User's score
    let timeLeft = 240;  // 4 minutes (in seconds)

    // 🖥️ 4. DISPLAY QUESTION FUNCTION
    function loadQuestion() {
        const payload = questions[index]; // Get current question

        // Ensure question exists
        if (!payload) return;

        // Display Question Text
        document.getElementById("ques").innerText = payload.q;

        // Display Options
        document.getElementById("opt1").innerText = payload.o1;
        document.getElementById("opt2").innerText = payload.o2;
        document.getElementById("opt3").innerText = payload.o3;

        // Disable 'Next' button until user picks an answer
        document.getElementById("btn").disabled = true;

        // Reset all radio buttons (unselect them)
        const radioButtons = document.getElementsByClassName("options");
        for (let radio of radioButtons) {
            radio.checked = false;
        }
    }

    // ⏱️ 5. TIMER FUNCTION
    function startTimer() {
        // Run code every 1 second (1000 ms)
        window.timerInterval = setInterval(() => {

            // Calculate minutes and seconds
            let mins = Math.floor(timeLeft / 60);
            let secs = timeLeft % 60;

            // Add leading zero if seconds < 10 (e.g., 4:09)
            if (secs < 10) secs = "0" + secs;

            // Show time on screen
            document.getElementById("timer").innerText = mins + ":" + secs;

            // Decrease time
            timeLeft--;

            // TIME UP!
            if (timeLeft < 0) {
                clearInterval(window.timerInterval);
                alert("Time's Up!");
                window.location.reload();
            }

        }, 1000);
    }

    // ✅ 6. ENABLE NEXT BUTTON
    // Called when user clicks any radio button option
    window.enableNext = () => {
        document.getElementById("btn").disabled = false;
    };

    // ➡️ 7. NEXT QUESTION LOGIC
    window.nextQuestion = () => {
        // Find the checked radio button
        // 'querySelector' finds the first element matching the CSS selector
        const selectedOption = document.querySelector('input[name="quiz"]:checked');

        if (!selectedOption) {
            alert("Please select an option!");
            return;
        }

        // Check if answer is correct
        // We get the selected value (1, 2, or 3) and find the text inside the label (opt1, opt2, opt3)
        const selectedValue = selectedOption.value;
        const selectedLabelId = "opt" + selectedValue;
        const selectedText = document.getElementById(selectedLabelId).innerText;

        // Compare selected text with correct answer
        if (selectedText === questions[index].ans) {
            score++;
        }

        // Go to next question
        index++;

        // If there are more questions, load the next one
        if (index < questions.length) {
            loadQuestion();
        } else {
            // No more questions -> Finish Quiz
            clearInterval(window.timerInterval);
            alert("Quiz Finished! Your Score: " + score + " / " + questions.length);
            window.location.href = "index.html"; // Reload to restart
        }
    };


    // 🔑 8. LOGIN & LOGOUT FUNCTIONS

    // Login with Google
    window.loginWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider)
            .catch(error => { alert(error.message); });
    };

    // Show Phone Login Options
    window.showPhoneBox = () => {
        document.getElementById("login-options").style.display = "none";
        document.getElementById("phoneBox").style.display = "block";

        // Setup Recaptcha (Simpler check)
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier("recaptcha-container");
        }
    };

    // Send OTP Code
    window.sendOTP = () => {
        const phoneNumber = document.getElementById("phone").value;

        // Firebase Phone Auth
        auth.signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier)
            .then(confirmationResult => {
                window.confirmationResult = confirmationResult;
                alert("OTP Sent to " + phoneNumber);
            })
            .catch(error => { alert("Error: " + error.message); });
    };

    // Verify OTP Code
    window.verifyOTP = () => {
        const otpCode = document.getElementById("otp").value;

        window.confirmationResult.confirm(otpCode)
            .then(() => {
                // Success! Auth state change listener will handle redirect
                console.log("Phone verified!");
            })
            .catch(() => { alert("Invalid OTP. Please try again."); });
    };

    // Logout
    window.logout = () => {
        auth.signOut().then(() => {
            window.location.href = "login.html";
        });
    };
});