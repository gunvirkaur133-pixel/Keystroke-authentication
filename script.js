let firstPassword = null;
let timings = [];

// Capture typing on current password field
document.addEventListener("DOMContentLoaded", () => {
const passField = document.querySelector("input[type='password']");
const userField = document.querySelector("input[type='text']");

// ENTER key navigation
if (userField && passField) { 
    userField.addEventListener("keydown", (e) => {
         if (e.key === "Enter") passField.focus(); 
    }); 
    passField.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {

        // If on register page
        if (window.location.pathname.includes("register.html")) {
            register();
        }

        // If on login page
        else if (window.location.pathname.includes("index.html")) {
            login();
        }
    }
 }); 
}



// Timing capture
if (passField) {
    passField.addEventListener("keydown", () => timings.push(Date.now()));
    passField.addEventListener("keyup", () => timings.push(Date.now()));
}

// Dashboard load
if (window.location.pathname.includes("dashboard.html")) {
    const user = localStorage.getItem("currentUser");
    const accuracy = localStorage.getItem("accuracy");

    document.getElementById("welcomeUser").innerText = "Hello, " + user;
    document.getElementById("bar").style.width = accuracy + "%";
    document.getElementById("accuracyText").innerText = accuracy + "%";

    const data = JSON.parse(localStorage.getItem(user));
    const storedPattern = data.pattern;
    const lastPattern = JSON.parse(localStorage.getItem("lastPattern") || "[]");

    // Compare graph (two lines)
    new Chart(document.getElementById("chart"), {
        type: 'line',
        data: {
            labels: storedPattern.map((_, i) => i + 1),
            datasets: [
                {
                    label: "Stored Pattern",
                    data: storedPattern,
                    borderColor: "#00ffcc",
                    tension: 0.3
                },
                {
                    label: "Current Pattern",
                    data: lastPattern,
                    borderColor: "#ff6b6b",
                    tension: 0.3
                }
            ]
        }
    });
}

});

function calculatePattern(arr) {
if (arr.length < 2) return [];
const out = [];
for (let i = 1; i < arr.length; i++) {
out.push(arr[i] - arr[i - 1]);
}
return out;
}

// REGISTER
let trainingPatterns = [];

function register() {

let user = document.getElementById("regUser").value.trim();
let pass = document.getElementById("regPass").value;
// 🔥 FIRST ATTEMPT → STORE PASSWORD
if (trainingPatterns.length === 0) {
    firstPassword = pass;
}

// 🔥 CHECK PASSWORD MATCH IN NEXT ATTEMPTS
if (trainingPatterns.length > 0 && pass !== firstPassword) {
    alert("Password does not match previous entry ❌");
    timings = [];   // reset typing capture
    return;
}

let pattern = calculatePattern(timings);

if (!user || !pass || pattern.length === 0) {
    alert("Fill properly & type password!");
    return;
}

trainingPatterns.push(pattern);

// 🔥 Show training progress
alert("Training " + trainingPatterns.length + " / 3 done");

timings = [];
document.getElementById("regPass").value = "";
document.getElementById("regPass").focus();


// Stop until 3 attempts
if (trainingPatterns.length < 3) {
    return;
}

// 🔥 Average pattern after 3 attempts
let avgPattern = trainingPatterns[0].map((_, i) => {
    return (
        (trainingPatterns[0][i] +
         trainingPatterns[1][i] +
         trainingPatterns[2][i]) / 3
    );
});

localStorage.setItem(user, JSON.stringify({
    password: pass,
    pattern: avgPattern
}));

alert("Training Complete ✅ Registered!");

trainingPatterns = [];
firstPassword = null;

window.location.href = "index.html";

}


// LOGIN with loader + compare graph
function login() {
const loader = document.getElementById("loader");
loader.style.display = "flex";

setTimeout(() => {
    const user = document.getElementById("logUser").value.trim();
    const pass = document.getElementById("logPass").value;

    const data = JSON.parse(localStorage.getItem(user));

    if (!data) {
        loader.style.display = "none";
        document.getElementById("result").innerText = "User not found ❌";
        return;
    }

    const currentPattern = calculatePattern(timings);
    if (currentPattern.length === 0) {
        loader.style.display = "none";
        document.getElementById("result").innerText = "Type password properly!";
        return;
    }

    const storedPattern = data.pattern;

    let diff = 0;
    const count = Math.min(storedPattern.length, currentPattern.length);

    for (let i = 0; i < count; i++) {
        diff += Math.abs(storedPattern[i] - currentPattern[i]);
    }

    const avg = diff / count;
    const accuracy = Math.max(0, 100 - avg);

    if (pass === data.password && avg < 160) {
        localStorage.setItem("currentUser", user);
        localStorage.setItem("accuracy", accuracy.toFixed(2));
        localStorage.setItem("lastPattern", JSON.stringify(currentPattern));

        timings = [];
        window.location.href = "dashboard.html";
    } else {
        loader.style.display = "none";
        document.getElementById("result").innerText = "Access Denied ❌";
        timings = [];
    }
}, 1200); // animation delay

}

function goRegister() { window.location.href = "register.html"; }
function goLogin() { window.location.href = "index.html"; }
function logout() { window.location.href = "index.html"; }
