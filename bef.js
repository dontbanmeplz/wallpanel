function mtms(millis) {
	var minutes = Math.floor(millis / 60000);
	var seconds = ((millis % 60000) / 1000).toFixed(0);
	return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}
const redirect_uri = "http://localhost:8000/"; // Your redirect uri
// Restore tokens from localStorage
var access_token = localStorage.getItem("access_token") || null;
var refresh_token = localStorage.getItem("refresh_token") || null;
let expires_at = localStorage.getItem("expires_at") || null;
// If the user has accepted the authorize request spotify will come back to your application with the code in the response query string
// Example: http://127.0.0.1:8080/?code=NApCCg..BkWtQ&state=profile%2Factivity
const args = new URLSearchParams(window.location.search);
const code = args.get("code");

if (code) {
	// we have received the code from spotify and will exchange it for a access_token
	exchangeToken(code);
} else if (access_token && refresh_token && expires_at) {
	// we are already authorized and reload our tokens from localStorage

	getUserData();
} else {
	// we are not logged in so show the login button
	redirectToSpotifyAuthorizeEndpoint();
}
