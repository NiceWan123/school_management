  // Temporary storage for created accounts
        let accounts = [];

        // Elements
        const lrnInput = document.getElementById('lrnNumber');
        const passwordInput = document.getElementById('password');
        const form = document.getElementById('studentAccountForm');
        const resultDiv = document.getElementById('student-result');
        const numAccountsDiv = document.getElementById('numAccounts');
        const accountsListTbody = document.getElementById('accountsList');
        const accountsListWrapper = document.getElementById('accountsListWrapper');

        // Auto-set password to last digit of LRN
        lrnInput.addEventListener('input', function() {
            // Allow only numbers
            this.value = this.value.replace(/\D/g, '').slice(0, 12);
            // Set password to last digit of LRN (if present)
            if(this.value.length > 0) {
                passwordInput.value = this.value[this.value.length - 1];
            } else {
                passwordInput.value = '';
            }
        });

        // Form submission
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            // Validate LRN: must be number and up to 12 digits
            const lrnVal = lrnInput.value.trim();
            if (!/^\d{1,12}$/.test(lrnVal)) {
                resultDiv.textContent = "LRN Number must be numeric and up to 12 digits.";
                lrnInput.focus();
                return;
            }

            // Gather data
            const name = document.getElementById('studentName').value.trim();
            const email = document.getElementById('studentEmail').value.trim();
            const grade = document.getElementById('studentGrade').value;
            const password = passwordInput.value;

            // Prevent duplicate LRN
            if (accounts.some(acc => acc.lrn === lrnVal)) {
                resultDiv.textContent = "An account with this LRN already exists.";
                return;
            }

            // Add to temporary storage
            const acct = {
                lrn: lrnVal,
                name,
                email,
                grade,
                password
            };
            accounts.push(acct);

            // Update display
            updateAccountsDisplay();

            // Clear form
            form.reset();
            passwordInput.value = '';
            resultDiv.textContent = "Account created successfully!";
        });

        function updateAccountsDisplay() {
            numAccountsDiv.textContent = "Accounts Created: " + accounts.length;
            accountsListTbody.innerHTML = '';
            accounts.forEach((acc, idx) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${idx + 1}</td>
                    <td>${acc.lrn}</td>
                    <td>${acc.name}</td>
                    <td>${acc.email}</td>
                    <td>Grade ${acc.grade}</td>
                    <td>${acc.password}</td>
                `;
                accountsListTbody.appendChild(row);
            });
            accountsListWrapper.classList.toggle('hidden', accounts.length === 0);
        }