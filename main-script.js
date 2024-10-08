
let currentFileId = null;
let selectedOption = 'search';  // Default option

// Function to handle dropdown change
function handleDropdownChange() {
    const dropdown = document.getElementById('options-dropdown');
    selectedOption = dropdown.value;
}

function uploadFile() {
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        const chatBody = document.getElementById('messageFormeight');
        chatBody.innerHTML += `
            <div class="response-message d-flex justify-content-start mb-4">
                <div class="img_cont_msg">
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTX0mKrzeX319CWVO-zz3O2uf9D7zdWMd_s5A&s.png" class="rounded-circle user_img_msg">
                </div>
                <div class="msg_cotainer">
                    ${data.message || 'File uploaded successfully!'}
                    <span class="msg_time">${getCurrentTimestamp()}</span>
                </div>
            </div>
        `;
        currentFileId = data.file_id;  // Store the file_id
        document.getElementById('file-input').value = '';  // Clear file input after successful upload
        chatBody.scrollTop = chatBody.scrollHeight;
    })
    .catch(error => console.error('Error uploading file:', error));
}

function sendMessage() {
    const userInput = document.getElementById('user-input');
    const query = userInput.value.trim();
    if (!query) return;

    const chatBody = document.getElementById('messageFormeight');

    // Add user query to chat body
    chatBody.insertAdjacentHTML('beforeend', `
        <div class="d-flex justify-content-end mb-4">
            <div class="msg_cotainer_send">
                ${query}
                <span class="msg_time_send">${getCurrentTimestamp()}</span>
            </div>
            <div class="img_cont_msg">
                <img src="https://i.ibb.co/d5b84Xw/Untitled-design.png" class="rounded-circle user_img_msg">
            </div>
        </div>
    `);

    // Clear user input
    userInput.value = '';

    // Scroll to the bottom of the chat
    chatBody.scrollTop = chatBody.scrollHeight;

    // Make API call based on selected option
    const endpoint = (selectedOption === 'connect-app' || selectedOption === 'connect-db') ? '/db_chat' : '/chat';
    fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: query, file_id: currentFileId })
    })
    .then(response => response.json())
    .then(data => {
        // Add bot response to chat body
        chatBody.insertAdjacentHTML('beforeend', `
            <div class="d-flex justify-content-start mb-4">
                <div class="img_cont_msg">
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTX0mKrzeX319CWVO-zz3O2uf9D7zdWMd_s5A&s.png" class="rounded-circle user_img_msg">
                </div>
                <div class="msg_cotainer">
                    ${data.response || 'Sorry, I cannot find the information you\'re looking for.'}
                    <span class="msg_time">${getCurrentTimestamp()}</span>
                </div>
            </div>
        `);

        // If the selected option is 'connect' and there's a summary, display it
        if (selectedOption === 'connect' && data.summary) {
            chatBody.insertAdjacentHTML('beforeend', `
                <div class="d-flex justify-content-start mb-4">
                    <div class="img_cont_msg">
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTX0mKrzeX319CWVO-zz3O2uf9D7zdWMd_s5A&s.png" class="rounded-circle user_img_msg">
                    </div>
                    <div class="msg_cotainer">
                        <strong>Summary (DB Connection):</strong> ${data.summary}
                        <span class="msg_time">${getCurrentTimestamp()}</span>
                    </div>
                </div>
            `);
        } else if (selectedOption === 'app' && data.summary) {
            chatBody.insertAdjacentHTML('beforeend', `
                <div class="d-flex justify-content-start mb-4">
                    <div class="img_cont_msg">
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTX0mKrzeX319CWVO-zz3O2uf9D7zdWMd_s5A&s.png" class="rounded-circle user_img_msg">
                    </div>
                    <div class="msg_cotainer">
                        <strong>Summary (App Connection):</strong> ${data.summary}
                        <span class="msg_time">${getCurrentTimestamp()}</span>
                    </div>
                </div>
            `);
        }
        

        // Scroll to the bottom of the chat
        chatBody.scrollTop = chatBody.scrollHeight;
    })
    .catch(error => console.error('Error sending message:', error));
}



function handleKeyPress(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
    }
}

function getCurrentTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return timestamp;
}
