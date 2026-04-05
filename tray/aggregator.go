package main

import (
	"strings"
	"sync"
	"time"
)

// Bucket is one row the agent will POST to /api/ingest/desktop. One bucket per
// (minute-start, app, title, category).
type Bucket struct {
	TS       int64  `json:"ts"`
	ActiveMs int64  `json:"active_ms"`
	IdleMs   int64  `json:"idle_ms"`
	App      string `json:"app"`
	Title    string `json:"title"`
	Category string `json:"category"`
	Host     string `json:"host"`
}

type bucketKey struct {
	minute int64
	app    string
	title  string
}

// Aggregator folds poll samples into 1-minute buckets keyed by (app, title).
type Aggregator struct {
	mu       sync.Mutex
	buckets  map[bucketKey]*Bucket
	hostname string
	idleMs   uint32 // threshold after which a sample counts as idle
	pollMs   int64  // ms per sample
}

func NewAggregator(hostname string, idleSec int, pollSec int) *Aggregator {
	return &Aggregator{
		buckets:  make(map[bucketKey]*Bucket),
		hostname: hostname,
		idleMs:   uint32(idleSec) * 1000,
		pollMs:   int64(pollSec) * 1000,
	}
}

// Record folds a single Snapshot() reading.
func (a *Aggregator) Record(s Sample, now time.Time) {
	a.mu.Lock()
	defer a.mu.Unlock()

	minute := now.Truncate(time.Minute).UnixMilli()
	app := s.App
	if app == "" {
		app = "unknown"
	}
	title := redactTitle(s.Title)
	key := bucketKey{minute: minute, app: app, title: title}
	b, ok := a.buckets[key]
	if !ok {
		b = &Bucket{
			TS:       minute,
			App:      app,
			Title:    title,
			Category: categorize(app, s.Title),
			Host:     a.hostname,
		}
		a.buckets[key] = b
	}
	if s.IdleMs >= a.idleMs {
		b.IdleMs += a.pollMs
	} else {
		b.ActiveMs += a.pollMs
	}
}

// Drain returns all finalised buckets (everything from older minutes than
// now's minute) and clears them from the map. The in-progress minute stays.
func (a *Aggregator) Drain(now time.Time) []Bucket {
	a.mu.Lock()
	defer a.mu.Unlock()
	currentMinute := now.Truncate(time.Minute).UnixMilli()
	out := make([]Bucket, 0, len(a.buckets))
	for k, b := range a.buckets {
		if k.minute < currentMinute {
			out = append(out, *b)
			delete(a.buckets, k)
		}
	}
	return out
}

// DrainAll flushes even the current in-progress minute. Called on quit/pause.
func (a *Aggregator) DrainAll() []Bucket {
	a.mu.Lock()
	defer a.mu.Unlock()
	out := make([]Bucket, 0, len(a.buckets))
	for _, b := range a.buckets {
		out = append(out, *b)
	}
	a.buckets = make(map[bucketKey]*Bucket)
	return out
}

// redactTitle trims unbounded window titles and strips obvious secrets like
// bearer tokens in URLs that sometimes leak into title bars.
func redactTitle(title string) string {
	title = strings.TrimSpace(title)
	if len(title) > 200 {
		title = title[:200]
	}
	return title
}

// categorize maps (app, title) to a coarse work category so dashboards can
// roll up Outlook/Teams as "Comms", Word/Excel as "Docs", etc.
func categorize(app, title string) string {
	a := strings.ToLower(app)
	t := strings.ToLower(title)
	switch {
	case containsAny(a, "outlook", "thunderbird", "mailbird", "teams", "slack", "zoom", "webex", "skype", "discord"):
		return "Comms"
	case containsAny(a, "excel", "winword", "powerpnt", "onenote", "acrobat", "acrord32", "wps"):
		return "Docs"
	case containsAny(a, "code", "devenv", "idea", "pycharm", "goland", "webstorm", "rider", "clion", "sublime_text", "notepad++", "cursor"):
		return "Dev"
	case containsAny(a, "chrome", "msedge", "firefox", "brave", "opera", "vivaldi", "arc"):
		return "Browser"
	case containsAny(a, "explorer") && t == "":
		return "Shell"
	case containsAny(a, "spotify", "wmplayer", "vlc"):
		return "Media"
	default:
		return "Other"
	}
}

func containsAny(s string, subs ...string) bool {
	for _, sub := range subs {
		if strings.Contains(s, sub) {
			return true
		}
	}
	return false
}
