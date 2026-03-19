package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/starfederation/datastar/tests/server/handlers"
)

func main() {
	var bundlePath string
	var port int

	flag.StringVar(&bundlePath, "bundle", "", "Path to the JS bundle file to serve")
	flag.IntVar(&port, "port", 7331, "Port to listen on")
	flag.Parse()

	if bundlePath == "" {
		fmt.Fprintln(os.Stderr, "ERROR: --bundle flag is required")
		os.Exit(1)
	}

	if _, err := os.Stat(bundlePath); os.IsNotExist(err) {
		fmt.Fprintf(os.Stderr, "ERROR: bundle file not found: %s\n", bundlePath)
		os.Exit(1)
	}

	bundleURL := fmt.Sprintf("http://localhost:%d/bundle.js", port)

	mux := http.NewServeMux()

	// Serve the JS bundle
	mux.HandleFunc("GET /bundle.js", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/javascript")
		http.ServeFile(w, r, bundlePath)
	})

	// patch_element test
	mux.HandleFunc("GET /tests/patch_element", handlers.PatchElementHarness(bundleURL))
	mux.HandleFunc("GET /tests/patch_element/data", handlers.PatchElementData())

	addr := fmt.Sprintf(":%d", port)
	log.Printf("Test server listening on http://localhost%s", addr)
	log.Printf("Serving bundle: %s", bundlePath)

	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
