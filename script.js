const btn = document.getElementById('clickBtn');
const msg = document.getElementById('message');
const clickCountDisplay = document.getElementById('clickCount');
const statusText = document.getElementById('statusText');

let count = 0;

const successMessages = [
    "Awesome! Dynamic function executed.",
    "Great job! JavaScript is fully working.",
    "Fantastic! Event listener triggered successfully.",
    "Boom! Clean UI and logic combined."
];

btn.addEventListener('click', function() {
    count++;
    clickCountDisplay.textContent = count;
    
    // Random message picker
    const randomMsg = successMessages[Math.floor(Math.random() * successMessages.length)];
    msg.textContent = randomMsg;
    
    // Status visual update
    statusText.textContent = "Updating...";
    statusText.style.color = "#d97706";
    
    setTimeout(() => {
        statusText.textContent = "Active";
        statusText.style.color = "#16a34a";
    }, 300);
});