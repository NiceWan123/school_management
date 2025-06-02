document.getElementById('enrollmentForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Example simple validation
    const lrn = document.querySelector('input[name="lrn"]').value;
    if (lrn && !/^\d{12}$/.test(lrn)) {
        showResult('LRN must be a 12-digit number.', true);
        return;
    }

    // Display a simple message or do further processing here
    showResult('Enrollment form submitted successfully! (Sample only, data not actually saved.)');

    // Optionally, clear the form after submission:
    // document.getElementById('enrollmentForm').reset();
});

function showResult(msg, isError) {
    const res = document.getElementById('formResult');
    res.textContent = msg;
    res.style.color = isError ? '#d32f2f' : '#2e7d32';
}