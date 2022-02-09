var currentURL = window.location;
var server = "https://europe-central2-cloudcomputing-334315.cloudfunctions.net/fake_detection";


function loadXMLDoc(theURL, callback) {
    let content = new XMLHttpRequest();

    //open a connection to get the page content from the url in the async manner
    content.open("GET", theURL, true);
    //if the readyState of XHR changes, the following function is called
    content.onreadystatechange = function () {
        //readyState = 4 means that everything is done; status 200 means OK
        if (content.readyState === 4 && content.status === 200) {
            //adding value of the array type for the call of the callback
            callback.apply(content);
        }
    };

    //send the request
    content.send();
}

//fetch to send the content to the server
async function postData(data) {
    console.log(data)
    const response = await fetch(server, {
        mode: "cors",
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain'
        },
        body: data
    })
    if (response.status === 200) {
        const responseText = await response.text()
        return responseText
    } else {
        return "bad response"
    }
}

function extractContentFromHtml(html) {
    let temp = document.createElement('div');
    temp.innerHTML = html;
    let articles = temp.getElementsByTagName("article");
    if (articles.length === 0) {
        return "wrongWebpageFormat";
    }
    article = articles[0].innerHTML;
    return normalize(article);

}

function normalize(article) {
    let temp = document.createElement('div');
    temp.innerHTML = article;
    let paragraphs = temp.getElementsByTagName("p");
    let content = "";
    for (var i = 0; i < paragraphs.length; i++) {
        content = content.concat(paragraphs[i].innerText, " ");
    }
    return content;
}

var wrongWebpageFormat = false;

loadXMLDoc(currentURL,
    async function () {
        let content = extractContentFromHtml(this.responseText);

        if (content === "wrongWebpageFormat") {
            wrongWebpageFormat = true;
            alert("Incorrect webpage format. Are you sure this is an article?");
        } else {
            var response = await postData(content);
            console.log("Response: " + response)
            if (response === "True") {
                alert('This content is not fake.')
            } else if (response === "False") {
                alert('This content is fake.')
            } else if (response === "nothing sent for prediction") {
                alert('Nothing sent for prediction.')
            } else if (response === "bad response ") {
                alert("Wrong response!")
            } else {
                alert("An unexpected error has occurred.")
            }
        }
    });
