console.log("script loaded")
let apiNode = document.getElementById("api-response")

//working on this later
let response = fetch('/copyeditor/api_url')
    .then(response => response.json())
    .then(data => {
        console.log(data.message);
        apiNode.innerHTML = data.message
        })
        