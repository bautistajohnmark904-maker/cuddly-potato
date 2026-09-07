const btn = document.getElementById('clickBtn');
const msg = document.getElementById('message');

let clickCount = 0;

btn.addEventListener('click', function() {
    clickCount++;
    msg.textContent = `Success! Dynamic JavaScript is working perfectly! (Clicked ${clickCount}x)`;
    msg.style.opacity = 0;
    setTimeout(() => {
        msg.style.opacity = 1;
    }, 150);
});