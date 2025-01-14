function go() {
	let doc = document.getElementsByTagName("html")[0].innerHTML
	while (true) {
		let s = doc.search("##put ")
		if (s == -1) {
			break
		}
		let e = doc.search(" ##end")
		let url = doc.substring(s + 6, e)
		const xhr = new XMLHttpRequest()
		xhr.open("GET", url)
		xhr.send()
		xhr.responseType = "text"
		xhr.onload = () => {
			if (xhr.readyState == 4 && xhr.status == 200) {
				const data = xhr.response
				console.log(data)
				doc = doc.slice(0, s) + data + doc.slice(e + 6)
				document.getElementsByTagName("html")[0].innerHTML = doc
			} else {
				console.log(`Error: ${xhr.status}`)
			}
		}
		break
	}
}
go()
