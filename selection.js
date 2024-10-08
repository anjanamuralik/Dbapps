document.addEventListener("DOMContentLoaded", function() {
    const dropdown = document.getElementById("options-dropdown")
    const databaseOptions = document.getElementById("app-options");
    const databaseOptions2 = document.getElementById("database-options");

    dropdown.addEventListener("change", function() {
        handleDropdownChange();
    });

    function handleDropdownChange() {
        if (dropdown.value === "connect-db") {
            databaseOptions2.style.display = "block";
            databaseOptions.style.display = "none";
        }
        else if(dropdown.value === "connect-app"){
            databaseOptions2.style.display = "none";
            databaseOptions.style.display = "block";
        }
        // else {
        //     databaseOptions.style.display = "none";
        //     databaseOptions2.style.display = "block";
        // }
    }

    window.handleDatabaseOption = function(option) {
        console.log("Selected database option:", option);

        fetch('/connect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ db_type: option })
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
