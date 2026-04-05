//go:build !windows

package main

// Stubs so `go build`/`go vet` work on Linux/macOS. The production binary is
// Windows-only; these let CI and local dev on non-Windows machines still
// typecheck the rest of the tree.

type Sample struct {
	App    string
	Title  string
	IdleMs uint32
}

func Snapshot() Sample {
	return Sample{App: "stub", Title: "non-windows build", IdleMs: 0}
}
