document.addEventListener("DOMContentLoaded", function() {
    const dropdown = document.getElementById("options-dropdown");
    const databaseOptions = document.getElementById("app-options");

    dropdown.addEventListener("change", function() {
        handleDropdownChange();
    });

    function handleDropdownChange() {
        console.log("type2",dropdown.value)
        if (dropdown.value === "app") {
            databaseOptions.style.display = "block";
        } else {
            databaseOptions.style.display = "none";
        }
    }

    window.handleAppsOption = function(option) {
        console.log("Selected application option:", option);

        fetch('/connect_app', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ app_type: option })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert(data.message);
            } else if (data.error) {
                alert(data.error);
            }
        })
        .catch(error => console.error('Error:', error));
    }
});
