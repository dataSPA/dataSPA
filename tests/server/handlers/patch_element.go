package handlers

import (
	"fmt"
	"net/http"
)

// PatchElementHarness serves the HTML harness page for the patch_element test.
// The page loads the datastar bundle and calls @get('/tests/patch_element/data')
// on init, which triggers the SSE endpoint below.
func PatchElementHarness(bundleURL string) http.HandlerFunc {
	html := fmt.Sprintf(`<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script type="importmap">{"imports":{"datastar":"%s"}}</script>
  <script type="module" src="%s"></script>
</head>
<body>
  <div data-init="@get('/tests/patch_element/data')">
    <code id="result">0</code>
  </div>
</body>
</html>`, bundleURL, bundleURL)

	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		fmt.Fprint(w, html)
	}
}

// PatchElementData streams a single datastar-patch-elements SSE event that
// replaces the #result element with the value "1".
func PatchElementData() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/event-stream")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Connection", "keep-alive")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		fmt.Fprintf(w, "event: datastar-patch-elements\n")
		fmt.Fprintf(w, "data: elements <code id=\"result\">1</code>\n")
		fmt.Fprintf(w, "\n")

		if f, ok := w.(http.Flusher); ok {
			f.Flush()
		}
	}
}
