console.log("script loaded")
const apiNode = document.getElementById("api-response")

async function fetchData() {
    try {
        const response = await fetch('api_url');
        const data = await response.json();
        console.log(data.message);
        apiNode.innerHTML = data.message
    } catch (error) {
        console.error('Error:', error);
    }
}
fetchData();

// // using fetch:
    // fetch('/copyeditor/api_url')
    //     .then(response => response.json())
    //     .then(data => {
    //         apiNode.innerHTML = data.message
    //         })

// // async with error catching
// async function fetchDataAndUpdateDOM() {
//     try {
//         const response = await fetch('/copyeditor/api_url');
        
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
        
//         const data = await response.json();
//         apiNode.innerHTML = data.message; // Set innerHTML here
//     } catch (error) {
//         console.error('Error fetching data:', error);
//         apiNode.innerHTML = 'An error occurred while fetching data.';
//     }
// }

// fetchDataAndUpdateDOM();
